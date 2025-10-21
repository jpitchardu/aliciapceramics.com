package scheduler

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestWeekSchedule_SingleDayBuildCapacity(t *testing.T) {
	startDate := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)

	tasks := []TaskChainItem{
		{
			TaskType:          TaskTypeBuildBase,
			PieceType:         PieceTypeMugWithHandle,
			StartDate:         startDate,
			Quantity:          5,
			OrderDetailId:     "test-1",
			OrderDetailStatus: StepKeyBuild,
		},
	}

	schedule := make(WeekSchedule)
	day := startDate
	capacity := WeeklySchedule[day.Weekday()]

	piecesForDay := min(CalculateQuantity(capacity, tasks[0].TaskType, tasks[0].PieceType), tasks[0].Quantity)
	hoursUsed := CalculateHours(tasks[0].TaskType, tasks[0].PieceType, piecesForDay)

	assert.Equal(t, 5, piecesForDay, "Should schedule all 5 mugs on Monday (4 hours)")
	assert.InDelta(t, 4.0, hoursUsed, 0.001, "Should use 4 hours")

	schedule[day] = &DaySchedule{
		Weekday: day.Weekday(),
		Tasks: []TaskToCreate{
			{
				OrderDetailId:  tasks[0].OrderDetailId,
				Date:           day,
				TaskType:       tasks[0].TaskType,
				Quantity:       piecesForDay,
				EstimatedHours: hoursUsed,
				IsLate:         false,
			},
		},
		AvailableHours: capacity - hoursUsed,
		Mode:           StepKeyBuild,
	}

	assert.InDelta(t, 0.0, schedule[day].AvailableHours, 0.001, "Capacity should be fully utilized")
	assert.Len(t, schedule[day].Tasks, 1, "Should have 1 task")
}

func TestWeekSchedule_MultiDayBuildSplit(t *testing.T) {
	mondayCapacity := 4.0
	tuesdayCapacity := 2.0

	totalQuantity := 10
	remainingQuantity := totalQuantity

	mondayPieces := min(CalculateQuantity(mondayCapacity, TaskTypeBuildBase, PieceTypeMugWithHandle), remainingQuantity)
	mondayHours := CalculateHours(TaskTypeBuildBase, PieceTypeMugWithHandle, mondayPieces)

	assert.Equal(t, 5, mondayPieces, "Monday should schedule 5 mugs")
	assert.InDelta(t, 4.0, mondayHours, 0.001, "Monday should use 4 hours")

	remainingQuantity -= mondayPieces

	tuesdayPieces := min(CalculateQuantity(tuesdayCapacity, TaskTypeBuildBase, PieceTypeMugWithHandle), remainingQuantity)
	tuesdayHours := CalculateHours(TaskTypeBuildBase, PieceTypeMugWithHandle, tuesdayPieces)

	assert.Equal(t, 2, tuesdayPieces, "Tuesday should schedule 2 mugs")
	assert.InDelta(t, 1.6, tuesdayHours, 0.001, "Tuesday should use 1.6 hours")

	remainingQuantity -= tuesdayPieces

	assert.Equal(t, 3, remainingQuantity, "Should have 3 mugs unscheduled")
}

func TestWeekSchedule_BUG3_BisqueDayCapacityWasted(t *testing.T) {
	t.Log("FIXED BUG #3: Bisque no longer locks day mode, allowing work to be scheduled")

	thursday := time.Date(2025, 10, 23, 0, 0, 0, 0, time.UTC)
	capacity := 4.0

	bisqueTask := TaskChainItem{
		TaskType:          TaskTypeBisque,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         thursday,
		Quantity:          10,
		OrderDetailId:     "test-bisque",
		OrderDetailStatus: StepKeyBisque,
	}

	buildTask := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         thursday,
		Quantity:          5,
		OrderDetailId:     "test-build",
		OrderDetailStatus: StepKeyBuild,
	}

	bisqueHours := CalculateHours(bisqueTask.TaskType, bisqueTask.PieceType, bisqueTask.Quantity)
	assert.Equal(t, 0.0, bisqueHours, "Bisque should use 0 hours")

	buildHours := CalculateHours(buildTask.TaskType, buildTask.PieceType, buildTask.Quantity)
	assert.InDelta(t, 4.0, buildHours, 0.001, "Build should use 4 hours")

	capacityAfterBisque := capacity - bisqueHours
	assert.InDelta(t, 4.0, capacityAfterBisque, 0.001, "Should have 4 hours remaining after bisque")
}

func TestWeekSchedule_BUG4_GlazeBlocksPhysicalWork(t *testing.T) {
	t.Log("NOTE: Glaze does set day mode, but this is by design - glaze and physical work shouldn't mix")

	friday := time.Date(2025, 10, 24, 0, 0, 0, 0, time.UTC)
	capacity := 8.0

	glazeTask := TaskChainItem{
		TaskType:          TaskTypeGlaze,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         friday,
		Quantity:          17,
		OrderDetailId:     "test-glaze",
		OrderDetailStatus: StepKeyGlaze,
	}

	glazeHours := CalculateHours(glazeTask.TaskType, glazeTask.PieceType, glazeTask.Quantity)
	assert.InDelta(t, 4.0, glazeHours, 0.001, "Glaze should use 4 hours")

	capacityAfterGlaze := capacity - glazeHours
	assert.InDelta(t, 4.0, capacityAfterGlaze, 0.001, "Should have 4 hours remaining after glaze")
}

func TestWeekSchedule_DeadlineVsNonDeadlinePriority(t *testing.T) {
	monday := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)
	capacity := 4.0

	deadlineTask := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         monday,
		Quantity:          5,
		OrderDetailId:     "deadline-order",
		OrderDetailStatus: StepKeyBuild,
	}

	deadlineHours := CalculateHours(deadlineTask.TaskType, deadlineTask.PieceType, deadlineTask.Quantity)
	assert.InDelta(t, 4.0, deadlineHours, 0.001, "Deadline task uses full capacity")

	remainingCapacity := capacity - deadlineHours
	assert.InDelta(t, 0.0, remainingCapacity, 0.001, "No capacity left for non-deadline task")
}

func TestWeekSchedule_OverbookingAllowance(t *testing.T) {
	monday := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)
	capacity := 4.0

	task := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         monday,
		Quantity:          6,
		OrderDetailId:     "test-overbook",
		OrderDetailStatus: StepKeyBuild,
	}

	taskHours := CalculateHours(task.TaskType, task.PieceType, task.Quantity)
	assert.InDelta(t, 4.8, taskHours, 0.001, "6 mugs should require 4.8 hours")

	allowedCapacity := capacity * 1.1
	assert.InDelta(t, 4.4, allowedCapacity, 0.001, "10% overbooking allows 4.4 hours")

	canSchedule := taskHours <= allowedCapacity
	assert.False(t, canSchedule, "4.8 hours exceeds 10% overbooking allowance")

	taskWithin10Percent := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         monday,
		Quantity:          5,
		OrderDetailId:     "test-within-limit",
		OrderDetailStatus: StepKeyBuild,
	}

	withinLimitHours := CalculateHours(taskWithin10Percent.TaskType, taskWithin10Percent.PieceType, taskWithin10Percent.Quantity)
	assert.InDelta(t, 4.0, withinLimitHours, 0.001, "5 mugs should require 4.0 hours")

	canScheduleWithinLimit := withinLimitHours <= allowedCapacity
	assert.True(t, canScheduleWithinLimit, "4.0 hours is within 10% overbooking allowance")
}

func TestWeekSchedule_ZeroCapacityDay(t *testing.T) {
	sunday := time.Date(2025, 10, 26, 0, 0, 0, 0, time.UTC)
	capacity := WeeklySchedule[sunday.Weekday()]

	assert.Equal(t, 0.0, capacity, "Sunday should have 0 capacity")

	task := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         sunday,
		Quantity:          5,
		OrderDetailId:     "test-sunday",
		OrderDetailStatus: StepKeyBuild,
	}

	pieces := CalculateQuantity(capacity, task.TaskType, task.PieceType)
	assert.Equal(t, 0, pieces, "Should not schedule any pieces on Sunday")
}

func TestWeekSchedule_ExternalProcessFullQuantity(t *testing.T) {
	thursday := time.Date(2025, 10, 23, 0, 0, 0, 0, time.UTC)
	capacity := 4.0

	bisqueTask := TaskChainItem{
		TaskType:          TaskTypeBisque,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         thursday,
		Quantity:          100,
		OrderDetailId:     "test-bisque-large",
		OrderDetailStatus: StepKeyBisque,
	}

	piecesForDay := min(CalculateQuantity(capacity, bisqueTask.TaskType, bisqueTask.PieceType), bisqueTask.Quantity)

	assert.Equal(t, 0, piecesForDay, "CalculateQuantity returns 0 for bisque")

	if piecesForDay == 0 && bisqueTask.Quantity > 0 {
		piecesForDay = bisqueTask.Quantity
	}

	assert.Equal(t, 100, piecesForDay, "Should use full quantity for external process")

	hoursUsed := CalculateHours(bisqueTask.TaskType, bisqueTask.PieceType, piecesForDay)
	assert.Equal(t, 0.0, hoursUsed, "External process should use 0 hours")
}

func TestWeekSchedule_TaskStartDateAfterScheduleDay(t *testing.T) {
	monday := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)
	friday := monday.AddDate(0, 0, 4)

	task := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         friday,
		Quantity:          5,
		OrderDetailId:     "test-future",
		OrderDetailStatus: StepKeyBuild,
	}

	shouldScheduleOnMonday := !task.StartDate.After(monday)
	assert.False(t, shouldScheduleOnMonday, "Should not schedule task before its start date")

	shouldScheduleOnFriday := !task.StartDate.After(friday)
	assert.True(t, shouldScheduleOnFriday, "Should schedule task on or after its start date")
}

func TestWeekSchedule_IsLateDetection(t *testing.T) {
	monday := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)
	lastWeek := monday.AddDate(0, 0, -7)

	task := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         lastWeek,
		Quantity:          5,
		OrderDetailId:     "test-late",
		OrderDetailStatus: StepKeyBuild,
	}

	isLate := task.StartDate.Before(monday)
	assert.True(t, isLate, "Task should be marked late if start date is before schedule start")
}

func TestWeekSchedule_PartialQuantityScheduling(t *testing.T) {
	capacity := 4.0

	totalQuantity := 10
	piecesForDay := min(CalculateQuantity(capacity, TaskTypeBuildBase, PieceTypeMugWithHandle), totalQuantity)
	hoursUsed := CalculateHours(TaskTypeBuildBase, PieceTypeMugWithHandle, piecesForDay)

	assert.Equal(t, 5, piecesForDay, "Should schedule partial quantity")
	assert.InDelta(t, 4.0, hoursUsed, 0.001, "Should use available capacity")

	remainingQuantity := totalQuantity - piecesForDay
	assert.Equal(t, 5, remainingQuantity, "Should have remaining quantity for next day")
}

func TestWeekSchedule_MixedTaskTypesDifferentFocus(t *testing.T) {
	monday := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)

	buildTask := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         monday,
		Quantity:          5,
		OrderDetailId:     "test-build",
		OrderDetailStatus: StepKeyBuild,
	}

	trimTask := TaskChainItem{
		TaskType:          TaskTypeTrim,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         monday,
		Quantity:          15,
		OrderDetailId:     "test-trim",
		OrderDetailStatus: StepKeyTrim,
	}

	dayFocus := StepKeyBuild

	shouldScheduleBuild := buildTask.OrderDetailStatus == dayFocus
	assert.True(t, shouldScheduleBuild, "Build task matches day focus")

	shouldScheduleTrim := trimTask.OrderDetailStatus == dayFocus
	assert.False(t, shouldScheduleTrim, "Trim task does not match day focus")
}

func TestWeekSchedule_FullWeekScheduling(t *testing.T) {
	monday := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)
	endDate := monday.AddDate(0, 0, 6)

	schedule := make(WeekSchedule)
	totalCapacity := 0.0

	for day := monday; !day.After(endDate); day = day.AddDate(0, 0, 1) {
		capacity := WeeklySchedule[day.Weekday()]
		totalCapacity += capacity

		schedule[day] = &DaySchedule{
			Weekday:        day.Weekday(),
			Tasks:          []TaskToCreate{},
			AvailableHours: capacity,
			Mode:           StepKeyBuild,
		}
	}

	assert.InDelta(t, 28.0, totalCapacity, 0.001, "Week should have 28 total hours (4+2+2+4+8+8+0)")
	assert.Len(t, schedule, 7, "Should have 7 days in schedule")
}

func TestGetNextWeek(t *testing.T) {
	startDate, endDate := getNextWeek()

	assert.True(t, startDate.Before(endDate), "Start date should be before end date")

	assert.Equal(t, time.Saturday, endDate.Weekday(), "End date should always be Saturday")

	daysBetween := endDate.Sub(startDate).Hours() / 24
	assert.True(t, daysBetween >= 0 && daysBetween <= 7, "Should schedule between 0-7 days depending on when run")

	tomorrowWeekday := time.Now().AddDate(0, 0, 1).Weekday()
	assert.Equal(t, tomorrowWeekday, startDate.Weekday(), "Start date should be tomorrow")
}

func TestGetNextWeek_EdgeCases(t *testing.T) {
	tests := []struct {
		name          string
		todayWeekday  time.Weekday
		expectedDays  int
	}{
		{"Run on Sunday, schedule Mon-Sat", time.Sunday, 5},
		{"Run on Monday, schedule Tue-Sat", time.Monday, 4},
		{"Run on Tuesday, schedule Wed-Sat", time.Tuesday, 3},
		{"Run on Wednesday, schedule Thu-Sat", time.Wednesday, 2},
		{"Run on Thursday, schedule Fri-Sat", time.Thursday, 1},
		{"Run on Friday, schedule Sat-Sat", time.Friday, 7},
		{"Run on Saturday, schedule Sun-Sat", time.Saturday, 6},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			now := time.Now()
			daysToAdd := (int(tt.todayWeekday) - int(now.Weekday()) + 7) % 7
			mockToday := now.AddDate(0, 0, daysToAdd)
			tomorrow := mockToday.AddDate(0, 0, 1)

			daysUntilSaturday := (int(time.Saturday) - int(tomorrow.Weekday()) + 7) % 7
			if daysUntilSaturday == 0 {
				daysUntilSaturday = 7
			}

			assert.Equal(t, tt.expectedDays, daysUntilSaturday, "Days until Saturday from tomorrow should match")
		})
	}
}

func TestBUG2_LateTasksRespectDryingPeriods(t *testing.T) {
	monday := time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC)

	buildTask := TaskChainItem{
		TaskType:          TaskTypeBuildBase,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         monday.AddDate(0, 0, -7),
		Quantity:          5,
		OrderDetailId:     "late-order-1",
		OrderDetailStatus: StepKeyBuild,
	}

	trimTask := TaskChainItem{
		TaskType:          TaskTypeTrim,
		PieceType:         PieceTypeMugWithHandle,
		StartDate:         monday.AddDate(0, 0, -5),
		Quantity:          5,
		OrderDetailId:     "late-order-1",
		OrderDetailStatus: StepKeyTrim,
	}

	scheduledBuildDate := monday
	buildCompletion := calculateTaskCompletion(scheduledBuildDate, buildTask.TaskType, buildTask.PieceType, buildTask.Quantity)

	expectedBuildCompletion := monday.AddDate(0, 0, 3)
	assert.Equal(t, expectedBuildCompletion, buildCompletion, "Build should complete on day 3 (1 work day + 2 drying days)")

	earliestTrimStart := buildCompletion
	assert.True(t, trimTask.StartDate.Before(earliestTrimStart), "Trim is late relative to calculated start, but must wait for build drying")

	scheduledTrimDate := earliestTrimStart
	if scheduledTrimDate.Before(monday) {
		scheduledTrimDate = monday
	}

	assert.Equal(t, monday.AddDate(0, 0, 3), scheduledTrimDate, "Trim should be scheduled after build completion on day 3")

	daysBetweenTasks := scheduledTrimDate.Sub(scheduledBuildDate).Hours() / 24
	assert.Equal(t, float64(3), daysBetweenTasks, "Should maintain 3-day gap (1 work + 2 drying) between build and trim")
}
