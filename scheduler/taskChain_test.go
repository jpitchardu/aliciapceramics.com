package scheduler

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCalculateTaskChain_SimpleMugWithHandle(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-1",
		Type:     "mug-with-handle",
		Quantity: 1,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	assert.Len(t, tasks, 7, "Should create 7 tasks for mug-with-handle")

	assert.Equal(t, TaskTypeBuildBase, tasks[0].TaskType)
	assert.Equal(t, time.Date(2025, 10, 15, 0, 0, 0, 0, time.UTC), tasks[0].StartDate, "Build starts with 1 work day + 2 drying days")
	assert.Equal(t, StepKeyBuild, tasks[0].OrderDetailStatus)

	assert.Equal(t, TaskTypeTrim, tasks[1].TaskType)
	assert.Equal(t, time.Date(2025, 10, 18, 0, 0, 0, 0, time.UTC), tasks[1].StartDate, "First trim: 1 work + 1 drying = 2 days")
	assert.Equal(t, StepKeyTrim, tasks[1].OrderDetailStatus)

	assert.Equal(t, TaskTypeAttachHandle, tasks[2].TaskType)
	assert.Equal(t, time.Date(2025, 10, 20, 0, 0, 0, 0, time.UTC), tasks[2].StartDate, "Attach: 1 work + 2 drying = 3 days")
	assert.Equal(t, StepKeyAttach, tasks[2].OrderDetailStatus)

	assert.Equal(t, TaskTypeTrim, tasks[3].TaskType)
	assert.Equal(t, time.Date(2025, 10, 23, 0, 0, 0, 0, time.UTC), tasks[3].StartDate, "Final trim: 1 work + 3 drying = 4 days")
	assert.Equal(t, StepKeyTrimFinal, tasks[3].OrderDetailStatus)

	assert.Equal(t, TaskTypeBisque, tasks[4].TaskType)
	assert.Equal(t, time.Date(2025, 10, 27, 0, 0, 0, 0, time.UTC), tasks[4].StartDate, "Bisque: 5 days")
	assert.Equal(t, StepKeyBisque, tasks[4].OrderDetailStatus)

	assert.Equal(t, TaskTypeGlaze, tasks[5].TaskType)
	assert.Equal(t, time.Date(2025, 11, 1, 0, 0, 0, 0, time.UTC), tasks[5].StartDate, "Glaze: 1 work day")
	assert.Equal(t, StepKeyGlaze, tasks[5].OrderDetailStatus)

	assert.Equal(t, TaskTypeFire, tasks[6].TaskType)
	assert.Equal(t, time.Date(2025, 11, 2, 0, 0, 0, 0, time.UTC), tasks[6].StartDate, "Fire: 5 days to complete on Nov 7")
	assert.Equal(t, StepKeyFire, tasks[6].OrderDetailStatus)

	for i, task := range tasks {
		assert.Equal(t, 1, task.Quantity, "All tasks should have quantity 1")
		assert.Equal(t, "test-detail-1", task.OrderDetailId)
		if i > 0 {
			assert.False(t, tasks[i].StartDate.Before(tasks[i-1].StartDate), "Tasks should be in chronological order")
		}
	}
}

func TestCalculateTaskChain_MugWithoutHandle(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-2",
		Type:     "mug-without-handle",
		Quantity: 1,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	assert.Len(t, tasks, 5, "Should create 5 tasks for mug-without-handle (no attach step)")

	stepKeys := make(map[StepKey]int)
	for _, task := range tasks {
		stepKeys[task.OrderDetailStatus]++
	}

	assert.Equal(t, 1, stepKeys[StepKeyBuild], "Should have exactly 1 build step")
	assert.Equal(t, 1, stepKeys[StepKeyTrimFinal], "Should have exactly 1 trim_final step")
	assert.Equal(t, 0, stepKeys[StepKeyAttach], "Should have no attach step")
	assert.Equal(t, 1, stepKeys[StepKeyBisque], "Should have 1 bisque step")
	assert.Equal(t, 1, stepKeys[StepKeyGlaze], "Should have 1 glaze step")
	assert.Equal(t, 1, stepKeys[StepKeyFire], "Should have 1 fire step")

	for _, task := range tasks {
		assert.NotEqual(t, TaskTypeAttachHandle, task.TaskType, "Should not have attach handle task")
		assert.NotEqual(t, TaskTypeAttachLid, task.TaskType, "Should not have attach lid task")
	}
}

func TestCalculateTaskChain_TumblerWithLid(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-3",
		Type:     "tumbler",
		Quantity: 1,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	assert.Len(t, tasks, 7, "Should create 7 tasks for tumbler")

	hasAttachLid := false
	for _, task := range tasks {
		if task.TaskType == TaskTypeAttachLid {
			hasAttachLid = true
			assert.Equal(t, StepKeyAttach, task.OrderDetailStatus)
		}
		assert.NotEqual(t, TaskTypeAttachHandle, task.TaskType, "Should use attach_lid, not attach_handle")
	}

	assert.True(t, hasAttachLid, "Should have attach_lid task")
}

func TestCalculateTaskChain_LargeQuantityMug(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-4",
		Type:     "mug-with-handle",
		Quantity: 10,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	assert.Len(t, tasks, 7, "Should create 7 tasks regardless of quantity")

	singleMugOrderDetail := OrderDetailDB{
		ID:       "test-detail-single",
		Type:     "mug-with-handle",
		Quantity: 1,
		Status:   "pending",
	}
	singleTasks, err := CalculateTaskChain(singleMugOrderDetail, dueDate)
	require.NoError(t, err)

	assert.True(t, tasks[0].StartDate.Before(singleTasks[0].StartDate), "Large quantity build should start earlier")

	for _, task := range tasks {
		assert.Equal(t, 10, task.Quantity, "All tasks should have quantity 10")
	}
}

func TestCalculateTaskChain_MatchaBowlDifferentProcess(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-5",
		Type:     "matcha-bowl",
		Quantity: 1,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	assert.Len(t, tasks, 5, "Should create 5 tasks for matcha-bowl (no attach)")

	hasAttach := false
	for _, task := range tasks {
		if task.TaskType == TaskTypeAttachHandle || task.TaskType == TaskTypeAttachLid {
			hasAttach = true
		}
	}
	assert.False(t, hasAttach, "Matcha bowl should not have attach step")

	mugOrderDetail := OrderDetailDB{
		ID:       "test-detail-mug",
		Type:     "mug-with-handle",
		Quantity: 1,
		Status:   "pending",
	}
	mugTasks, err := CalculateTaskChain(mugOrderDetail, dueDate)
	require.NoError(t, err)

	assert.True(t, tasks[0].StartDate.After(mugTasks[0].StartDate), "Matcha bowl starts later (fewer steps despite longer drying)")
}

func TestCalculateTaskChain_InProgressMug(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-6",
		Type:     "mug-with-handle",
		Quantity: 1,
		Status:   "trim",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	assert.Less(t, len(tasks), 7, "In-progress order should have fewer tasks")

	assert.NotEqual(t, TaskTypeBuildBase, tasks[0].TaskType, "Should not include build task")

	assert.Equal(t, TaskTypeTrim, tasks[0].TaskType, "Should start from trim step")
	assert.Equal(t, StepKeyTrim, tasks[0].OrderDetailStatus)
}

func TestCalculateTaskChain_InvalidPieceType(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-invalid",
		Type:     "invalid-piece-type",
		Quantity: 1,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	_, err := CalculateTaskChain(orderDetail, dueDate)
	assert.Error(t, err, "Should return error for invalid piece type")
	assert.Contains(t, err.Error(), "not valid with type")
}

func TestCalculateTaskChain_InvalidStatus(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-invalid-status",
		Type:     "mug-with-handle",
		Quantity: 1,
		Status:   "invalid-status",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	_, err := CalculateTaskChain(orderDetail, dueDate)
	assert.Error(t, err, "Should return error for invalid status")
	assert.Contains(t, err.Error(), "not valid with status")
}

func TestCalculateTaskChain_ZeroQuantity(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-detail-zero",
		Type:     "mug-with-handle",
		Quantity: 0,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	for _, task := range tasks {
		assert.Equal(t, 0, task.Quantity)
	}
}

func TestCalculateTaskChain_BUG1_DuplicateTrimStepKeys(t *testing.T) {
	t.Log("FIXED BUG #1: Mug process now has distinct 'trim' and 'trim_final' StepKeys")

	orderDetail := OrderDetailDB{
		ID:       "test-bug-1",
		Type:     "mug-with-handle",
		Quantity: 1,
		Status:   "trim",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	process := ProductionProcess[PieceTypeMugWithHandle]
	stepKeys := make(map[StepKey]int)
	for _, step := range process {
		stepKeys[step.StepKey]++
	}

	for stepKey, count := range stepKeys {
		assert.Equal(t, 1, count, "StepKey %s should appear only once", stepKey)
	}

	assert.Equal(t, TaskTypeTrim, tasks[0].TaskType, "When status is 'trim', it picks first trim step")
}

func TestCalculateTaskChain_BUG2_DryingPeriodViolation(t *testing.T) {
	t.Log("FIXED BUG #2: Drying period calculation now correctly enforced")

	orderDetail := OrderDetailDB{
		ID:       "test-bug-2",
		Type:     "mug-with-handle",
		Quantity: 1,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	buildTask := tasks[0]
	firstTrimTask := tasks[1]

	buildEndDate := buildTask.StartDate.AddDate(0, 0, 1)

	daysBetween := firstTrimTask.StartDate.Sub(buildEndDate).Hours() / 24

	assert.GreaterOrEqual(t, daysBetween, 2.0, "Should have at least 2 full days between build end and trim start")
}

func TestCalculateTaskChain_TrinketDish(t *testing.T) {
	orderDetail := OrderDetailDB{
		ID:       "test-trinket",
		Type:     "trinket-dish",
		Quantity: 30,
		Status:   "pending",
	}
	dueDate := time.Date(2025, 11, 10, 0, 0, 0, 0, time.UTC)

	tasks, err := CalculateTaskChain(orderDetail, dueDate)
	require.NoError(t, err)

	assert.Len(t, tasks, 5, "Trinket dish should have 5 tasks")

	hasAttach := false
	for _, task := range tasks {
		if task.TaskType == TaskTypeAttachHandle || task.TaskType == TaskTypeAttachLid {
			hasAttach = true
		}
	}
	assert.False(t, hasAttach, "Trinket dish should not have attach step")
}
