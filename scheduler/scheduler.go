package scheduler

import (
	"fmt"
	"log"
	"time"
)

func Run() error {
	if err := DeletePendingTasks(); err != nil {
		return err
	}

	startDate, endDate := getNextWeek()

	deadlineOrders, err := GetDeadlineOrders()

	if err != nil {
		return fmt.Errorf("failed to fetch orders with deadlines, error: %w", err)
	}

	tasksWithDeadlines := []TaskChainItem{}

	for _, order := range deadlineOrders {
		for _, detail := range order.OrderDetails {
			newTasks, err := CalculateTaskChain(detail, *order.DueDate)

			if err != nil {
				return fmt.Errorf("failed to calculate task chain for order detail %s with error %w", detail.ID, err)
			}

			tasksWithDeadlines = append(tasksWithDeadlines, newTasks...)
		}
	}

	tasksWithDeadlinesWithinDateRange := []TaskChainItem{}

	for _, task := range tasksWithDeadlines {
		if endDate.Before(task.StartDate) {
			continue
		}

		tasksWithDeadlinesWithinDateRange = append(tasksWithDeadlinesWithinDateRange, task)
	}

	weekSchedule := make(WeekSchedule)
	orderDetailLastCompletion := make(map[string]time.Time)

	for day := startDate; !day.After(endDate); day = day.AddDate(0, 0, 1) {
		if len(tasksWithDeadlinesWithinDateRange) == 0 {
			break
		}

		capacity := WeeklySchedule[day.Weekday()]
		dayTasks := []TaskToCreate{}
		var dayFocus StepKey

		if capacity <= 0 {
			continue
		}

		anyTaskScheduled := false

		for i := 0; i < len(tasksWithDeadlinesWithinDateRange); i++ {
			task := tasksWithDeadlinesWithinDateRange[i]

			earliestPossibleStart := task.StartDate
			if lastCompletion, exists := orderDetailLastCompletion[task.OrderDetailId]; exists {
				if lastCompletion.After(earliestPossibleStart) {
					earliestPossibleStart = lastCompletion
				}
			}

			if earliestPossibleStart.After(day) {
				if day.Equal(endDate) {
					tasksWithDeadlinesWithinDateRange = append(tasksWithDeadlinesWithinDateRange[:i], tasksWithDeadlinesWithinDateRange[i+1:]...)
					i -= 1
				}
				continue
			}

			isExternalProcess := task.TaskType == TaskTypeBisque || task.TaskType == TaskTypeFire

			if dayFocus == "" {
				if !isExternalProcess {
					dayFocus = task.OrderDetailStatus
				}
			} else if task.OrderDetailStatus != dayFocus && !isExternalProcess {
				continue
			}

			if capacity <= 0 && !isExternalProcess {
				break
			}

			piecesForDay := min(CalculateQuantity(capacity, task.TaskType, task.PieceType), task.Quantity)
			hoursUsed := CalculateHours(task.TaskType, task.PieceType, piecesForDay)

			if piecesForDay == 0 && task.Quantity > 0 {
				piecesForDay = task.Quantity
				hoursUsed = CalculateHours(task.TaskType, task.PieceType, piecesForDay)
			}

			if hoursUsed > capacity*1.1 {
				continue
			}

			dayTasks = append(dayTasks, TaskToCreate{
				OrderDetailId:  task.OrderDetailId,
				Date:           day,
				TaskType:       task.TaskType,
				Quantity:       piecesForDay,
				EstimatedHours: hoursUsed,
				IsLate:         task.StartDate.Before(startDate),
			})
			capacity -= hoursUsed
			anyTaskScheduled = true

			completionDate := calculateTaskCompletion(day, task.TaskType, task.PieceType, piecesForDay)
			orderDetailLastCompletion[task.OrderDetailId] = completionDate

			if piecesForDay >= task.Quantity {
				tasksWithDeadlinesWithinDateRange = append(tasksWithDeadlinesWithinDateRange[:i], tasksWithDeadlinesWithinDateRange[i+1:]...)
				i -= 1
			} else {
				tasksWithDeadlinesWithinDateRange[i].Quantity -= piecesForDay
			}

		}

		weekSchedule[day] = &DaySchedule{
			Weekday:        day.Weekday(),
			Tasks:          dayTasks,
			AvailableHours: capacity,
			Mode:           dayFocus,
		}

		if !anyTaskScheduled && day.Equal(endDate) {
			break
		}

	}

	nonDeadlineOrders, err := GetNonDeadlineOrders()

	if err != nil {
		return fmt.Errorf("failed to fetch orders without deadlines, error: %w", err)
	}

	tasksWithoutDeadlines := []TaskChainItem{}

	for _, order := range nonDeadlineOrders {
		for _, detail := range order.OrderDetails {
			timeline, err := time.Parse("2006-01-02", order.Timeline)

			if err != nil {
				return fmt.Errorf("failed to parse timeline with error %w", err)

			}

			newTasks, err := CalculateTaskChain(detail, timeline.AddDate(0, 1, 0).UTC())

			if err != nil {
				return fmt.Errorf("failed to calculate task chain for order detail %s with error %w", detail.ID, err)
			}

			tasksWithoutDeadlines = append(tasksWithoutDeadlines, newTasks...)
		}
	}

	for day := startDate; !day.After(endDate); day = day.AddDate(0, 0, 1) {
		daySchedule := weekSchedule[day]

		if daySchedule == nil {
			if len(tasksWithoutDeadlines) == 0 {
				break
			}

			var initialMode StepKey
			for _, task := range tasksWithoutDeadlines {
				if task.TaskType != TaskTypeBisque && task.TaskType != TaskTypeFire {
					initialMode = task.OrderDetailStatus
					break
				}
			}

			daySchedule = &DaySchedule{
				Weekday:        day.Weekday(),
				Tasks:          []TaskToCreate{},
				Mode:           initialMode,
				AvailableHours: WeeklySchedule[day.Weekday()],
			}
		}

		if daySchedule.AvailableHours <= 0 && daySchedule.Mode != "" {
			continue
		}

		anyTaskScheduled := false

		for i := 0; i < len(tasksWithoutDeadlines); i++ {

			task := tasksWithoutDeadlines[i]

			earliestPossibleStart := task.StartDate
			if lastCompletion, exists := orderDetailLastCompletion[task.OrderDetailId]; exists {
				if lastCompletion.After(earliestPossibleStart) {
					earliestPossibleStart = lastCompletion
				}
			}

			if earliestPossibleStart.After(day) {
				if day.Equal(endDate) {
					tasksWithoutDeadlines = append(tasksWithoutDeadlines[:i], tasksWithoutDeadlines[i+1:]...)
					i -= 1
				}
				continue
			}

			isExternalProcess := task.TaskType == TaskTypeBisque || task.TaskType == TaskTypeFire

			if daySchedule.Mode == "" && !isExternalProcess {
				daySchedule.Mode = task.OrderDetailStatus
			}

			if task.OrderDetailStatus != daySchedule.Mode && !isExternalProcess {
				continue
			}

			if daySchedule.AvailableHours <= 0 && !isExternalProcess {
				break
			}

			piecesForDay := min(CalculateQuantity(daySchedule.AvailableHours, task.TaskType, task.PieceType), task.Quantity)
			hoursUsed := CalculateHours(task.TaskType, task.PieceType, piecesForDay)

			if piecesForDay == 0 && task.Quantity > 0 {
				piecesForDay = task.Quantity
				hoursUsed = CalculateHours(task.TaskType, task.PieceType, piecesForDay)
			}

			if hoursUsed > daySchedule.AvailableHours*1.1 {
				continue
			}

			daySchedule.Tasks = append(daySchedule.Tasks, TaskToCreate{
				OrderDetailId:  task.OrderDetailId,
				Date:           day,
				TaskType:       task.TaskType,
				Quantity:       piecesForDay,
				EstimatedHours: hoursUsed,
				IsLate:         task.StartDate.Before(startDate),
			})
			daySchedule.AvailableHours -= hoursUsed
			anyTaskScheduled = true

			completionDate := calculateTaskCompletion(day, task.TaskType, task.PieceType, piecesForDay)
			orderDetailLastCompletion[task.OrderDetailId] = completionDate

			if piecesForDay >= task.Quantity {
				tasksWithoutDeadlines = append(tasksWithoutDeadlines[:i], tasksWithoutDeadlines[i+1:]...)
				i -= 1
			} else {
				tasksWithoutDeadlines[i].Quantity -= piecesForDay
			}

		}

		weekSchedule[day] = daySchedule

		if !anyTaskScheduled && len(tasksWithoutDeadlines) > 0 && day.Equal(endDate) {
			break
		}

	}

	LogInfo("deadline_orders", map[string]any{
		"numberOrDeadlineOrders":           len(deadlineOrders),
		"tasksWithDeadlines":               len(tasksWithDeadlines),
		"tasksWithDeadlinesInTheTimeRange": len(tasksWithDeadlinesWithinDateRange),
		"numberOfNonDeadlineOrders":        len(nonDeadlineOrders),
		"tasksWithoutDeadlines":            len(tasksWithoutDeadlines),
		"weeklySchedule":                   weekSchedule,
	})

	for day, schedule := range weekSchedule {
		err := InsertTasks(schedule.Tasks)

		if err != nil {
			return fmt.Errorf("failed to insert tasks for day %s with error %w", day, err)
		}

	}

	return nil
}

func calculateTaskCompletion(scheduledDate time.Time, taskType TaskType, pieceType PieceType, quantity int) time.Time {
	process := ProductionProcess[pieceType]

	var dryingDays int
	var workDays int

	for _, step := range process {
		if step.TaskType == taskType {
			dryingDays = step.DryingDays
			if step.Rate > 0 {
				workDays = int(float64(quantity)/step.Rate + 0.999)
			}
			break
		}
	}

	if taskType == TaskTypeBisque || taskType == TaskTypeFire {
		return scheduledDate.AddDate(0, 0, dryingDays)
	}

	return scheduledDate.AddDate(0, 0, workDays+dryingDays)
}

func getNextWeek() (startDate, endDate time.Time) {
	now := time.Now()

	startDate = now.AddDate(0, 0, 1)

	daysUntilSaturday := (int(time.Saturday) - int(startDate.Weekday()) + 7) % 7
	if daysUntilSaturday == 0 {
		daysUntilSaturday = 7
	}

	endDate = startDate.AddDate(0, 0, daysUntilSaturday)

	return
}

func LogInfo(logBody string, context map[string]any) {
	safeContext := make(map[string]any)
	for k, v := range context {
		if k != "email" && k != "phone" && k != "name" && k != "customerName" {
			safeContext[k] = v
		} else {
			if str, ok := v.(string); ok {
				safeContext[k+"_length"] = len(str)
				safeContext[k+"_has_value"] = str != ""
			}
		}
	}

	log.Printf("LOG [%s] | Context: %+v", logBody, safeContext)

}
