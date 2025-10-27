package scheduler

import (
	"aliciapceramics/server/orders"
	"fmt"
	"math"
	"time"
)

const StandardProductionWeeks = 3

func CalculateCompletionDate(orderDetail orders.OrderDetailDTO, fromDate time.Time) (time.Time, error) {
	safePieceType, isValidPieceType := IsValidPieceType(orderDetail.Type)
	safeStep, isValidStep := IsValidStepKey(orderDetail.Status)

	if !isValidPieceType {
		return time.Time{}, fmt.Errorf("order detail %s has invalid type %s", orderDetail.ID, orderDetail.Type)
	}

	if !isValidStep {
		return time.Time{}, fmt.Errorf("order detail %s has invalid status %s", orderDetail.ID, orderDetail.Status)
	}

	process := ProductionProcess[safePieceType]

	var currentStepIndex int
	for idx, step := range process {
		if step.StepKey == safeStep {
			currentStepIndex = idx
			break
		}
	}

	totalDaysNeeded := 0

	for i := currentStepIndex; i < len(process); i++ {
		step := process[i]

		var workDays int
		if step.Rate > 0 {
			workDays = int(math.Ceil(float64(orderDetail.Quantity) / step.Rate))
		} else {
			workDays = 0
		}

		var daysNeeded int
		if step.TaskType == TaskTypeBisque || step.TaskType == TaskTypeFire {
			daysNeeded = step.DryingDays
		} else {
			daysNeeded = workDays + step.DryingDays
		}

		totalDaysNeeded += daysNeeded
	}

	minimumDays := StandardProductionWeeks * 7
	if totalDaysNeeded < minimumDays {
		totalDaysNeeded = minimumDays
	}

	completionDate := fromDate.AddDate(0, 0, totalDaysNeeded)

	return completionDate, nil
}
