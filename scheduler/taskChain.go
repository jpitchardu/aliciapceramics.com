package scheduler

import (
	"fmt"
	"math"
	"time"
)

func CalculateTaskChain(orderDetail OrderDetailDB, dueDate time.Time) ([]TaskChainItem, error) {

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

	var tasks = []TaskChainItem{}

	for i := len(process) - 1; i >= currentStepIndex; i-- {

		step := process[i]

		var daysNeeded float64

		if step.TaskType == TaskTypeBisque || step.TaskType == TaskTypeFire {
			daysNeeded = float64(step.DryingDays)
		} else {
			daysNeeded = float64(step.DryingDays) + math.Ceil(float64(orderDetail.Quantity)/step.Rate)
		}

		task := TaskChainItem{
			TaskType:          step.TaskType,
			PieceType:         safePieceType,
			StartDate:         dueDateWithBuffer.AddDate(0, 0, -int(daysNeeded)),
			Quantity:          orderDetail.Quantity,
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
