# Dental Clinic Management System

A full-stack multi-tenant MERN application for managing dental clinic patients, appointments, and medical records. Each clinic operates in complete isolation — patients, appointments, and staff are scoped to their organization.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, React Hot Toast
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT with account lockout protection
- **Security:** Helmet, rate limiting, input validation, XSS & NoSQL injection protection, CORS

## Features

- **Multi-tenant** — each clinic has isolated data with organization scoping
- **Organization Approval Workflow** — clinics must be approved by system admin before access
- **Secure Clinic Lookup** — slug-based authentication prevents enumeration attacks
- **Seat-based Licensing** — max 1 admin, max 2 staff per organization
- Patient management (add, edit, delete, search, paginate)
- Interactive dental chart with FDI notation (full mouth & quadrant views)
- Pediatric dental charting for patients age 7 and under (primary teeth)
- Tooth surface tracking (MODBL notation)
- Clinical notes (add, edit, delete) with pagination
- Treatment plans with status tracking
- Appointment scheduling, status management, and rescheduling
- 7-day schedule view
- Dashboard with today's appointments
- Role-based access (admin / staff)
- Responsive design

## Project Structure

```
dental-app/
├── server/
│   ├── config/           # Database connection
│   ├── middleware/       # Auth, validation, error handling, seat limiter
│   ├── models/           # Organization, User, Patient, Appointment, SystemAdmin
│   ├── routes/           # Auth, patients, appointments, organization, sys-admin
│   ├── seed.js           # Demo data seeder
│   └── server.js         # Entry point
└── client/
    └── src/
        ├── components/   # Layout, modals, DentalChart, PediatricDentalChart
        ├── context/      # AuthContext
        ├── pages/        # Dashboard, PatientList, PatientDetails, Schedule, Register
        └── utils/        # API client, sanitize helpers
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd server
npm install
```

Create `server/.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret_min_32_chars
PORT=5000
CLIENT_URL=http://localhost:5173
SUPER_ADMIN_MASTER_SECRET=your_super_admin_secret_for_clinic_provisioning
```

Start the server:
```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Seed Demo Data

To populate the database with a demo clinic, 10 patients, and 10 appointments:

```bash
node server/seed.js
```

> Credentials are printed to the console after seeding. Change them immediately after first login.

> **Demo credentials:**
> - Clinic slug: `demo-dental-clinic`
> - Admin: `admin` / `Admin123!`
> - Staff: `staff` / `Staff123!`

## Authentication Flow

### Two-Stage Login Process

1. **Enter Clinic Slug** — Users begin by entering their clinic's unique slug (e.g., "demo-dental-clinic")
2. **Slug Verification** — System verifies the clinic exists without exposing any details
3. **Enter Credentials** — After slug is verified, users enter their username and password
4. **Access Check** — Login succeeds only if the clinic status is "Approved"

### Registration Flow

1. Fill in clinic name, email, and phone
2. Create an admin account (username, email, password)
3. **Requires `SUPER_ADMIN_MASTER_SECRET` header** — Only system administrators can provision new clinics
4. A new isolated organization is created with `Pending` status
5. The first account is automatically assigned admin role
6. All subsequent data (patients, appointments) is scoped to that organization
7. Users cannot log in until a system admin approves the clinic

Staff accounts can be added by an admin after registration through the admin panel. Admins can promote or demote staff members to/from admin role as needed (subject to seat limits).

## System Administrator

The system admin panel manages organization approvals and oversights:

### System Admin Login
```bash
POST /api/sys-admin/login
{
  "username": "sysadmin",
  "password": "your_password"
}
```

### Organization Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sys-admin/organizations` | List all organizations (requires `x-system-admin: true` header) |
| PUT | `/api/sys-admin/organizations/:id/status` | Approve/Suspend/Pending status (requires `x-system-admin: true` header) |

### Creating a System Admin

To create the initial system admin, insert directly into MongoDB:

```javascript
// In MongoDB shell or via script
db.systemadmins.insertOne({
  username: "sysadmin",
  email: "sysadmin@yourdomain.com",
  password: bcrypt.hashSync("your_secure_password", 10)
})
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new clinic + admin account (requires `x-super-admin-secret` header) |
| POST | `/api/auth/login` | Login (requires `x-clinic-slug` header) |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List patients (supports `?search=`, `?page=`) |
| GET | `/api/patients/:id` | Get patient details |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| POST | `/api/patients/:id/notes` | Add clinical note |
| PUT | `/api/patients/:patientId/notes/:noteId` | Update note |
| DELETE | `/api/patients/:patientId/notes/:noteId` | Delete note |
| POST | `/api/patients/:patientId/treatment-plans` | Create treatment plan |
| PATCH | `/api/patients/:patientId/treatment-plans/:planId` | Update treatment plan status |
| PUT | `/api/patients/:patientId/dental-chart/:toothNumber` | Update tooth condition (supports 1-32 permanent or A-T primary teeth) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments (supports `?date=`, `?startDate=`, `?endDate=`, `?status=`) |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |

### Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organization/me` | Get clinic details |
| PUT | `/api/organization/me` | Update clinic details (admin only) |
| GET | `/api/organization/users` | List clinic users |
| POST | `/api/organization/users` | Create staff user (admin only, max 2 staff) |
| PUT | `/api/organization/users/:userId/role` | Update user role (admin only, max 1 admin) |
| POST | `/api/organization/verify-slug` | Verify clinic slug existence (rate-limited) |

## Seat-Based Licensing

The application enforces seat limits per organization:
- **Max 1 admin** per clinic (cannot promote if one exists)
- **Max 2 staff members** per clinic (enforced on creation)

To upgrade seat limits, modify the validation in `server/routes/organizationRoutes.js`.

## Using the Application

### Dashboard
- View today's appointments at a glance
- Quick links to Patients and Schedule pages
- Statistics on scheduled appointments

### Patient Management
- **Patient List**: Search, view, and add patients. Supports pagination (10 patients per page).
- **Patient Details**: Access tabs:
  - **Patient Information**: View personal details, DOB, contact info, allergies, and medical conditions. Edit and delete patient are available here.
  - **Dental Chart**: Interactive tooth charting with:
    - Full mouth view (Universal/FDI numbering)
    - Quadrant view with statistics
    - Click any tooth to set status: Healthy, Cavity, Filled, Crown, Missing, Root Canal, Implant
    - Surface-level detail (MODBL): Mesial, Occlusal, Distal, Buccal, Lingual, Incisal
  - **Pediatric Chart**: Automatically shown for patients age 7 and under (primary teeth with letter notation A–E per quadrant)
  - **Treatment Plans**: Add procedures with optional tooth/surface targeting, cost in Philippine Peso (₱), and status tracking. Statuses: Proposed → In Progress → Completed

### Schedule
- Three view modes: Day, Week, Month
- Color-coded appointment status badges
- Create and manage appointments
- Reschedule functionality via status dropdown
- Status options: Scheduled, Completed, Cancelled, Reschedule

## Deployment

### Backend (Render)

1. Push to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set root directory to `server`
4. Set environment variables:
    - `MONGO_URI`
    - `JWT_SECRET`
    - `CLIENT_URL` (your Vercel frontend URL, without trailing slash)
    - `SUPER_ADMIN_MASTER_SECRET` (for clinic provisioning)
    - `NODE_ENV=production`

### Frontend (Vercel)

1. Import the repo on [Vercel](https://vercel.com)
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-render-api.onrender.com/api`

## Security

- Rate limiting on all routes (stricter on auth)
- JWT authentication with 7-day expiry
- Account lockout after 5 failed login attempts (15 min)
- Helmet security headers
- NoSQL injection protection (express-mongo-sanitize)
- XSS protection (xss-clean)
- HTTP parameter pollution prevention (hpp)
- Input validation on all endpoints (express-validator)
- All queries scoped to `organizationId` — cross-tenant data access is not possible
- Clinic slug verification prevents enumeration attacks
- Organization status controls tenant access (Pending/Approved/Suspended)

See [SECURITY.md](SECURITY.md) for full details.

## License

MIT