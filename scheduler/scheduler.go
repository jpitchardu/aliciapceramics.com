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

	for day := startDate; !day.After(endDate); day = day.AddDate(0, 0, 1) {
		if len(tasksWithDeadlinesWithinDateRange) == 0 {
			break
		}

		capacity := WeeklySchedule[day.Weekday()]
		dayTasks := []TaskToCreate{}
		dayFocus := tasksWithDeadlinesWithinDateRange[0].OrderDetailStatus

		for i := 0; i < len(tasksWithDeadlinesWithinDateRange); i++ {
			task := tasksWithDeadlinesWithinDateRange[i]

			if task.OrderDetailStatus != dayFocus || task.StartDate.After(day) {
				continue
			}

			piecesForDay := min(CalculateQuantity(capacity, task.TaskType, task.PieceType), task.Quantity)
			hoursUsed := CalculateHours(task.TaskType, task.PieceType, piecesForDay)

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
				continue
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

			daySchedule = &DaySchedule{
				Weekday:        day.Weekday(),
				Tasks:          []TaskToCreate{},
				Mode:           tasksWithoutDeadlines[0].OrderDetailStatus,
				AvailableHours: WeeklySchedule[day.Weekday()],
			}
		}

		if daySchedule.AvailableHours == 0 {
			continue
		}

		for i := 0; i < len(tasksWithoutDeadlines); i++ {

			task := tasksWithoutDeadlines[i]

			if task.OrderDetailStatus != daySchedule.Mode {
				continue
			}

			piecesForDay := min(CalculateQuantity(daySchedule.AvailableHours, task.TaskType, task.PieceType), task.Quantity)
			hoursUsed := CalculateHours(task.TaskType, task.PieceType, piecesForDay)

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

			if piecesForDay >= task.Quantity {
				tasksWithoutDeadlines = append(tasksWithoutDeadlines[:i], tasksWithoutDeadlines[i+1:]...)
				i -= 1
			} else {
				tasksWithoutDeadlines[i].Quantity -= piecesForDay
			}

		}

		weekSchedule[day] = daySchedule

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

func getNextWeek() (monday, sunday time.Time) {
	now := time.Now()

	monday = now.AddDate(0, 0, 1)
	sunday = monday.AddDate(0, 0, 6)

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
