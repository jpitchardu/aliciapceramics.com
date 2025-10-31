package handler

import (
	"aliciapceramics/scheduler"
	"encoding/json"
	"net/http"
)

func ScheduleTasksHandler(w http.ResponseWriter, r *http.Request) {

	if err := scheduler.Run(); err != nil {
		LogError("schedule_tasks", err, map[string]any{})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
