package api

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dmarro89/mezzo-passo/backend/internal/store"
)

type contextKey string

const userIDKey contextKey = "userID"

type Server struct {
	store *store.Store
	log   *slog.Logger
}

func New(st *store.Store, log *slog.Logger) http.Handler {
	s := &Server{store: st, log: log}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.health)
	mux.HandleFunc("POST /api/v1/demo/login", s.demoLogin)

	mux.Handle("GET /api/v1/me", s.auth(http.HandlerFunc(s.me)))
	mux.Handle("GET /api/v1/events", s.auth(http.HandlerFunc(s.events)))
	mux.Handle("POST /api/v1/events", s.auth(http.HandlerFunc(s.createEvent)))
	mux.Handle("GET /api/v1/events/{id}/participants", s.auth(http.HandlerFunc(s.participants)))
	mux.Handle("PUT /api/v1/events/{id}/rsvp", s.auth(http.HandlerFunc(s.rsvp)))
	mux.Handle("GET /api/v1/messages", s.auth(http.HandlerFunc(s.messages)))
	mux.Handle("POST /api/v1/messages", s.auth(http.HandlerFunc(s.createMessage)))
	mux.Handle("GET /api/v1/members", s.auth(http.HandlerFunc(s.members)))
	mux.Handle("GET /api/v1/stats", s.auth(http.HandlerFunc(s.stats)))
	mux.Handle("GET /api/v1/notifications", s.auth(http.HandlerFunc(s.notifications)))

	return withCORS(withJSON(mux))
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok", "service": "mezzo-passo-api"})
}

func (s *Server) demoLogin(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Role string `json:"role"`
	}
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if in.Role != "capoparanza" && in.Role != "cullatore" {
		writeError(w, http.StatusBadRequest, "role must be capoparanza or cullatore")
		return
	}
	u, err := s.store.GetDemoUser(r.Context(), in.Role)
	if err != nil {
		s.internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"token": "demo:" + strconv.FormatInt(u.ID, 10),
		"user":  u,
	})
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	v, err := s.store.GetMe(r.Context(), userID(r.Context()))
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (s *Server) events(w http.ResponseWriter, r *http.Request) {
	v, err := s.store.Events(r.Context(), userID(r.Context()))
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (s *Server) createEvent(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Type        string `json:"type"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Location    string `json:"location"`
		StartsAt    string `json:"startsAt"`
		EndsAt      string `json:"endsAt"`
		Required    bool   `json:"required"`
		Attire      string `json:"attire"`
	}
	if err := decodeJSON(r, &in); err != nil || in.Title == "" || in.Type == "" {
		writeError(w, http.StatusBadRequest, "type and title are required")
		return
	}
	start, err := time.Parse(time.RFC3339, in.StartsAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, "startsAt must be RFC3339")
		return
	}
	end, err := time.Parse(time.RFC3339, in.EndsAt)
	if err != nil || !end.After(start) {
		writeError(w, http.StatusBadRequest, "endsAt must be RFC3339 and after startsAt")
		return
	}
	v, err := s.store.CreateEvent(r.Context(), userID(r.Context()), store.CreateEventParams{
		Type: in.Type, Title: in.Title, Description: in.Description, Location: in.Location,
		StartsAt: start, EndsAt: end, Required: in.Required, Attire: in.Attire,
	})
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, v)
}

func (s *Server) participants(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	v, err := s.store.Participants(r.Context(), userID(r.Context()), id)
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (s *Server) rsvp(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var in struct {
		Status string `json:"status"`
	}
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if err := s.store.SetRSVP(r.Context(), userID(r.Context()), id, in.Status); err != nil {
		if strings.Contains(err.Error(), "invalid status") {
			writeError(w, http.StatusBadRequest, "status must be confirmed, maybe or absent")
			return
		}
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": in.Status})
}

func (s *Server) messages(w http.ResponseWriter, r *http.Request) {
	v, err := s.store.Messages(r.Context(), userID(r.Context()))
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (s *Server) createMessage(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Title string `json:"title"`
		Body  string `json:"body"`
	}
	if err := decodeJSON(r, &in); err != nil || strings.TrimSpace(in.Title) == "" || strings.TrimSpace(in.Body) == "" {
		writeError(w, http.StatusBadRequest, "title and body are required")
		return
	}
	v, err := s.store.CreateMessage(r.Context(), userID(r.Context()), in.Title, in.Body)
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, v)
}

func (s *Server) members(w http.ResponseWriter, r *http.Request) {
	v, err := s.store.Members(r.Context(), userID(r.Context()))
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (s *Server) stats(w http.ResponseWriter, r *http.Request) {
	v, err := s.store.Stats(r.Context(), userID(r.Context()))
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (s *Server) notifications(w http.ResponseWriter, r *http.Request) {
	v, err := s.store.Notifications(r.Context(), userID(r.Context()))
	if err != nil {
		s.handleStoreError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (s *Server) auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer demo:") {
			writeError(w, http.StatusUnauthorized, "missing demo bearer token")
			return
		}
		id, err := strconv.ParseInt(strings.TrimPrefix(header, "Bearer demo:"), 10, 64)
		if err != nil || id <= 0 {
			writeError(w, http.StatusUnauthorized, "invalid token")
			return
		}
		if _, err := s.store.GetUser(r.Context(), id); err != nil {
			writeError(w, http.StatusUnauthorized, "invalid token")
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userIDKey, id)))
	})
}

func userID(ctx context.Context) int64 {
	id, _ := ctx.Value(userIDKey).(int64)
	return id
}

func pathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return id, true
}

func (s *Server) handleStoreError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, store.ErrForbidden):
		writeError(w, http.StatusForbidden, "forbidden")
	case errors.Is(err, store.ErrNotFound):
		writeError(w, http.StatusNotFound, "not found")
	default:
		s.internal(w, err)
	}
}

func (s *Server) internal(w http.ResponseWriter, err error) {
	s.log.Error("request failed", "error", err)
	writeError(w, http.StatusInternalServerError, "internal server error")
}

func decodeJSON(r *http.Request, out any) error {
	defer r.Body.Close()
	dec := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 1<<20))
	dec.DisallowUnknownFields()
	return dec.Decode(out)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func withJSON(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		next.ServeHTTP(w, r)
	})
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
