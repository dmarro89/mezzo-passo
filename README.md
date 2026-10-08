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

La UI principale usa ancora dati demo per permettere di iterare rapidamente, ma l'**onboarding Capoparanza è ora reale**: nome paranza, nome del capoparanza, descrizione e i due colori scelti vengono salvati via API Go in PostgreSQL. Il login resta volutamente demo e verrà sostituito per ultimo.

## Provare l'onboarding Capoparanza

Da questo step servono backend e PostgreSQL, perché la configurazione della paranza viene persistita realmente.

Prerequisiti:

- Podman
- Go 1.24+
- Node.js 22.13+
- Expo Go sul telefono, se vuoi provarlo su dispositivo fisico

### 1. Database con Podman

Su macOS assicurati prima che la VM di Podman sia avviata:

```bash
podman machine start
```

Avvia PostgreSQL direttamente con Podman:

```bash
podman volume create mezzo_passo_pg

podman run -d \
  --name mezzo-passo-postgres \
  -e POSTGRES_DB=mezzo_passo \
  -e POSTGRES_USER=mezzo \
  -e POSTGRES_PASSWORD=mezzo \
  -p 5432:5432 \
  -v mezzo_passo_pg:/var/lib/postgresql/data \
  docker.io/library/postgres:17-alpine
```

Verifica che sia partito:

```bash
podman ps
podman logs mezzo-passo-postgres
```

Per fermarlo e riavviarlo:

```bash
podman stop mezzo-passo-postgres
podman start mezzo-passo-postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env
export DATABASE_URL='postgres://mezzo:mezzo@localhost:5432/mezzo_passo?sslmode=disable'
go mod tidy
go run ./cmd/api
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

## Onboarding API

Dopo il login demo del capoparanza, l'app usa:

```
PUT /api/v1/onboarding/paranza
```

per creare o aggiornare in modo idempotente la paranza del capoparanza. Il backend persiste nome, descrizione, capoparanza, colori e codice invito.

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
