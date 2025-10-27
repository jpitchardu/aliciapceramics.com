package scheduler

import (
	"aliciapceramics/server/orders"
	"fmt"
	"math"
	"time"
)

func CalculateTaskChain(orderDetail orders.OrderDetailDTO, dueDate time.Time) ([]TaskChainItem, error) {

	safePieceType, isValidPieceType := IsValidPieceType(orderDetail.Type)
	safeStep, isValidStep := IsValidStepKey(orderDetail.Status)

	dueDateWithBuffer := dueDate.AddDate(0, 0, -3) // For sake of not stressing out

	if !isValidPieceType {
		return []TaskChainItem{}, fmt.Errorf("order detail %s is not valid with type %s", orderDetail.ID, orderDetail.Type)
	}

	if !isValidStep {
		return []TaskChainItem{}, fmt.Errorf("order detail %s is not valid with status %s", orderDetail.ID, orderDetail.Status)
	}

	process := ProductionProcess[safePieceType]

	var currentStepIndex int

	for idx, step := range process {
		if step.StepKey == safeStep {
			currentStepIndex = idx
			break
		}
	}

	if safeStep != StepKeyPending && orderDetail.StatusChangedAt != nil {
		currentStep := process[currentStepIndex]
		dryingComplete := orderDetail.StatusChangedAt.AddDate(0, 0, currentStep.DryingDays)

		if dryingComplete.After(time.Now()) {
			return []TaskChainItem{}, nil
		}

		currentStepIndex++
	}

	var tasks = []TaskChainItem{}

	for i := len(process) - 1; i >= currentStepIndex; i-- {

		step := process[i]

		remainingQuantity := orderDetail.Quantity - orderDetail.CompletedQuantity

		var workDays int
		if step.Rate > 0 {
			workDays = int(math.Ceil(float64(remainingQuantity) / step.Rate))
		} else {
			workDays = 0
		}

		var daysNeeded int
		if step.TaskType == TaskTypeBisque || step.TaskType == TaskTypeFire {
			daysNeeded = step.DryingDays
		} else {
			daysNeeded = workDays + step.DryingDays
		}

		task := TaskChainItem{
			TaskType:          step.TaskType,
			PieceType:         safePieceType,
			StartDate:         dueDateWithBuffer.AddDate(0, 0, -daysNeeded),
			Quantity:          remainingQuantity,
			OrderDetailId:     orderDetail.ID,
			OrderDetailStatus: step.StepKey,
		}

		tasks = append(tasks, task)
		dueDateWithBuffer = task.StartDate
	}

	for i, j := 0, len(tasks)-1; i < j; i, j = i+1, j-1 {
		tasks[i], tasks[j] = tasks[j], tasks[i]
	}

	return tasks, nil
}
