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

	for _, step := range process {
		if string(step.StepKey) != orderDetail.Status {
			continue
		}

		daysDrying := time.Since(orderDetail.StatusChangedAt).Hours() / 24
		if daysDrying < float64(step.DryingDays) {
			return []TaskChainItem{}, nil
		}
	}

	var tasks = []TaskChainItem{}

	for idx := range process {

		step := process[len(process)-(idx+1)]

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
			OrderDetailStatus: safeStep,
		}

		tasks = append(tasks, task)
		dueDateWithBuffer = task.StartDate
	}

	for i, j := 0, len(tasks)-1; i < j; i, j = i+1, j-1 {
		tasks[i], tasks[j] = tasks[j], tasks[i]
	}

	return tasks, nil
}
