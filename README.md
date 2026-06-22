# PearlDesk — Dental Practice Management

> **Your practice, perfectly managed.**

PearlDesk is a full-stack, multi-tenant MERN application for dental practice management. Each clinic operates in complete data isolation — patients, appointments, staff, and clinical records are scoped to their organization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, Bootstrap 5, GSAP 3 |
| Routing | React Router DOM v6 |
| HTTP | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT with account lockout protection |
| Security | Helmet, rate limiting, express-validator, express-mongo-sanitize, xss-clean, hpp, CORS |

---

## Features

### Platform
- **Multi-tenant architecture** — complete data isolation per clinic via `organizationId` scoping
- **Organization approval workflow** — clinics require SysAdmin approval before staff can log in
- **Seat-based licensing** — max 1 admin and max 2 staff per organization
- **Role-based access** — Admin and Staff roles with separate permissions
- **Secure clinic lookup** — slug-based two-step authentication prevents enumeration attacks

### Clinical
- Patient management — add, edit, delete, search, paginate
- Interactive dental chart (Universal/FDI notation) — full mouth and quadrant views
- Pediatric charting — automatically activated for patients aged 7 and under (primary teeth, letter notation)
- Per-tooth surface tracking — MODBL notation (Mesial, Occlusal, Distal, Buccal, Lingual, Incisal)
- Clinical notes — add, edit, delete, paginated newest-first
- Treatment plans — procedure, tooth/surface reference, cost (₱), status tracking (Proposed → In Progress → Completed)
- Appointment scheduling — Day / Week / Month calendar views, status management, rescheduling

### UI / UX
- Warm, professional design system — cream backgrounds (`#FDF8F3`), dental teal (`#2A9D8F`), coral accent (`#E76F51`)
- Lora serif for headings, DM Sans for UI, consistent spacing and border-radius tokens
- Fully responsive — mobile-first layouts, collapsible sidebar, no horizontal scroll
- GSAP-powered landing page with scroll-triggered animations
- PearlDesk landing page with Navbar, Hero, Features, How It Works, FAQ, Contact, Footer sections
- System Admin dashboard — separate dark-themed panel for tenant management

---

## Project Structure

```
dental-app/
├── client/                        # Vite + React frontend
│   ├── index.html                 # Vite entry point (CDN links: Bootstrap 5, Bootstrap Icons, Lora/DM Sans fonts)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Layout.jsx         # App shell — collapsible sidebar, mobile top bar
│       │   ├── Navbar.jsx         # Re-exports public Navbar from Home.jsx
│       │   ├── AppointmentModal.jsx
│       │   ├── PatientModal.jsx
│       │   ├── DentalChart.jsx    # Adult 32-tooth chart (Universal/FDI)
│       │   ├── PediatricDentalChart.jsx  # Primary 20-tooth chart (A–E notation)
│       │   └── TreatmentPlanList.jsx
│       ├── context/
│       │   └── AuthContext.jsx    # Login, register, logout, JWT persistence
│       ├── pages/
│       │   ├── Home.jsx           # PearlDesk landing page + shared Navbar export
│       │   ├── Login.jsx          # Two-step login (slug → credentials)
│       │   ├── Register.jsx       # Clinic + admin account registration
│       │   ├── Dashboard.jsx
│       │   ├── PatientList.jsx
│       │   ├── PatientDetails.jsx # Tabs: Info, Dental Chart, Treatment Plans, Notes
│       │   ├── Schedule.jsx       # Day / Week / Month calendar
│       │   ├── AccountSettings.jsx
│       │   ├── ChangePassword.jsx
│       │   ├── SysAdminLogin.jsx
│       │   └── SysAdminDashboard.jsx
│       ├── utils/
│       │   ├── api.js             # Axios instance with auth interceptor
│       │   └── sanitize.js        # Client-side input sanitization helpers
│       ├── index.css              # Design tokens, landing page styles, Tailwind directives
│       └── main.jsx
└── server/                        # Express backend
    ├── config/
    │   └── db.js                  # MongoDB connection
    ├── middleware/
    │   ├── authMiddleware.js      # JWT verification
    │   ├── errorHandler.js
    │   ├── seatLimiter.js         # Enforces admin/staff seat limits
    │   └── validation.js          # express-validator rules
    ├── models/
    │   ├── Organization.js
    │   ├── User.js
    │   ├── Patient.js
    │   ├── Appointment.js
    │   └── SystemAdmin.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── patientRoutes.js
    │   ├── appointmentRoutes.js
    │   ├── organizationRoutes.js
    │   └── sysAdminRoutes.js
    ├── seed.js                    # Demo data seeder
    └── server.js                  # Entry point
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB instance

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret_minimum_32_chars
PORT=5000
CLIENT_URL=http://localhost:5173
SUPER_ADMIN_MASTER_SECRET=your_super_admin_secret
```

```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### 3. Seed Demo Data

```bash
node server/seed.js
```



> Change these immediately after first login.

---

## Authentication Flow

### Two-Step Login
1. User enters their clinic slug (e.g., `bright-smiles-clinic`)
2. Slug is verified via `POST /api/organization/verify-slug` — rate-limited, no org data exposed
3. User enters username + password
4. JWT issued if credentials are valid **and** the clinic status is `Approved`

### Registration
1. Fill in clinic name, contact email, and phone
2. Create admin credentials (username, email, password)
3. New organization is created with `Pending` status
4. A SysAdmin must approve the organization before anyone can log in

---

## System Admin

The SysAdmin panel is a separate, dark-themed interface for managing all organizations.

### Login
```
POST /api/sys-admin/login
Body: { username, password }
```
Stores `sysAdminToken` in localStorage (separate from regular user auth).

### Endpoints
| Method | Endpoint | Header Required | Description |
|---|---|---|---|
| GET | `/api/sys-admin/organizations` | `X-System-Admin: true` | List all organizations |
| PUT | `/api/sys-admin/organizations/:id/status` | `X-System-Admin: true` | Set Approved / Pending / Suspended |

### Creating the First SysAdmin

Use `server/create-system-admin.js` locally (excluded from git), or insert directly:

```js
db.systemadmins.insertOne({
  username: "sysadmin",
  email: "sysadmin@yourdomain.com",
  password: "<bcrypt hash of your password>"
})
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register clinic + admin (`x-super-admin-secret` header required) |
| POST | `/api/auth/login` | Login (`x-clinic-slug` header required) |
| POST | `/api/auth/change-password` | Change password (authenticated) |

### Patients
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/patients` | List patients (`?search=`, `?page=`) |
| GET | `/api/patients/:id` | Get patient |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| POST | `/api/patients/:id/notes` | Add clinical note |
| PUT | `/api/patients/:id/notes/:noteId` | Update note |
| DELETE | `/api/patients/:id/notes/:noteId` | Delete note |
| POST | `/api/patients/:id/treatment-plans` | Create treatment plan |
| PATCH | `/api/patients/:id/treatment-plans/:planId` | Update treatment plan status |
| PUT | `/api/patients/:id/dental-chart/:toothNumber` | Update tooth (1–32 permanent or A–T primary) |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments` | List (`?date=`, `?startDate=`, `?endDate=`, `?status=`) |
| POST | `/api/appointments` | Create |
| PUT | `/api/appointments/:id` | Update / reschedule |
| DELETE | `/api/appointments/:id` | Delete |

### Organization
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/organization/me` | Get clinic info |
| PUT | `/api/organization/me` | Update clinic info (admin) |
| GET | `/api/organization/users` | List staff |
| POST | `/api/organization/users` | Add staff (admin, max 2) |
| PUT | `/api/organization/users/:userId/role` | Change role (admin, max 1 admin) |
| POST | `/api/organization/verify-slug` | Verify slug exists (rate-limited) |

---

## Deployment

### Backend — Render

1. Create a Web Service pointing to the repo
2. Set **Root Directory** to `server`
3. **Build command:** `npm install`
4. **Start command:** `node server.js`
5. Set environment variables:

| Key | Value |
|---|---|
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | Strong random string (32+ chars) |
| `CLIENT_URL` | Your Vercel frontend URL (no trailing slash) |
| `SUPER_ADMIN_MASTER_SECRET` | Secret for clinic provisioning |
| `NODE_ENV` | `production` |

### Frontend — Vercel

1. Import repo on Vercel
2. Set **Root Directory** to `client`
3. Set environment variable: `VITE_API_URL=https://your-render-service.onrender.com/api`

---

## Security

- Rate limiting on all routes (stricter on auth and slug verification endpoints)
- JWT with 7-day expiry
- Account lockout after 5 failed attempts (15-minute window)
- Helmet security headers
- NoSQL injection protection (`express-mongo-sanitize`)
- XSS protection (`xss-clean`)
- HTTP parameter pollution prevention (`hpp`)
- Input validation on all endpoints (`express-validator`)
- All database queries scoped to `organizationId` — cross-tenant access is structurally impossible
- Clinic slug verification is a `POST` request to prevent browser/CDN caching and response enumeration

See [SECURITY.md](SECURITY.md) for full details.

---

## License

MIT
