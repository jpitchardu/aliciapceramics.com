package scheduler

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCalculateCompletionDate_PendingMugWithHandle(t *testing.T) {
	now := time.Now()
	orderDetail := OrderDetailDB{
		ID:       "test-1",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyPending),
		Quantity: 5,
	}

	completionDate, err := CalculateCompletionDate(orderDetail, now)

	assert.NoError(t, err)
	assert.True(t, completionDate.After(now))

	daysDiff := int(completionDate.Sub(now).Hours() / 24)
	assert.GreaterOrEqual(t, daysDiff, 21, "Should be at least 3 weeks (21 days)")
}

func TestCalculateCompletionDate_PendingMugWithoutHandle(t *testing.T) {
	now := time.Now()
	orderDetail := OrderDetailDB{
		ID:       "test-2",
		Type:     string(PieceTypeMugWithoutHandle),
		Status:   string(StepKeyPending),
		Quantity: 10,
	}

	completionDate, err := CalculateCompletionDate(orderDetail, now)

	assert.NoError(t, err)
	assert.True(t, completionDate.After(now))

	daysDiff := int(completionDate.Sub(now).Hours() / 24)
	assert.GreaterOrEqual(t, daysDiff, 21, "Should be at least 3 weeks (21 days)")
}

func TestCalculateCompletionDate_BuildStepMugWithHandle(t *testing.T) {
	now := time.Now()
	orderDetail := OrderDetailDB{
		ID:       "test-3",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyBuild),
		Quantity: 5,
	}

	completionDate, err := CalculateCompletionDate(orderDetail, now)
	assert.NoError(t, err)
	assert.True(t, completionDate.After(now))

	daysDiff := int(completionDate.Sub(now).Hours() / 24)
	assert.GreaterOrEqual(t, daysDiff, 21, "Should be at least 3 weeks minimum")
}

func TestCalculateCompletionDate_GlazeStepMugWithHandle(t *testing.T) {
	now := time.Now()
	orderDetail := OrderDetailDB{
		ID:       "test-4",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyGlaze),
		Quantity: 5,
	}

	completionDate, err := CalculateCompletionDate(orderDetail, now)

	assert.NoError(t, err)
	assert.True(t, completionDate.After(now))

	daysDiff := int(completionDate.Sub(now).Hours() / 24)
	assert.GreaterOrEqual(t, daysDiff, 21, "Should be at least 3 weeks minimum even at glaze step")
}

func TestCalculateCompletionDate_HighQuantityTakesLonger(t *testing.T) {
	now := time.Now()

	smallOrderDetail := OrderDetailDB{
		ID:       "test-5",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyPending),
		Quantity: 2,
	}

	largeOrderDetail := OrderDetailDB{
		ID:       "test-6",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyPending),
		Quantity: 20,
	}

	smallCompletion, err := CalculateCompletionDate(smallOrderDetail, now)
	assert.NoError(t, err)

	largeCompletion, err := CalculateCompletionDate(largeOrderDetail, now)
	assert.NoError(t, err)

	assert.True(t, largeCompletion.After(smallCompletion), "Larger quantity should take longer to complete")
}

func TestCalculateCompletionDate_InvalidPieceType(t *testing.T) {
	now := time.Now()
	orderDetail := OrderDetailDB{
		ID:       "test-7",
		Type:     "invalid-type",
		Status:   string(StepKeyPending),
		Quantity: 5,
	}

	_, err := CalculateCompletionDate(orderDetail, now)
	assert.Error(t, err, "Should return error for invalid piece type")
}

func TestCalculateCompletionDate_InvalidStatus(t *testing.T) {
	now := time.Now()
	orderDetail := OrderDetailDB{
		ID:       "test-8",
		Type:     string(PieceTypeMugWithHandle),
		Status:   "invalid-status",
		Quantity: 5,
	}

	_, err := CalculateCompletionDate(orderDetail, now)
	assert.Error(t, err, "Should return error for invalid status")
}

func TestCalculateCompletionDate_DifferentPieceTypes(t *testing.T) {
	now := time.Now()

	mugDetail := OrderDetailDB{
		ID:       "test-9",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyPending),
		Quantity: 10,
	}

	matchaBowlDetail := OrderDetailDB{
		ID:       "test-10",
		Type:     string(PieceTypeMatchaBowl),
		Status:   string(StepKeyPending),
		Quantity: 10,
	}

	mugCompletion, err := CalculateCompletionDate(mugDetail, now)
	assert.NoError(t, err)

	matchaBowlCompletion, err := CalculateCompletionDate(matchaBowlDetail, now)
	assert.NoError(t, err)

	assert.True(t, mugCompletion.After(now), "Mug should complete in the future")
	assert.True(t, matchaBowlCompletion.After(now), "Matcha bowl should complete in the future")
}

func TestCalculateCompletionDate_MinimumThreeWeeksFromNow(t *testing.T) {
	now := time.Now()
	threeWeeksFromNow := now.AddDate(0, 0, 21)

	orderDetail := OrderDetailDB{
		ID:       "test-11",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyPending),
		Quantity: 1,
	}

	completionDate, err := CalculateCompletionDate(orderDetail, now)
	assert.NoError(t, err)

	assert.True(t, completionDate.After(threeWeeksFromNow) || completionDate.Equal(threeWeeksFromNow),
		"Should be at least 3 weeks from now even for small quantities")
}

func TestCalculateCompletionDate_TrinketDishFasterProduction(t *testing.T) {
	now := time.Now()

	mugDetail := OrderDetailDB{
		ID:       "test-12",
		Type:     string(PieceTypeMugWithHandle),
		Status:   string(StepKeyPending),
		Quantity: 10,
	}

	trinketDetail := OrderDetailDB{
		ID:       "test-13",
		Type:     string(PieceTypeTrinketDish),
		Status:   string(StepKeyPending),
		Quantity: 10,
	}

	mugCompletion, err := CalculateCompletionDate(mugDetail, now)
	assert.NoError(t, err)

	trinketCompletion, err := CalculateCompletionDate(trinketDetail, now)
	assert.NoError(t, err)

	assert.True(t, trinketCompletion.Before(mugCompletion), "Trinket dishes should complete faster (higher rate: 30 vs 5)")
}
