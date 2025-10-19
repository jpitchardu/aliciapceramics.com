package scheduler

import "time"

type OrderDB struct {
	ID           string          `json:"id,omitempty"`
	CustomerID   string          `json:"customer_id"`
	Type         string          `json:"type"`
	Timeline     string          `json:"timeline"`
	Status       string          `json:"status"`
	DueDate      *time.Time      `json:"due_date"`
	OrderDetails []OrderDetailDB `json:"order_details"`
}

type OrderDetailDB struct {
	ID              string    `json:"id,omitempty"`
	OrderID         string    `json:"order_id"`
	Type            string    `json:"type"`
	Size            *string   `json:"size,omitempty"`
	Quantity        int       `json:"quantity"`
	Description     string    `json:"description"`
	Status          string    `json:"status"`
	StatusChangedAt time.Time `json:"status_changed_at"`
}

type TaskDB struct {
	ID             string     `json:"id"`
	OrderDetailId  string     `json:"order_detail_id"`
	ScheduledFor   time.Time  `json:"date"`
	TaskType       string     `json:"task_type"`
	Quantity       int        `json:"quantity"`
	EstimatedHours float32    `json:"estimated_hours"`
	Status         string     `json:"status"`
	IsLate         bool       `json:"is_late"`
	CompletedAt    *time.Time `json:"completed_at"`
}

type TaskToCreate struct {
	OrderDetailId  string    `json:"order_detail_id"`
	Date           time.Time `json:"date"`
	TaskType       TaskType  `json:"task_type"`
	Quantity       int       `json:"quantity"`
	EstimatedHours float64   `json:"estimated_hours"`
	IsLate         bool      `json:"is_late"`
}

type DaySchedule struct {
	Weekday        time.Weekday
	Tasks          []TaskToCreate
	Mode           StepKey
	AvailableHours float64
}

type WeekSchedule map[time.Time]*DaySchedule

type TaskChainItem struct {
	TaskType          TaskType
	PieceType         PieceType
	StartDate         time.Time
	OrderDetailId     string
	OrderDetailStatus StepKey
	Quantity          int
}

type SchedulerResult struct {
	Success bool `json:"success"`
}
