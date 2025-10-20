package scheduler

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProductionProcess_MugWithHandle(t *testing.T) {
	process := ProductionProcess[PieceTypeMugWithHandle]

	assert.Len(t, process, 7, "Mug with handle should have 7 steps")

	expectedSteps := []struct {
		stepKey    StepKey
		taskType   TaskType
		rate       float64
		dryingDays int
	}{
		{StepKeyBuild, TaskTypeBuildBase, 5, 2},
		{StepKeyTrim, TaskTypeTrim, 15, 1},
		{StepKeyAttach, TaskTypeAttachHandle, 8, 2},
		{StepKeyTrimFinal, TaskTypeTrim, 15, 3},
		{StepKeyBisque, TaskTypeBisque, 0, 5},
		{StepKeyGlaze, TaskTypeGlaze, 17, 0},
		{StepKeyFire, TaskTypeFire, 0, 5},
	}

	for i, expected := range expectedSteps {
		assert.Equal(t, expected.stepKey, process[i].StepKey, "Step %d should have correct StepKey", i)
		assert.Equal(t, expected.taskType, process[i].TaskType, "Step %d should have correct TaskType", i)
		assert.Equal(t, expected.rate, process[i].Rate, "Step %d should have correct Rate", i)
		assert.Equal(t, expected.dryingDays, process[i].DryingDays, "Step %d should have correct DryingDays", i)
	}

	for i := range process {
		assert.GreaterOrEqual(t, process[i].DryingDays, 0, "DryingDays should be non-negative")
		assert.GreaterOrEqual(t, process[i].Rate, 0.0, "Rate should be non-negative")
	}
}

func TestProductionProcess_MugWithoutHandle(t *testing.T) {
	process := ProductionProcess[PieceTypeMugWithoutHandle]

	assert.Len(t, process, 5, "Mug without handle should have 5 steps")

	hasAttach := false
	hasTrimFinal := false
	for _, step := range process {
		if step.StepKey == StepKeyAttach {
			hasAttach = true
		}
		if step.StepKey == StepKeyTrimFinal {
			hasTrimFinal = true
		}
	}

	assert.False(t, hasAttach, "Mug without handle should not have attach step")
	assert.True(t, hasTrimFinal, "Mug without handle should have trim_final step")
}

func TestProductionProcess_Tumbler(t *testing.T) {
	process := ProductionProcess[PieceTypeTumbler]

	assert.Len(t, process, 7, "Tumbler should have 7 steps")

	hasAttachLid := false
	hasAttachHandle := false
	for _, step := range process {
		if step.TaskType == TaskTypeAttachLid {
			hasAttachLid = true
			assert.Equal(t, 10.0, step.Rate, "Attach lid rate should be 10")
		}
		if step.TaskType == TaskTypeAttachHandle {
			hasAttachHandle = true
		}
	}

	assert.True(t, hasAttachLid, "Tumbler should have attach_lid task")
	assert.False(t, hasAttachHandle, "Tumbler should not have attach_handle task")
}

func TestProductionProcess_MatchaBowl(t *testing.T) {
	process := ProductionProcess[PieceTypeMatchaBowl]

	assert.Len(t, process, 5, "Matcha bowl should have 5 steps")

	buildStep := process[0]
	assert.Equal(t, TaskTypeBuildBase, buildStep.TaskType)
	assert.Equal(t, 3.0, buildStep.Rate, "Matcha bowl build rate should be 3 per shift")
	assert.Equal(t, 3, buildStep.DryingDays, "Matcha bowl should dry 3 days after build")

	trimStep := process[1]
	assert.Equal(t, TaskTypeTrim, trimStep.TaskType)
	assert.Equal(t, 8.0, trimStep.Rate, "Matcha bowl trim rate should be 8 per shift")
	assert.Equal(t, 3, trimStep.DryingDays, "Matcha bowl should dry 3 days after trim")
}

func TestProductionProcess_TrinketDish(t *testing.T) {
	process := ProductionProcess[PieceTypeTrinketDish]

	assert.Len(t, process, 5, "Trinket dish should have 5 steps")

	buildStep := process[0]
	assert.Equal(t, 30.0, buildStep.Rate, "Trinket dish build rate should be 30 per shift")

	trimStep := process[1]
	assert.Equal(t, 120.0, trimStep.Rate, "Trinket dish trim rate should be 120 per shift")

	glazeStep := process[3]
	assert.Equal(t, 50.0, glazeStep.Rate, "Trinket dish glaze rate should be 50 per shift")
}

func TestProductionProcess_BUG1_DuplicateStepKeys(t *testing.T) {
	t.Log("BUG #1: Process contains duplicate StepKeys, making it impossible to resume from certain steps")

	process := ProductionProcess[PieceTypeMugWithHandle]

	stepKeyCount := make(map[StepKey]int)
	for _, step := range process {
		stepKeyCount[step.StepKey]++
	}

	for stepKey, count := range stepKeyCount {
		assert.Equal(t, 1, count, "StepKey %s should appear only once, found %d times", stepKey, count)
	}

	if stepKeyCount[StepKeyTrim] > 1 {
		t.Skip("BUG: StepKey 'trim' appears multiple times in process")
	}
}

func TestProductionProcess_AllPositiveRates(t *testing.T) {
	for pieceType, process := range ProductionProcess {
		for _, step := range process {
			if step.TaskType == TaskTypeBisque || step.TaskType == TaskTypeFire {
				assert.Equal(t, 0.0, step.Rate, "External processes should have 0 rate for %s", pieceType)
			} else {
				assert.Greater(t, step.Rate, 0.0, "Work tasks should have positive rate for %s step %s", pieceType, step.TaskType)
			}
		}
	}
}

func TestProductionProcess_AllPositiveDryingDays(t *testing.T) {
	for pieceType, process := range ProductionProcess {
		for _, step := range process {
			assert.GreaterOrEqual(t, step.DryingDays, 0, "DryingDays should be non-negative for %s step %s", pieceType, step.TaskType)
		}
	}
}

func TestIsValidPieceType_Valid(t *testing.T) {
	tests := []struct {
		input    string
		expected PieceType
	}{
		{"mug-with-handle", PieceTypeMugWithHandle},
		{"mug-without-handle", PieceTypeMugWithoutHandle},
		{"tumbler", PieceTypeTumbler},
		{"matcha-bowl", PieceTypeMatchaBowl},
		{"trinket-dish", PieceTypeTrinketDish},
		{"dinnerware", PieceTypeDinnerware},
		{"other", PieceTypeOther},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result, valid := IsValidPieceType(tt.input)
			assert.True(t, valid, "Should be valid piece type")
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestIsValidPieceType_Invalid(t *testing.T) {
	tests := []string{
		"invalid-type",
		"mug",
		"",
		"MUG-WITH-HANDLE",
		"bowl",
	}

	for _, input := range tests {
		t.Run(input, func(t *testing.T) {
			_, valid := IsValidPieceType(input)
			assert.False(t, valid, "Should be invalid piece type")
		})
	}
}

func TestIsValidStepKey_Valid(t *testing.T) {
	tests := []struct {
		input    string
		expected StepKey
	}{
		{"pending", StepKeyPending},
		{"build", StepKeyBuild},
		{"trim", StepKeyTrim},
		{"attach", StepKeyAttach},
		{"bisque", StepKeyBisque},
		{"glaze", StepKeyGlaze},
		{"fire", StepKeyFire},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result, valid := IsValidStepKey(tt.input)
			assert.True(t, valid, "Should be valid step key")
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestIsValidStepKey_Invalid(t *testing.T) {
	tests := []string{
		"invalid",
		"",
		"BUILD",
		"complete",
		"ready",
	}

	for _, input := range tests {
		t.Run(input, func(t *testing.T) {
			_, valid := IsValidStepKey(input)
			assert.False(t, valid, "Should be invalid step key")
		})
	}
}

func TestWeeklySchedule_ValidDays(t *testing.T) {
	assert.Equal(t, 4.0, WeeklySchedule[1], "Monday should have 4 hours")
	assert.Equal(t, 2.0, WeeklySchedule[2], "Tuesday should have 2 hours")
	assert.Equal(t, 2.0, WeeklySchedule[3], "Wednesday should have 2 hours")
	assert.Equal(t, 4.0, WeeklySchedule[4], "Thursday should have 4 hours")
	assert.Equal(t, 8.0, WeeklySchedule[5], "Friday should have 8 hours")
	assert.Equal(t, 8.0, WeeklySchedule[6], "Saturday should have 8 hours")
	assert.Equal(t, 0.0, WeeklySchedule[0], "Sunday should have 0 hours")
}

func TestShiftDurationHours(t *testing.T) {
	assert.Equal(t, 4.0, ShiftDurationHours, "Shift duration should be 4 hours")
}

func TestProductionProcess_NoEmptyProcesses(t *testing.T) {
	for pieceType, process := range ProductionProcess {
		assert.NotEmpty(t, process, "Process for %s should not be empty", pieceType)
	}
}

func TestProductionProcess_AllEndWithFire(t *testing.T) {
	for pieceType, process := range ProductionProcess {
		lastStep := process[len(process)-1]
		assert.Equal(t, TaskTypeFire, lastStep.TaskType, "Last step for %s should be fire", pieceType)
		assert.Equal(t, StepKeyFire, lastStep.StepKey, "Last step key for %s should be fire", pieceType)
	}
}

func TestProductionProcess_AllStartWithBuild(t *testing.T) {
	for pieceType, process := range ProductionProcess {
		firstStep := process[0]
		assert.Equal(t, StepKeyBuild, firstStep.StepKey, "First step key for %s should be build", pieceType)
		assert.Greater(t, firstStep.Rate, 0.0, "Build step for %s should have positive rate", pieceType)
	}
}

func TestProductionProcess_BisqueBeforeFire(t *testing.T) {
	for pieceType, process := range ProductionProcess {
		bisqueIndex := -1
		fireIndex := -1

		for i, step := range process {
			if step.TaskType == TaskTypeBisque {
				bisqueIndex = i
			}
			if step.TaskType == TaskTypeFire {
				fireIndex = i
			}
		}

		assert.NotEqual(t, -1, bisqueIndex, "Process for %s should have bisque step", pieceType)
		assert.NotEqual(t, -1, fireIndex, "Process for %s should have fire step", pieceType)
		assert.Less(t, bisqueIndex, fireIndex, "Bisque should come before fire for %s", pieceType)
	}
}

func TestProductionProcess_GlazeBeforeFire(t *testing.T) {
	for pieceType, process := range ProductionProcess {
		glazeIndex := -1
		fireIndex := -1

		for i, step := range process {
			if step.TaskType == TaskTypeGlaze {
				glazeIndex = i
			}
			if step.TaskType == TaskTypeFire {
				fireIndex = i
			}
		}

		assert.NotEqual(t, -1, glazeIndex, "Process for %s should have glaze step", pieceType)
		assert.NotEqual(t, -1, fireIndex, "Process for %s should have fire step", pieceType)
		assert.Less(t, glazeIndex, fireIndex, "Glaze should come before fire for %s", pieceType)
	}
}
