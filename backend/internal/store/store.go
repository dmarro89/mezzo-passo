package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/dmarro89/mezzo-passo/backend/internal/model"
)

var ErrForbidden = errors.New("forbidden")
var ErrNotFound = errors.New("not found")

type Store struct {
	db *sql.DB
}

func Open(ctx context.Context, dsn string) (*Store, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(8)
	db.SetMaxIdleConns(4)
	db.SetConnMaxLifetime(30 * time.Minute)

	pingCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	if err := db.PingContext(pingCtx); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	s := &Store{db: db}
	if err := s.migrate(ctx); err != nil {
		db.Close()
		return nil, err
	}
	if err := s.seed(ctx); err != nil {
		db.Close()
		return nil, err
	}
	return s, nil
}

func (s *Store) Close() error { return s.db.Close() }

func (s *Store) migrate(ctx context.Context) error {
	const schema = `
CREATE TABLE IF NOT EXISTS users (
	id BIGSERIAL PRIMARY KEY,
	demo_key TEXT NOT NULL UNIQUE,
	role TEXT NOT NULL CHECK (role IN ('capoparanza','cullatore')),
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	birth_date DATE,
	photo_url TEXT NOT NULL DEFAULT '',
	position TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS paranze (
	id BIGSERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	manager_user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
	primary_color TEXT NOT NULL DEFAULT '#FFFFFF',
	secondary_color TEXT NOT NULL DEFAULT '#0B4DB8',
	invite_code TEXT NOT NULL UNIQUE
);

ALTER TABLE paranze
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS memberships (
	user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	paranza_id BIGINT NOT NULL REFERENCES paranze(id) ON DELETE CASCADE,
	active BOOLEAN NOT NULL DEFAULT TRUE,
	joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
	id BIGSERIAL PRIMARY KEY,
	paranza_id BIGINT NOT NULL REFERENCES paranze(id) ON DELETE CASCADE,
	type TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	location TEXT NOT NULL DEFAULT '',
	starts_at TIMESTAMPTZ NOT NULL,
	ends_at TIMESTAMPTZ NOT NULL,
	required BOOLEAN NOT NULL DEFAULT FALSE,
	attire TEXT NOT NULL DEFAULT '',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rsvps (
	event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	status TEXT NOT NULL CHECK (status IN ('confirmed','maybe','absent')),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
	id BIGSERIAL PRIMARY KEY,
	paranza_id BIGINT NOT NULL REFERENCES paranze(id) ON DELETE CASCADE,
	sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	body TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_paranza_starts ON events(paranza_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_messages_paranza_created ON messages(paranza_id, created_at DESC);
`
	if _, err := s.db.ExecContext(ctx, schema); err != nil {
		return fmt.Errorf("migrate schema: %w", err)
	}
	return nil
}

type seedUser struct {
	key, first, last, position string
	active                     bool
}

func (s *Store) seed(ctx context.Context) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var managerID int64
	if _, err := tx.ExecContext(ctx, `
INSERT INTO users (demo_key, role, first_name, last_name, birth_date, position)
VALUES ('manager', 'capoparanza', 'Luca', 'Iorio', '1988-04-20', '')
ON CONFLICT (demo_key) DO NOTHING
`); err != nil {
		return fmt.Errorf("seed manager: %w", err)
	}
	if err := tx.QueryRowContext(ctx, `SELECT id FROM users WHERE demo_key='manager'`).Scan(&managerID); err != nil {
		return fmt.Errorf("load seeded manager: %w", err)
	}

	var paranzaID int64
	if _, err := tx.ExecContext(ctx, `
INSERT INTO paranze (name, description, manager_user_id, primary_color, secondary_color, invite_code)
VALUES ('Orgoglio Nolano', 'Tradizione, Passione, Nola. Uniti sotto gli stessi colori.', $1, '#FFFFFF', '#0B4DB8', 'MEZZOPASSO')
ON CONFLICT (manager_user_id) DO NOTHING
`, managerID); err != nil {
		return fmt.Errorf("seed paranza: %w", err)
	}
	if err := tx.QueryRowContext(ctx, `SELECT id FROM paranze WHERE manager_user_id=$1`, managerID).Scan(&paranzaID); err != nil {
		return fmt.Errorf("load seeded paranza: %w", err)
	}

	members := []seedUser{
		{"cullatore", "Davide", "Esposito", "Ritiro sinistro", true},
		{"member-2", "Raffaele", "Marra", "Ritiro destro", true},
		{"member-3", "Giovanni", "Nappi", "Barra avanti", true},
		{"member-4", "Ciro", "Manzi", "Barra dietro", true},
		{"member-5", "Luigi", "Romano", "Barra destra", true},
		{"member-6", "Salvatore", "Conte", "Barra sinistra", true},
		{"member-7", "Marco", "Bifulco", "Barrettillo avanti", true},
		{"member-8", "Alessio", "Romano", "Barrettillo dietro", false},
	}

	memberIDs := make([]int64, 0, len(members))
	for i, m := range members {
		var id int64
		birth := fmt.Sprintf("199%d-03-14", i%9)
		if err := tx.QueryRowContext(ctx, `
INSERT INTO users (demo_key, role, first_name, last_name, birth_date, position)
VALUES ($1, 'cullatore', $2, $3, $4::date, $5)
ON CONFLICT (demo_key) DO UPDATE
SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, position=EXCLUDED.position
RETURNING id
`, m.key, m.first, m.last, birth, m.position).Scan(&id); err != nil {
			return fmt.Errorf("seed member %s: %w", m.key, err)
		}
		memberIDs = append(memberIDs, id)
		if _, err := tx.ExecContext(ctx, `
INSERT INTO memberships (user_id, paranza_id, active)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE SET paranza_id=EXCLUDED.paranza_id, active=EXCLUDED.active
`, id, paranzaID, m.active); err != nil {
			return fmt.Errorf("seed membership: %w", err)
		}
	}

	var eventCount int
	if err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM events WHERE paranza_id=$1`, paranzaID).Scan(&eventCount); err != nil {
		return err
	}
	if eventCount == 0 {
		now := time.Now().UTC()
		type seededEvent struct {
			typ, title, desc, location, attire string
			start                              time.Time
			duration                           time.Duration
			required                           bool
		}
		events := []seededEvent{
			{"Prova della paranza", "Prova della paranza", "Prova generale in vista dei prossimi appuntamenti.", "Zona Duomo, Nola", "Maglia della paranza e scarpe comode", now.Add(48 * time.Hour), 2 * time.Hour, true},
			{"Bandiera", "Bandiera", "Ritrovo della paranza per la bandiera.", "Piazza Duomo, Nola", "Maglia bianca", now.Add(5 * 24 * time.Hour), 3 * time.Hour, true},
			{"Cena della paranza", "Cena della paranza", "Cena e momento di ritrovo della paranza.", "Nola", "", now.Add(10 * 24 * time.Hour), 3 * time.Hour, false},
		}
		var firstEventID int64
		for i, e := range events {
			var id int64
			if err := tx.QueryRowContext(ctx, `
INSERT INTO events (paranza_id, type, title, description, location, starts_at, ends_at, required, attire)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id
`, paranzaID, e.typ, e.title, e.desc, e.location, e.start, e.start.Add(e.duration), e.required, e.attire).Scan(&id); err != nil {
				return fmt.Errorf("seed event: %w", err)
			}
			if i == 0 {
				firstEventID = id
			}
		}
		for i, uid := range memberIDs {
			status := "confirmed"
			if i == 6 {
				status = "maybe"
			}
			if i == 7 {
				status = "absent"
			}
			if _, err := tx.ExecContext(ctx, `
INSERT INTO rsvps (event_id, user_id, status)
VALUES ($1,$2,$3)
ON CONFLICT (event_id,user_id) DO UPDATE SET status=EXCLUDED.status
`, firstEventID, uid, status); err != nil {
				return fmt.Errorf("seed rsvp: %w", err)
			}
		}
	}

	var messageCount int
	if err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM messages WHERE paranza_id=$1`, paranzaID).Scan(&messageCount); err != nil {
		return err
	}
	if messageCount == 0 {
		if _, err := tx.ExecContext(ctx, `
INSERT INTO messages (paranza_id, sender_user_id, title, body, created_at) VALUES
($1,$2,'Prova della paranza','Ragazzi, ci vediamo per la prova. Puntuali e con la maglia della paranza.',NOW()),
($1,$2,'Promemoria maglia','Per il prossimo appuntamento ricordate la maglia indicata nell''evento.',NOW() - INTERVAL '1 day'),
($1,$2,'Comunicazione generale','Il programma della settimana è disponibile in app.',NOW() - INTERVAL '3 days')
`, paranzaID, managerID); err != nil {
			return fmt.Errorf("seed messages: %w", err)
		}
	}

	return tx.Commit()
}

func (s *Store) GetDemoUser(ctx context.Context, role string) (model.User, error) {
	key := "cullatore"
	if role == "capoparanza" {
		key = "manager"
	}
	return s.getUserByWhere(ctx, "demo_key=$1", key)
}

func (s *Store) GetUser(ctx context.Context, id int64) (model.User, error) {
	return s.getUserByWhere(ctx, "id=$1", id)
}

func (s *Store) getUserByWhere(ctx context.Context, where string, arg any) (model.User, error) {
	var u model.User
	var birth sql.NullTime
	err := s.db.QueryRowContext(ctx, `
SELECT id, role, first_name, last_name, birth_date, photo_url, position
FROM users WHERE `+where, arg).Scan(&u.ID, &u.Role, &u.FirstName, &u.LastName, &birth, &u.PhotoURL, &u.Position)
	if errors.Is(err, sql.ErrNoRows) {
		return u, ErrNotFound
	}
	if err != nil {
		return u, err
	}
	if birth.Valid {
		u.BirthDate = birth.Time.Format("2006-01-02")
	}
	return u, nil
}

func (s *Store) GetMe(ctx context.Context, userID int64) (model.Me, error) {
	u, err := s.GetUser(ctx, userID)
	if err != nil {
		return model.Me{}, err
	}
	p, err := s.getParanza(ctx, userID)
	if err != nil && !errors.Is(err, ErrNotFound) {
		return model.Me{}, err
	}
	if errors.Is(err, ErrNotFound) {
		return model.Me{User: u}, nil
	}
	return model.Me{User: u, Paranza: &p}, nil
}

func (s *Store) getParanza(ctx context.Context, userID int64) (model.Paranza, error) {
	var p model.Paranza
	err := s.db.QueryRowContext(ctx, `
SELECT p.id, p.name, p.description, p.primary_color, p.secondary_color, p.invite_code,
       u.first_name || ' ' || u.last_name
FROM paranze p
JOIN users u ON u.id=p.manager_user_id
LEFT JOIN memberships m ON m.paranza_id=p.id
WHERE p.manager_user_id=$1 OR m.user_id=$1
LIMIT 1
`, userID).Scan(&p.ID, &p.Name, &p.Description, &p.PrimaryColor, &p.SecondaryColor, &p.InviteCode, &p.ManagerName)
	if errors.Is(err, sql.ErrNoRows) {
		return p, ErrNotFound
	}
	return p, err
}

func (s *Store) role(ctx context.Context, userID int64) (string, error) {
	var role string
	err := s.db.QueryRowContext(ctx, `SELECT role FROM users WHERE id=$1`, userID).Scan(&role)
	if errors.Is(err, sql.ErrNoRows) {
		return "", ErrNotFound
	}
	return role, err
}


type ParanzaOnboardingParams struct {
	Name           string
	Description    string
	ManagerName    string
	PrimaryColor   string
	SecondaryColor string
	PhotoURL       string
}

func (s *Store) UpsertParanzaOnboarding(ctx context.Context, userID int64, in ParanzaOnboardingParams) (model.Paranza, error) {
	role, err := s.role(ctx, userID)
	if err != nil {
		return model.Paranza{}, err
	}
	if role != "capoparanza" {
		return model.Paranza{}, ErrForbidden
	}

	managerName := strings.TrimSpace(in.ManagerName)
	parts := strings.Fields(managerName)
	firstName := ""
	lastName := ""
	if len(parts) > 0 {
		firstName = parts[0]
	}
	if len(parts) > 1 {
		lastName = strings.Join(parts[1:], " ")
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return model.Paranza{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
UPDATE users
SET first_name=$1, last_name=$2, photo_url=$3
WHERE id=$4
`, firstName, lastName, in.PhotoURL, userID); err != nil {
		return model.Paranza{}, fmt.Errorf("update manager profile: %w", err)
	}

	inviteCode := fmt.Sprintf("MP-%06d", userID)
	var p model.Paranza
	if err := tx.QueryRowContext(ctx, `
INSERT INTO paranze (
	name, description, manager_user_id, primary_color, secondary_color, invite_code
)
VALUES ($1,$2,$3,$4,$5,$6)
ON CONFLICT (manager_user_id) DO UPDATE SET
	name=EXCLUDED.name,
	description=EXCLUDED.description,
	primary_color=EXCLUDED.primary_color,
	secondary_color=EXCLUDED.secondary_color
RETURNING id, name, description, primary_color, secondary_color, invite_code
`,
		strings.TrimSpace(in.Name),
		strings.TrimSpace(in.Description),
		userID,
		in.PrimaryColor,
		in.SecondaryColor,
		inviteCode,
	).Scan(
		&p.ID,
		&p.Name,
		&p.Description,
		&p.PrimaryColor,
		&p.SecondaryColor,
		&p.InviteCode,
	); err != nil {
		return model.Paranza{}, fmt.Errorf("upsert paranza onboarding: %w", err)
	}

	p.ManagerName = strings.TrimSpace(strings.TrimSpace(firstName + " " + lastName))
	if err := tx.Commit(); err != nil {
		return model.Paranza{}, err
	}
	return p, nil
}

func (s *Store) Events(ctx context.Context, userID int64) ([]model.Event, error) {
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return nil, err
	}
	rows, err := s.db.QueryContext(ctx, `
SELECT e.id,e.type,e.title,e.description,e.location,e.starts_at,e.ends_at,e.required,e.attire,
       COALESCE(r.status,''),
       (SELECT COUNT(*) FROM rsvps rr WHERE rr.event_id=e.id)
FROM events e
LEFT JOIN rsvps r ON r.event_id=e.id AND r.user_id=$1
WHERE e.paranza_id=$2
ORDER BY e.starts_at ASC
`, userID, p.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Event
	for rows.Next() {
		var e model.Event
		if err := rows.Scan(&e.ID, &e.Type, &e.Title, &e.Description, &e.Location, &e.StartsAt, &e.EndsAt, &e.Required, &e.Attire, &e.RSVP, &e.ParticipantCount); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

type CreateEventParams struct {
	Type, Title, Description, Location, Attire string
	StartsAt, EndsAt                          time.Time
	Required                                 bool
}

func (s *Store) CreateEvent(ctx context.Context, userID int64, in CreateEventParams) (model.Event, error) {
	if role, err := s.role(ctx, userID); err != nil || role != "capoparanza" {
		if err != nil {
			return model.Event{}, err
		}
		return model.Event{}, ErrForbidden
	}
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return model.Event{}, err
	}
	var e model.Event
	err = s.db.QueryRowContext(ctx, `
INSERT INTO events (paranza_id,type,title,description,location,starts_at,ends_at,required,attire)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
RETURNING id,type,title,description,location,starts_at,ends_at,required,attire
`, p.ID, in.Type, in.Title, in.Description, in.Location, in.StartsAt, in.EndsAt, in.Required, in.Attire).
		Scan(&e.ID, &e.Type, &e.Title, &e.Description, &e.Location, &e.StartsAt, &e.EndsAt, &e.Required, &e.Attire)
	return e, err
}

func (s *Store) Participants(ctx context.Context, userID, eventID int64) ([]model.Participant, error) {
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return nil, err
	}
	var belongs bool
	if err := s.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM events WHERE id=$1 AND paranza_id=$2)`, eventID, p.ID).Scan(&belongs); err != nil {
		return nil, err
	}
	if !belongs {
		return nil, ErrNotFound
	}
	rows, err := s.db.QueryContext(ctx, `
SELECT u.id, u.first_name || ' ' || u.last_name, u.position,
       COALESCE(r.status,''), m.active
FROM memberships m
JOIN users u ON u.id=m.user_id
LEFT JOIN rsvps r ON r.user_id=u.id AND r.event_id=$1
WHERE m.paranza_id=$2
ORDER BY u.last_name,u.first_name
`, eventID, p.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Participant
	for rows.Next() {
		var v model.Participant
		if err := rows.Scan(&v.UserID, &v.Name, &v.Position, &v.Status, &v.IsActive); err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, rows.Err()
}

func (s *Store) SetRSVP(ctx context.Context, userID, eventID int64, status string) error {
	if status != "confirmed" && status != "maybe" && status != "absent" {
		return fmt.Errorf("invalid status")
	}
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return err
	}
	var allowed bool
	if err := s.db.QueryRowContext(ctx, `
SELECT EXISTS(
  SELECT 1 FROM events e
  JOIN memberships m ON m.paranza_id=e.paranza_id
  WHERE e.id=$1 AND e.paranza_id=$2 AND m.user_id=$3
)
`, eventID, p.ID, userID).Scan(&allowed); err != nil {
		return err
	}
	if !allowed {
		return ErrForbidden
	}
	_, err = s.db.ExecContext(ctx, `
INSERT INTO rsvps (event_id,user_id,status)
VALUES ($1,$2,$3)
ON CONFLICT (event_id,user_id)
DO UPDATE SET status=EXCLUDED.status, updated_at=NOW()
`, eventID, userID, status)
	return err
}

func (s *Store) Messages(ctx context.Context, userID int64) ([]model.Message, error) {
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return nil, err
	}
	rows, err := s.db.QueryContext(ctx, `
SELECT m.id,m.title,m.body,u.first_name || ' ' || u.last_name,m.created_at
FROM messages m JOIN users u ON u.id=m.sender_user_id
WHERE m.paranza_id=$1
ORDER BY m.created_at DESC
LIMIT 100
`, p.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Message
	for rows.Next() {
		var m model.Message
		if err := rows.Scan(&m.ID, &m.Title, &m.Body, &m.SenderName, &m.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

func (s *Store) CreateMessage(ctx context.Context, userID int64, title, body string) (model.Message, error) {
	if role, err := s.role(ctx, userID); err != nil || role != "capoparanza" {
		if err != nil {
			return model.Message{}, err
		}
		return model.Message{}, ErrForbidden
	}
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return model.Message{}, err
	}
	var m model.Message
	err = s.db.QueryRowContext(ctx, `
INSERT INTO messages (paranza_id,sender_user_id,title,body)
VALUES ($1,$2,$3,$4)
RETURNING id,title,body,created_at
`, p.ID, userID, title, body).Scan(&m.ID, &m.Title, &m.Body, &m.CreatedAt)
	if err != nil {
		return model.Message{}, err
	}
	u, _ := s.GetUser(ctx, userID)
	m.SenderName = u.FirstName + " " + u.LastName
	return m, nil
}

func (s *Store) Members(ctx context.Context, userID int64) ([]model.Member, error) {
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return nil, err
	}
	rows, err := s.db.QueryContext(ctx, `
SELECT u.id,u.first_name || ' ' || u.last_name,u.position,m.active
FROM memberships m JOIN users u ON u.id=m.user_id
WHERE m.paranza_id=$1
ORDER BY m.active DESC,u.last_name,u.first_name
`, p.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Member
	for rows.Next() {
		var m model.Member
		if err := rows.Scan(&m.UserID, &m.Name, &m.Position, &m.IsActive); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

func (s *Store) Stats(ctx context.Context, userID int64) (model.Stats, error) {
	p, err := s.getParanza(ctx, userID)
	if err != nil {
		return model.Stats{}, err
	}
	var st model.Stats
	if err := s.db.QueryRowContext(ctx, `
SELECT COUNT(*), COUNT(*) FILTER (WHERE active)
FROM memberships WHERE paranza_id=$1
`, p.ID).Scan(&st.MemberCount, &st.ActiveMemberCount); err != nil {
		return st, err
	}
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM events WHERE paranza_id=$1`, p.ID).Scan(&st.EventCount); err != nil {
		return st, err
	}
	var eventID sql.NullInt64
	if err := s.db.QueryRowContext(ctx, `
SELECT id FROM events WHERE paranza_id=$1 ORDER BY starts_at ASC LIMIT 1
`, p.ID).Scan(&eventID); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return st, err
	}
	if eventID.Valid && st.MemberCount > 0 {
		var confirmed int
		if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM rsvps WHERE event_id=$1 AND status='confirmed'`, eventID.Int64).Scan(&confirmed); err != nil {
			return st, err
		}
		st.AttendanceRate = float64(confirmed) / float64(st.MemberCount) * 100
	}
	return st, nil
}

func (s *Store) Notifications(ctx context.Context, userID int64) ([]model.Notification, error) {
	events, err := s.Events(ctx, userID)
	if err != nil {
		return nil, err
	}
	messages, err := s.Messages(ctx, userID)
	if err != nil {
		return nil, err
	}
	var out []model.Notification
	for _, e := range events {
		if e.StartsAt.Before(time.Now().Add(7 * 24 * time.Hour)) && e.StartsAt.After(time.Now()) {
			body := e.StartsAt.Local().Format("02/01 alle 15:04") + " · " + e.Location
			if e.Attire != "" {
				body += " · " + e.Attire
			}
			out = append(out, model.Notification{
				ID: fmt.Sprintf("event-%d", e.ID), Kind: "event",
				Title: "Promemoria: " + e.Title, Body: body, CreatedAt: time.Now(),
			})
		}
	}
	for i, m := range messages {
		if i >= 3 {
			break
		}
		out = append(out, model.Notification{
			ID: fmt.Sprintf("message-%d", m.ID), Kind: "message",
			Title: m.Title, Body: m.Body, CreatedAt: m.CreatedAt,
		})
	}
	return out, nil
}
