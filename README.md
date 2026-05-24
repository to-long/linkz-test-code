# Seat Reservation Platform

A public seat reservation system built with TypeScript, demonstrating engineering judgment in authentication, concurrency control, payment handling, and operational reliability.

## Screenshots

### Desktop

| Login | Seat Selection |
|:---:|:---:|
| ![Login](docs/screenshots/desktop-login.png) | ![Seats](docs/screenshots/desktop-seats.png) |

| Multi-Seat Selecting | Stripe Checkout |
|:---:|:---:|
| ![Selecting](docs/screenshots/desktop-seat-selecting.png) | ![Payment](docs/screenshots/desktop-payment.png) |

| Booking Confirmed | My Tickets |
|:---:|:---:|
| ![Success](docs/screenshots/desktop-success-confirm.png) | ![Tickets](docs/screenshots/desktop-tickets.png) |

| Tickets (Empty) | Past Tickets (Used) |
|:---:|:---:|
| ![Empty](docs/screenshots/desktop-tickets-empty.png) | ![Used](docs/screenshots/desktop-tickets-used.png) |

### Mobile

| Login | Seats | Selecting (3 seats) |
|:---:|:---:|:---:|
| ![Login](docs/screenshots/mobile-login.png) | ![Seats](docs/screenshots/mobile-seats.png) | ![Selecting](docs/screenshots/mobile-seats-selecting.png) |

| Stripe Checkout ($45) | Booking Confirmed (C4, D3) | After Booking |
|:---:|:---:|:---:|
| ![Payment](docs/screenshots/mobile-payment.png) | ![Success](docs/screenshots/mobile-success-confirm.png) | ![Booked](docs/screenshots/mobile-seats-selected.png) |

| Drawer Menu | My Tickets |
|:---:|:---:|
| ![Menu](docs/screenshots/mobile-drawer.png) | ![Tickets](docs/screenshots/mobile-tickets.png) |

## UX Design

All screens were designed in `SeatBooking.pen` before implementation:

- **Design System** — Buttons, cards, alerts, forms, navigation components
- **Login Page** — Email/password sign-in with Google OAuth option
- **Booking Page** — 4×4 seat grid with status indicators and booking summary
- **Success Page** — Booking confirmation with ticket details
- **My Tickets Page** — Upcoming/past tickets with filtering
- **Profile Menu** — User info, ticket count, logout
- **Language Selector** — EN / ZH / TH switcher
- **Reusable Components** — `AppLayout`, `AppHeader` shared across all pages

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Runtime** | Bun | Fast startup, native TypeScript, built-in test runner |
| **Backend** | Hono + Drizzle ORM + Zod OpenAPI | Type-safe API with auto-generated OpenAPI spec and Scalar docs |
| **Frontend** | React 19 + Rsbuild + Zustand + React Router | Modern bundler (Rspack-based), lightweight state management, SPA routing |
| **Database** | PostgreSQL 17 | ACID transactions, battle-tested for concurrent writes |
| **ORM** | Drizzle | Type-safe queries, lightweight, SQL-first philosophy |
| **Auth** | better-auth | Session-based auth with 90-day expiry, built-in Drizzle adapter |
| **Payments** | Stripe Checkout | PCI-compliant hosted payment page, webhook-based confirmation |
| **Real-time** | Bun WebSocket | Native WebSocket for instant seat updates, polling fallback |
| **i18n** | Paraglide JS | Compiled translations (EN/ZH/ID), zero runtime overhead |
| **API Docs** | Scalar + openapi-typescript | Interactive API reference UI, auto-generated FE types from spec |
| **Styling** | Tailwind CSS | Utility-first, rapid prototyping, dark mode support |
| **Testing** | Bun Test | Built-in test runner, unit + e2e + concurrency tests |
| **Component Dev** | Storybook | Visual component testing, isolated from router/auth/i18n |
| **Linting** | Biome | Fast all-in-one linter and formatter, replaces ESLint + Prettier |
| **Monorepo** | Bun workspaces | Shared validators between FE/BE, single runtime for everything |

## Architecture

```
seat-reservation/
├── apps/
│   ├── be/          # Hono API server (port 8081)
│   └── fe/          # React SPA (port 3031, proxies /api → BE)
├── packages/
│   └── shared/      # Zod validators + TypeScript types
└── docker-compose.yml  # PostgreSQL 17
```

### System Architecture

```mermaid
graph TB
    Browser["🌐 Browser"]
    SPA["⚛️ React SPA<br/>(port 3031)"]
    API["🔥 Hono API<br/>(port 8081)"]
    WS["📡 WebSocket"]
    DB[("🐘 PostgreSQL 17")]
    Stripe["💳 Stripe"]
    Auth["🔐 better-auth"]

    Browser -->|HTTP| SPA
    SPA -->|"/api/*" proxy| API
    SPA <-->|Real-time seat updates| WS
    API --> DB
    API --> Auth
    Auth --> DB
    API -->|Create Checkout Session| Stripe
    Stripe -->|Webhook: payment confirmed| API
    WS --> DB
```

### Seat State Diagram

```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> Held: User selects seat
    Held --> Available: User releases / TTL expires (10 min)
    Held --> Reserved: Stripe webhook confirms payment
    Reserved --> [*]

    note right of Held
        setTimeout per seat (exact TTL expiry)
        Timers restored from DB on server restart
        Broadcasts release via WebSocket
    end note
```

### Booking & Payment Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React SPA
    participant BE as Hono API
    participant DB as PostgreSQL
    participant S as Stripe

    User->>FE: Select multiple seats
    loop For each seat
        FE->>BE: POST /api/seats/:id/hold
        BE->>DB: UPDATE seats SET status='held' WHERE status='available'
        DB-->>BE: OK (optimistic lock)
        BE-->>FE: Seat held (10-min TTL)
        BE-)FE: WebSocket: seat status update
    end

    User->>FE: Click "Confirm Booking"
    FE->>BE: POST /api/payments {seatIds: [...]}
    BE->>DB: Verify all seats held by user
    BE->>DB: INSERT payment (pending, total amount)
    BE->>S: Create Checkout Session (multiple line items)
    S-->>BE: Session URL
    BE-->>FE: {checkoutUrl}
    FE->>S: Redirect to Stripe Checkout

    User->>S: Enter card & pay
    S--)BE: Webhook: checkout.session.completed
    BE->>DB: UPDATE payment SET status='completed'
    loop For each seat
        BE->>DB: UPDATE seat SET status='reserved'
        BE->>DB: INSERT reservation
    end
    BE-)FE: WebSocket: seats reserved

    S-->>FE: Redirect to /payment/success
    FE->>BE: GET /api/payments/status?session_id=
    BE-->>FE: {payment, reservation}
    FE->>User: Show booking confirmation (all seats)
```

### Key Design Decisions

**1. Seat Hold Pattern (Optimistic Locking)**

Instead of immediately reserving a seat on selection, the system implements a two-phase approach:
- **Hold phase**: User selects a seat → seat is marked as `held` with a 10-minute TTL
- **Payment phase**: User confirms payment → seat transitions from `held` to `reserved`

This prevents seats from being permanently locked by users who abandon the flow. Expired holds are cleaned up via an event-driven scheduler:
- **Per-seat `setTimeout`**: When a seat is held, a timer is scheduled for the exact TTL expiry. When it fires, the seat is released and all clients are notified via WebSocket — zero polling, zero delay
- **Restart-safe**: On server startup, all active holds are loaded from DB (`heldUntil` column) and timers are re-scheduled for the remaining TTL
- **Defensive fallback**: `releaseExpiredHolds()` is also called on every seat query as a safety net

**2. Optimistic Concurrency Control**

The hold and payment operations use WHERE-clause guards instead of database-level locks:

```sql
UPDATE seats SET status = 'held'
WHERE id = :id AND status = 'available'
```

If two users try to hold the same seat simultaneously, only one succeeds — the other gets a conflict response. This avoids pessimistic locking overhead while still preventing double-booking.

**Trade-off**: Under extreme concurrency (thousands of simultaneous requests), `SELECT ... FOR UPDATE` would be more correct. For a cinema hall with typical traffic, optimistic locking is simpler and sufficient.

**3. Stripe Checkout Integration (Multi-Seat)**

Payment supports multiple seats in a single transaction via Stripe Checkout Sessions with webhook-based async confirmation:

1. User selects up to 4 seats → clicks "Confirm Booking" → BE creates a Stripe Checkout Session with **multiple line items** (one per seat) → FE redirects to Stripe's hosted payment page
2. User completes payment on Stripe → Stripe sends `checkout.session.completed` webhook → BE reserves **all seats** and creates reservation records for each
3. User is redirected back to `/payment/success` → FE polls payment status until webhook confirms reservation → success page shows all reserved seat labels

This approach is production-ready:
- **PCI compliance**: Card details never touch our server (Stripe Checkout handles everything)
- **Multi-seat atomicity**: All seats are paid in one Stripe session; webhook reserves them all together
- **Webhook-based confirmation**: No race conditions — seats are reserved only after payment is confirmed by Stripe
- **Idempotent processing**: Optimistic concurrency on the `payments` table prevents double-reservation even if webhook fires twice
- **Graceful expiry**: Stripe session expires in 30 min → triggers `checkout.session.expired` webhook → payment marked as expired
- **Fallback verification**: If webhook is delayed, the success page verifies payment status directly via Stripe API

**Trade-off**: Webhook delivery is eventually consistent (typically < 5 seconds). The success page polls until the webhook has processed, with a direct Stripe API verification fallback if the webhook hasn't arrived after several retries.

**4. Session-Based Auth with 90-Day Expiry**

better-auth provides session cookies with:
- 90-day absolute expiry (per requirement)
- 24-hour rolling refresh (reduces DB lookups)
- 5-minute cookie cache (performance optimization)
- HttpOnly cookies (XSS protection)

**Trade-off**: Session-based auth requires DB lookups on every request. The cookie cache mitigates this for active users. For a high-traffic system, I'd consider JWT with short-lived tokens + refresh tokens, but sessions are simpler to revoke and more secure by default.

**5. Shared Validators (Single Source of Truth)**

Zod schemas in `packages/shared` are used by both frontend forms and backend API validation. This eliminates schema drift between client and server.

**6. Real-Time Updates (WebSocket + Polling Fallback)**

The seats page connects via WebSocket for instant seat status updates. If WebSocket connection fails, it falls back to polling every 5 seconds.

**Trade-off**: WebSocket gives instant updates but requires connection management. The fallback polling ensures reliability even if WebSocket is unavailable. Bun's native WebSocket support makes the server-side implementation lightweight.

**7. Internationalization (i18n)**

The app supports three languages (English, Chinese, Indonesian) via Paraglide JS with zero-runtime-overhead compiled translations. Language can be switched from the header or mobile drawer menu.

**8. Dark Mode**

Full dark mode support with a toggle in the header. Theme preference is persisted in local storage via Zustand.

## Testing

**70 tests** across all packages, run with `make test`:

| Package | Type | Tests | What it covers |
|---------|------|------:|----------------|
| `shared` | Unit | 28 | Zod validators (login, signup, multi-seat payment schemas) |
| `fe` | Unit | 17 | Zustand store (locale, theme) + API client with mocked fetch |
| `be` | E2E | 20 | Health, OpenAPI spec, seat CRUD, auth guards, authenticated flow |
| `be` | Concurrency | 5 | 10 users race to hold same seat → exactly 1 wins (optimistic locking) |

```bash
make test              # unit tests (no server needed)
make test-e2e          # API tests (requires make dev)
make test-concurrency  # concurrency tests (requires make dev)
```

The **concurrency test** is the most interesting — it creates 10 users, fires simultaneous `POST /seats/:id/hold` requests, and verifies that the `WHERE status = 'available'` guard allows exactly 1 winner while the other 9 get `409 Conflict`.

## Operational Considerations

### What I'd Add for Production

1. **Rate limiting** on auth endpoints (prevent brute-force)
2. **Request idempotency keys** on payment confirmation (prevent double-charges)
3. **Structured logging** (JSON logs with correlation IDs for request tracing)
4. **Health check endpoint** (`/api/health` already exists)
5. **Database connection pooling** (PgBouncer or built-in pool)
6. **Distributed timer** for hold cleanup (replace in-memory `setTimeout` with BullMQ delayed jobs for multi-instance deployments)
7. **CSRF protection** on state-mutating endpoints
8. **Input sanitization** beyond Zod validation
9. **Monitoring/alerting** (Sentry, Grafana)
10. **Blue-green deployment** with zero-downtime migrations

### Security Considerations

- Passwords hashed with bcrypt (via better-auth)
- HttpOnly session cookies (no JS access)
- CORS restricted to frontend origin
- SQL injection prevented by parameterized queries (Drizzle ORM)
- User can only hold/pay for seats they themselves hold (ownership check)
- Stripe webhook signature verification (prevents forged webhook events)
- PCI compliance: card details never touch our server (Stripe Checkout hosted page)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Colima](https://github.com/abiosoft/colima), [Docker Desktop](https://www.docker.com/products/docker-desktop/), or any Docker-compatible runtime

### Setup

```bash
# 1. Copy environment file and configure
cp .env.example .env

# 2. Install, start DB, migrate, and seed — all in one
make i          # bun install
make up         # docker compose up -d (PostgreSQL)
make migrate    # run database migrations
make seed       # seed 16 seats + test user

# Or run all four at once:
make setup

# 3. Start development servers
make dev        # starts both BE (port 8081) and FE (port 3031)
```

**Available make commands:**

| Command | Description |
|---------|-------------|
| `make i` | Install dependencies (`bun install`) |
| `make up` / `make down` | Start / stop PostgreSQL container |
| `make migrate` | Run database migrations |
| `make seed` | Seed seats and test user |
| `make setup` | Run install → up → migrate → seed in one step |
| `make dev` | Start both BE and FE dev servers |
| `make dev-be` / `make dev-fe` | Start backend / frontend separately |
| `make kill` | Kill processes on ports 8081 and 3031 |
| `make test` | Run all unit tests (shared + FE + BE) |
| `make test-e2e` | Run E2E API tests (requires `make dev`) |
| `make test-concurrency` | Run concurrency tests (requires `make dev`) |
| `make storybook` | Launch Storybook on port 6006 |
| `make openapi-gen` | Regenerate FE types from OpenAPI spec |
| `make lint` / `make format` | Lint / format code with Biome |

### Stripe Test Setup

1. Create a free [Stripe account](https://dashboard.stripe.com/register)
2. Go to [API keys](https://dashboard.stripe.com/test/apikeys) and copy your **Secret key** (`sk_test_...`)
3. Install [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:
   ```bash
   stripe login
   stripe listen --forward-to localhost:8081/api/stripe/webhook
   ```
4. Copy the webhook signing secret (`whsec_...`) from the CLI output
5. Add both keys to `.env`

**Test card numbers:**

| Card | Behavior |
|------|----------|
| `4242 4242 4242 4242` | Always succeeds |
| `4000 0000 0000 0002` | Always declines |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date, any 3-digit CVC, and any postal code.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5438/seat_reservation` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | (see .env.example) | Session signing secret (change in production!) |
| `BETTER_AUTH_URL` | `http://localhost:8081` | Backend URL for auth |
| `FRONTEND_URL` | `http://localhost:3031` | Frontend URL (CORS origin) |
| `PORT` | `8081` | Backend server port |
| `STRIPE_SECRET_KEY` | — | Stripe test secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | — | Stripe test publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook signing secret (`whsec_...`) |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret (optional) |

### Test Account

After running `bun run db:seed`, you can sign up with any email or use the seeded test account:

| Field | Value |
|-------|-------|
| Email | `test@example.com` |
| Password | `password123` |

> To create this account, run after seeding:
> ```bash
> curl -X POST http://localhost:8081/api/auth/sign-up/email \
>   -H "Content-Type: application/json" \
>   -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
> ```
> Or simply sign up through the UI at `http://localhost:3031/signup`.

### Usage

1. Open `http://localhost:3031`
2. Sign up for a new account or use the test account above
3. Select one or more available seats (up to 4 per booking)
4. Click "Confirm Booking" → redirected to Stripe Checkout with all selected seats as line items
5. Enter test card `4242 4242 4242 4242` with any expiry/CVC
6. Complete payment → redirected back to success page showing all reserved seats
7. All seats are reserved in a single transaction!

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/auth/sign-up/email` | No | Register new user |
| `POST` | `/api/auth/sign-in/email` | No | Login |
| `GET` | `/api/seats` | No | List all seats with current status |
| `POST` | `/api/seats/:id/hold` | Yes | Hold a seat (10-min TTL) |
| `POST` | `/api/seats/:id/release` | Yes | Release a held seat |
| `POST` | `/api/payments` | Yes | Create Stripe Checkout Session for held seats (multi-seat) |
| `GET` | `/api/payments/status?session_id=` | Yes | Check payment/reservation status |
| `POST` | `/api/stripe/webhook` | No* | Stripe webhook (signature verified) |

## Database Schema

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│   user   │     │  seats   │     │   payments   │
│──────────│     │──────────│     │──────────────│
│ id (PK)  │◄────│ held_by  │     │ id (PK)      │
│ name     │     │ reserved │     │ user_id      │
│ email    │     │  _by     │     │ amount       │
│ password │     │ status   │     │ seat_ids     │ ← JSON array
│ ...      │     │ price    │     │ status       │
└──────────┘     │ label    │     │ expires_at   │
                 └──────────┘     └──────────────┘
                      ▲                  │
                      │                  │ 1:N
                      │           ┌──────────────┐
                      │           │ reservations │
                      │           │──────────────│
                      │           │ id (PK)      │
                      └───────────│ seat_id (FK) │ UNIQUE
                                  │ user_id      │
                                  │ payment_id   │──► payments
                                  └──────────────┘
```

One payment can cover multiple seats (up to 4). The `seat_ids` field in `payments` stores a JSON array of seat UUIDs for reference, while the `reservations` table provides the normalized 1:N relationship between a payment and its reserved seats.

## Time Spent

Approximately 2 hours of focused implementation covering:
- Monorepo setup and tooling configuration
- Database schema design with concurrency handling
- Authentication integration with 90-day sessions
- Full reservation flow (hold → pay → reserve)
- Frontend with real-time seat status updates
- Documentation and trade-off analysis
