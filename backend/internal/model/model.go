package model

import "time"

type User struct {
	ID        int64  `json:"id"`
	Role      string `json:"role"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	BirthDate string `json:"birthDate,omitempty"`
	PhotoURL  string `json:"photoUrl,omitempty"`
	Position  string `json:"position,omitempty"`
}

type Paranza struct {
	ID             int64  `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	PrimaryColor   string `json:"primaryColor"`
	SecondaryColor string `json:"secondaryColor"`
	InviteCode     string `json:"inviteCode,omitempty"`
	ManagerName    string `json:"managerName"`
}

type Me struct {
	User    User     `json:"user"`
	Paranza *Paranza `json:"paranza,omitempty"`
}

type Event struct {
	ID               int64     `json:"id"`
	Type             string    `json:"type"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	Location         string    `json:"location"`
	StartsAt         time.Time `json:"startsAt"`
	EndsAt           time.Time `json:"endsAt"`
	Required         bool      `json:"required"`
	Attire           string    `json:"attire,omitempty"`
	RSVP             string    `json:"rsvp,omitempty"`
	ParticipantCount int       `json:"participantCount"`
}

type Participant struct {
	UserID    int64  `json:"userId"`
	Name      string `json:"name"`
	Position  string `json:"position"`
	Status    string `json:"status"`
	IsActive  bool   `json:"isActive"`
}

type Message struct {
	ID         int64     `json:"id"`
	Title      string    `json:"title"`
	Body       string    `json:"body"`
	SenderName string    `json:"senderName"`
	CreatedAt  time.Time `json:"createdAt"`
}

type Member struct {
	UserID   int64  `json:"userId"`
	Name     string `json:"name"`
	Position string `json:"position"`
	IsActive bool   `json:"isActive"`
}

type Stats struct {
	MemberCount       int     `json:"memberCount"`
	ActiveMemberCount int     `json:"activeMemberCount"`
	EventCount        int     `json:"eventCount"`
	AttendanceRate    float64 `json:"attendanceRate"`
}

type Notification struct {
	ID        string    `json:"id"`
	Kind      string    `json:"kind"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"createdAt"`
}
