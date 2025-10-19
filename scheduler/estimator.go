package scheduler

import "math"

func CalculateHours(taskType TaskType, pieceType PieceType, quantity int) float64 {
	productionStep, found := getProductionStepForTaskByPiece(taskType, pieceType)

	if !found {
		return 0
	}

	// Handle tasks with zero rate (external processes like bisque/fire)
	if productionStep.Rate == 0 {
		return 0
	}

	return float64(quantity) / (productionStep.Rate / ShiftDurationHours)
}

func CalculateQuantity(hours float64, taskType TaskType, pieceType PieceType) int {

	if hours <= 0 {
		return 0
	}

	shifts := hours / ShiftDurationHours
	step, found := getProductionStepForTaskByPiece(taskType, pieceType)

	if !found {
		return 0
	}

	return int(math.Floor(step.Rate * shifts))
}

func getProductionStepForTaskByPiece(taskType TaskType, pieceType PieceType) (ProductionStep, bool) {

	productionSteps := ProductionProcess[pieceType]

	for _, step := range productionSteps {
		if step.TaskType == taskType {
			return step, true
		}
	}

	return ProductionStep{}, false
}
