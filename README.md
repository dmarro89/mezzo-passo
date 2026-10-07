# Mezzo Passo

MVP mobile per i cullatori della Festa dei Gigli di Nola.

## Stack

- **Mobile:** React Native + Expo SDK 57
- **Backend:** Go, standard library HTTP server
- **Database:** PostgreSQL
- **Deploy:** backend pronto per Render; PostgreSQL può essere Render, Neon, Supabase o qualunque servizio compatibile con `DATABASE_URL`

## Cosa contiene questa prima versione

Due esperienze demo separate:

### Capoparanza

- onboarding minimale
- dashboard della paranza
- creazione eventi
- invio comunicazioni a tutti i cullatori
- elenco partecipanti e stato RSVP
- gestione elenco cullatori e relativa posizione nel Giglio
- statistiche base e promemoria

### Cullatore

- onboarding minimale e accesso alla paranza
- home con prossimo evento
- dettaglio evento
- conferma `Partecipo / Forse / Non partecipo`
- messaggi del capoparanza
- calendario eventi
- profilo e posizione nel Giglio
- notifiche/promemoria

Per rendere il prototipo immediatamente provabile, l'autenticazione MVP usa due identità demo seedate nel database: **Luca Iorio** come capoparanza di **Orgoglio Nolano** e **Davide Esposito** come cullatore. Google/Apple login è volutamente rimandato al passo successivo.

## Avvio locale

Prerequisiti:

- Docker
- Go 1.24+
- Node.js 22.13+
- Expo Go sul telefono, se vuoi provarlo su dispositivo fisico

### 1. Database

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd backend
cp .env.example .env
export DATABASE_URL='postgres://mezzo:mezzo@localhost:5432/mezzo_passo?sslmode=disable'
go mod tidy\ngo run ./cmd/api
```

Verifica:

```bash
curl http://localhost:8080/health
```

### 3. Mobile

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

Se usi **Expo Go su un iPhone fisico**, `localhost` indica il telefono e non il Mac. Imposta quindi in `mobile/.env` l'IP LAN del computer, ad esempio:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.50:8080
```

Poi riavvia Expo dopo la modifica.

## Demo API

Login capoparanza:

```bash
curl -X POST http://localhost:8080/api/v1/demo/login \
  -H 'Content-Type: application/json' \
  -d '{"role":"capoparanza"}'
```

Login cullatore:

```bash
curl -X POST http://localhost:8080/api/v1/demo/login \
  -H 'Content-Type: application/json' \
  -d '{"role":"cullatore"}'
```

Il token restituito va usato come `Authorization: Bearer demo:<id>`.

## Deploy su Render

Il repository include `render.yaml` per il web service Go. Serve impostare `DATABASE_URL` con un PostgreSQL raggiungibile dal servizio.

Per un MVP/hobby project PostgreSQL resta intenzionalmente standard, così non siamo legati a un provider specifico.

## Branch MVP

Lo sviluppo iniziale è nel branch:

```
mvp/initial-version
```
