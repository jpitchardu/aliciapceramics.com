package scheduler

import (
	"time"
)

const ShiftDurationHours = 4.0

var WeeklySchedule = map[time.Weekday]float64{
	time.Monday:    4.0,
	time.Tuesday:   2.0,
	time.Wednesday: 2.0,
	time.Thursday:  4.0,
	time.Friday:    8.0,
	time.Saturday:  8.0,
	time.Sunday:    0.0,
}

var ProductionRatesPerShift = map[string]map[string]int{
	"build": {
		"base": 5,
		"bowl": 3,
	},
	"attach": {
		"lid":    10,
		"handle": 9,
	},
	"trim": {
		"piece": 18,
	},
	"glaze": {
		"piece": 17,
	},
}

var DryingPeriods = map[string]int{
	"post_build":  2,
	"post_attach": 4,
}

var ExternalPeriods = map[string]int{
	"bisque": 3,
	"fire":   3,
}

type PieceType string
type TaskType string
type StepKey string

const (
	PieceTypeMugWithoutHandle PieceType = "mug-without-handle"
	PieceTypeMugWithHandle    PieceType = "mug-with-handle"
	PieceTypeTumbler          PieceType = "tumbler"
	PieceTypeMatchaBowl       PieceType = "matcha-bowl"
	PieceTypeTrinketDish      PieceType = "trinket-dish"
	PieceTypeDinnerware       PieceType = "dinnerware"
	PieceTypeOther            PieceType = "other"
)

const (
	TaskTypeBuildBase    TaskType = "task_build_base"
	TaskTypeBuildBowl    TaskType = "task_build_bowl"
	TaskTypeTrim         TaskType = "task_trim"
	TaskTypeAttachHandle TaskType = "task_attach_handle"
	TaskTypeAttachLid    TaskType = "task_attach_lid"
	TaskTypeBisque       TaskType = "task_bisque"
	TaskTypeGlaze        TaskType = "task_glaze"
	TaskTypeFire         TaskType = "task_fire"
)

const (
	StepKeyBuild  StepKey = "build"
	StepKeyTrim   StepKey = "trim"
	StepKeyAttach StepKey = "attach"
	StepKeyBisque StepKey = "bisque"
	StepKeyGlaze  StepKey = "glaze"
	StepKeyFire   StepKey = "fire"
)

type ProductionStep struct {
	StepKey    StepKey
	TaskType   TaskType
	Rate       float64
	DryingDays int
}

var ProductionProcess = map[PieceType][]ProductionStep{
	PieceTypeMugWithHandle: {
		{StepKey: StepKeyBuild, TaskType: TaskTypeBuildBase, Rate: 5, DryingDays: 2},
		{StepKey: StepKeyTrim, TaskType: TaskTypeTrim, Rate: 15, DryingDays: 1},
		{StepKey: StepKeyAttach, TaskType: TaskTypeAttachHandle, Rate: 8, DryingDays: 2},
		{StepKey: StepKeyTrim, TaskType: TaskTypeTrim, Rate: 15, DryingDays: 3},
		{StepKey: StepKeyBisque, TaskType: TaskTypeBisque, Rate: 0, DryingDays: 5},
		{StepKey: StepKeyGlaze, TaskType: TaskTypeGlaze, Rate: 17, DryingDays: 0},
		{StepKey: StepKeyFire, TaskType: TaskTypeFire, Rate: 0, DryingDays: 5},
	},
	PieceTypeMugWithoutHandle: {
		{StepKey: StepKeyBuild, TaskType: TaskTypeBuildBase, Rate: 5, DryingDays: 2},
		{StepKey: StepKeyTrim, TaskType: TaskTypeTrim, Rate: 15, DryingDays: 1},
		{StepKey: StepKeyBisque, TaskType: TaskTypeBisque, Rate: 0, DryingDays: 5},
		{StepKey: StepKeyGlaze, TaskType: TaskTypeGlaze, Rate: 17, DryingDays: 0},
		{StepKey: StepKeyFire, TaskType: TaskTypeFire, Rate: 0, DryingDays: 5},
	},
	PieceTypeTumbler: {
		{StepKey: StepKeyBuild, TaskType: TaskTypeBuildBase, Rate: 5, DryingDays: 2},
		{StepKey: StepKeyTrim, TaskType: TaskTypeTrim, Rate: 15, DryingDays: 1},
		{StepKey: StepKeyAttach, TaskType: TaskTypeAttachLid, Rate: 10, DryingDays: 2},
		{StepKey: StepKeyTrim, TaskType: TaskTypeTrim, Rate: 15, DryingDays: 3},
		{StepKey: StepKeyBisque, TaskType: TaskTypeBisque, Rate: 0, DryingDays: 5},
		{StepKey: StepKeyGlaze, TaskType: TaskTypeGlaze, Rate: 17, DryingDays: 0},
		{StepKey: StepKeyFire, TaskType: TaskTypeFire, Rate: 0, DryingDays: 5},
	},
	PieceTypeMatchaBowl: {
		{StepKey: StepKeyBuild, TaskType: TaskTypeBuildBase, Rate: 3, DryingDays: 3},
		{StepKey: StepKeyTrim, TaskType: TaskTypeTrim, Rate: 8, DryingDays: 3},
		{StepKey: StepKeyBisque, TaskType: TaskTypeBisque, Rate: 0, DryingDays: 5},
		{StepKey: StepKeyGlaze, TaskType: TaskTypeGlaze, Rate: 17, DryingDays: 0},
		{StepKey: StepKeyFire, TaskType: TaskTypeFire, Rate: 0, DryingDays: 5},
	},
	PieceTypeTrinketDish: {
		{StepKey: StepKeyBuild, TaskType: TaskTypeBuildBase, Rate: 30, DryingDays: 2},
		{StepKey: StepKeyTrim, TaskType: TaskTypeTrim, Rate: 120, DryingDays: 3},
		{StepKey: StepKeyBisque, TaskType: TaskTypeBisque, Rate: 0, DryingDays: 5},
		{StepKey: StepKeyGlaze, TaskType: TaskTypeGlaze, Rate: 50, DryingDays: 0},
		{StepKey: StepKeyFire, TaskType: TaskTypeFire, Rate: 0, DryingDays: 0},
	},
}

func IsValidPieceType(pieceType string) (PieceType, bool) {
	switch PieceType(pieceType) {
	case
		PieceTypeMugWithoutHandle,
		PieceTypeMugWithHandle,
		PieceTypeTumbler,
		PieceTypeMatchaBowl,
		PieceTypeTrinketDish,
		PieceTypeDinnerware,
		PieceTypeOther:

		return PieceType(pieceType), true
	default:
		return "", false
	}
}

func IsValidStepKey(stepKey string) (StepKey, bool) {
	switch StepKey(stepKey) {
	case
		StepKeyBuild,
		StepKeyTrim,
		StepKeyAttach,
		StepKeyBisque,
		StepKeyGlaze,
		StepKeyFire:
		return StepKey(stepKey), true
	default:
		return "", false
	}
}
