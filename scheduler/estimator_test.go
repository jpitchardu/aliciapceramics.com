package scheduler

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCalculateHours_BuildBase(t *testing.T) {
	tests := []struct {
		name     string
		quantity int
		expected float64
	}{
		{
			name:     "Exactly one shift",
			quantity: 5,
			expected: 4.0,
		},
		{
			name:     "Two shifts",
			quantity: 10,
			expected: 8.0,
		},
		{
			name:     "Partial shift",
			quantity: 7,
			expected: 5.6,
		},
		{
			name:     "Three pieces",
			quantity: 3,
			expected: 2.4,
		},
		{
			name:     "Large quantity",
			quantity: 25,
			expected: 20.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateHours(TaskTypeBuildBase, PieceTypeMugWithHandle, tt.quantity)
			assert.InDelta(t, tt.expected, result, 0.001, "Hours calculation should match expected")
		})
	}
}

func TestCalculateHours_Trim(t *testing.T) {
	tests := []struct {
		name     string
		quantity int
		expected float64
	}{
		{
			name:     "Exactly one shift",
			quantity: 15,
			expected: 4.0,
		},
		{
			name:     "Partial shift",
			quantity: 20,
			expected: 5.333,
		},
		{
			name:     "Half shift",
			quantity: 7,
			expected: 1.867,
		},
		{
			name:     "Two shifts",
			quantity: 30,
			expected: 8.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateHours(TaskTypeTrim, PieceTypeMugWithHandle, tt.quantity)
			assert.InDelta(t, tt.expected, result, 0.01, "Trim hours calculation should match expected")
		})
	}
}

func TestCalculateHours_AttachHandle(t *testing.T) {
	result := CalculateHours(TaskTypeAttachHandle, PieceTypeMugWithHandle, 8)
	expected := 4.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 4 hours for 8 handles at rate 8/4hrs")

	result = CalculateHours(TaskTypeAttachHandle, PieceTypeMugWithHandle, 16)
	expected = 8.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 8 hours for 16 handles")
}

func TestCalculateHours_AttachLid(t *testing.T) {
	result := CalculateHours(TaskTypeAttachLid, PieceTypeTumbler, 10)
	expected := 4.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 4 hours for 10 lids at rate 10/4hrs")

	result = CalculateHours(TaskTypeAttachLid, PieceTypeTumbler, 15)
	expected = 6.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 6 hours for 15 lids")
}

func TestCalculateHours_ZeroRateTasks(t *testing.T) {
	tests := []struct {
		name      string
		taskType  TaskType
		pieceType PieceType
		quantity  int
	}{
		{
			name:      "Bisque",
			taskType:  TaskTypeBisque,
			pieceType: PieceTypeMugWithHandle,
			quantity:  100,
		},
		{
			name:      "Fire",
			taskType:  TaskTypeFire,
			pieceType: PieceTypeMugWithHandle,
			quantity:  100,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateHours(tt.taskType, tt.pieceType, tt.quantity)
			assert.Equal(t, 0.0, result, "External processes should return 0 hours")
		})
	}
}

func TestCalculateHours_Glaze(t *testing.T) {
	result := CalculateHours(TaskTypeGlaze, PieceTypeMugWithHandle, 17)
	expected := 4.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 4 hours for 17 pieces at rate 17/4hrs")

	result = CalculateHours(TaskTypeGlaze, PieceTypeMugWithHandle, 34)
	expected = 8.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 8 hours for 34 pieces")
}

func TestCalculateHours_MatchaBowl(t *testing.T) {
	result := CalculateHours(TaskTypeBuildBase, PieceTypeMatchaBowl, 3)
	expected := 4.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 4 hours for 3 bowls at rate 3/4hrs")

	result = CalculateHours(TaskTypeTrim, PieceTypeMatchaBowl, 8)
	expected = 4.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 4 hours for 8 bowls at rate 8/4hrs")
}

func TestCalculateHours_TrinketDish(t *testing.T) {
	result := CalculateHours(TaskTypeBuildBase, PieceTypeTrinketDish, 30)
	expected := 4.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 4 hours for 30 dishes at rate 30/4hrs")

	result = CalculateHours(TaskTypeTrim, PieceTypeTrinketDish, 120)
	expected = 4.0
	assert.InDelta(t, expected, result, 0.001, "Should calculate 4 hours for 120 dishes at rate 120/4hrs")
}

func TestCalculateQuantity_BuildBase(t *testing.T) {
	tests := []struct {
		name     string
		hours    float64
		expected int
	}{
		{
			name:     "One shift",
			hours:    4.0,
			expected: 5,
		},
		{
			name:     "Two shifts",
			hours:    8.0,
			expected: 10,
		},
		{
			name:     "Half shift",
			hours:    2.0,
			expected: 2,
		},
		{
			name:     "Three shifts",
			hours:    12.0,
			expected: 15,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateQuantity(tt.hours, TaskTypeBuildBase, PieceTypeMugWithHandle)
			assert.Equal(t, tt.expected, result, "Quantity calculation should match expected")
		})
	}
}

func TestCalculateQuantity_Trim(t *testing.T) {
	result := CalculateQuantity(4.0, TaskTypeTrim, PieceTypeMugWithHandle)
	assert.Equal(t, 15, result, "4 hours should yield 15 pieces")

	result = CalculateQuantity(8.0, TaskTypeTrim, PieceTypeMugWithHandle)
	assert.Equal(t, 30, result, "8 hours should yield 30 pieces")

	result = CalculateQuantity(2.0, TaskTypeTrim, PieceTypeMugWithHandle)
	assert.Equal(t, 7, result, "2 hours should yield 7 pieces (floor)")
}

func TestCalculateQuantity_AttachHandle(t *testing.T) {
	result := CalculateQuantity(4.0, TaskTypeAttachHandle, PieceTypeMugWithHandle)
	assert.Equal(t, 8, result, "4 hours should yield 8 handles")

	result = CalculateQuantity(6.0, TaskTypeAttachHandle, PieceTypeMugWithHandle)
	assert.Equal(t, 12, result, "6 hours should yield 12 handles")
}

func TestCalculateQuantity_AttachLid(t *testing.T) {
	result := CalculateQuantity(4.0, TaskTypeAttachLid, PieceTypeTumbler)
	assert.Equal(t, 10, result, "4 hours should yield 10 lids")

	result = CalculateQuantity(8.0, TaskTypeAttachLid, PieceTypeTumbler)
	assert.Equal(t, 20, result, "8 hours should yield 20 lids")
}

func TestCalculateQuantity_Glaze(t *testing.T) {
	result := CalculateQuantity(4.0, TaskTypeGlaze, PieceTypeMugWithHandle)
	assert.Equal(t, 17, result, "4 hours should yield 17 pieces")

	result = CalculateQuantity(8.0, TaskTypeGlaze, PieceTypeMugWithHandle)
	assert.Equal(t, 34, result, "8 hours should yield 34 pieces")
}

func TestCalculateQuantity_MatchaBowl(t *testing.T) {
	result := CalculateQuantity(4.0, TaskTypeBuildBase, PieceTypeMatchaBowl)
	assert.Equal(t, 3, result, "4 hours should yield 3 bowls")

	result = CalculateQuantity(8.0, TaskTypeTrim, PieceTypeMatchaBowl)
	assert.Equal(t, 16, result, "8 hours should yield 16 bowls for trimming")
}

func TestCalculateQuantity_TrinketDish(t *testing.T) {
	result := CalculateQuantity(4.0, TaskTypeBuildBase, PieceTypeTrinketDish)
	assert.Equal(t, 30, result, "4 hours should yield 30 trinket dishes")

	result = CalculateQuantity(4.0, TaskTypeTrim, PieceTypeTrinketDish)
	assert.Equal(t, 120, result, "4 hours should yield 120 trinket dishes for trimming")
}

func TestCalculateQuantity_ZeroHours(t *testing.T) {
	result := CalculateQuantity(0, TaskTypeBuildBase, PieceTypeMugWithHandle)
	assert.Equal(t, 0, result, "Zero hours should yield zero quantity")

	result = CalculateQuantity(-1.0, TaskTypeBuildBase, PieceTypeMugWithHandle)
	assert.Equal(t, 0, result, "Negative hours should yield zero quantity")
}

func TestCalculateQuantity_InvalidTask(t *testing.T) {
	result := CalculateQuantity(4.0, TaskType("invalid"), PieceTypeMugWithHandle)
	assert.Equal(t, 0, result, "Invalid task type should return 0")
}

func TestCalculateHours_InvalidTask(t *testing.T) {
	result := CalculateHours(TaskType("invalid"), PieceTypeMugWithHandle, 10)
	assert.Equal(t, 0.0, result, "Invalid task type should return 0")
}

func TestCalculateHours_ZeroQuantity(t *testing.T) {
	result := CalculateHours(TaskTypeBuildBase, PieceTypeMugWithHandle, 0)
	assert.Equal(t, 0.0, result, "Zero quantity should return 0 hours")
}

func TestCalculateQuantity_RoundingDown(t *testing.T) {
	result := CalculateQuantity(2.5, TaskTypeBuildBase, PieceTypeMugWithHandle)
	expected := 3
	assert.Equal(t, expected, result, "Should floor the result")
}

func TestCalculateHours_Symmetry(t *testing.T) {
	quantity := 7
	hours := CalculateHours(TaskTypeBuildBase, PieceTypeMugWithHandle, quantity)
	reconstructedQuantity := CalculateQuantity(hours, TaskTypeBuildBase, PieceTypeMugWithHandle)

	assert.GreaterOrEqual(t, reconstructedQuantity, quantity, "Round trip should preserve or increase quantity due to flooring")
}

func TestGetProductionStepForTaskByPiece_ValidTask(t *testing.T) {
	step, found := getProductionStepForTaskByPiece(TaskTypeBuildBase, PieceTypeMugWithHandle)
	assert.True(t, found, "Should find build step for mug")
	assert.Equal(t, TaskTypeBuildBase, step.TaskType)
	assert.Equal(t, 5.0, step.Rate)
}

func TestGetProductionStepForTaskByPiece_InvalidTask(t *testing.T) {
	_, found := getProductionStepForTaskByPiece(TaskTypeAttachHandle, PieceTypeMugWithoutHandle)
	assert.False(t, found, "Should not find attach handle step for mug without handle")
}

func TestGetProductionStepForTaskByPiece_AttachLid(t *testing.T) {
	step, found := getProductionStepForTaskByPiece(TaskTypeAttachLid, PieceTypeTumbler)
	assert.True(t, found, "Should find attach lid step for tumbler")
	assert.Equal(t, TaskTypeAttachLid, step.TaskType)
	assert.Equal(t, 10.0, step.Rate)
}
