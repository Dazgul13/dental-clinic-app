# Dental Clinic Management System

A full-stack multi-tenant MERN application for managing dental clinic patients, appointments, and medical records. Each clinic operates in complete isolation — patients, appointments, and staff are scoped to their organization.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, React Hot Toast
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT with account lockout protection
- **Security:** Helmet, rate limiting, input validation, XSS & NoSQL injection protection, CORS

## Features

- **Multi-tenant** — each clinic has isolated data
- Patient management (add, edit, delete, search, paginate)
- Interactive dental chart with FDI notation (full mouth & quadrant views)
- Tooth surface tracking (MODBL notation)
- Clinical notes (add, edit, delete) with pagination
- Appointment scheduling, status management, and rescheduling
- 7-day schedule view
- Dashboard with today's appointments
- Role-based access (admin / staff)
- Responsive design

## Project Structure

```
dental-clinic/
├── server/
│   ├── config/         # Database connection
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Organization, User, Patient, Appointment
│   ├── routes/          # Auth, patients, appointments, organization
│   ├── seed.js          # Demo data seeder
│   └── server.js        # Entry point
└── client/
    └── src/
        ├── components/  # Layout, modals, DentalChart
        ├── context/     # AuthContext
        ├── pages/       # Dashboard, PatientList, PatientDetails, Schedule
        └── utils/       # API client, sanitize helpers
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

Demo credentials:
- **Admin:** `admin` / `Admin123!`
- **Staff:** `staff` / `Staff123!`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new clinic + admin account |
| POST | `/api/auth/login` | Login |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List patients (supports `?search=`) |
| GET | `/api/patients/:id` | Get patient details |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| POST | `/api/patients/:id/notes` | Add clinical note |
| PUT | `/api/patients/:patientId/notes/:noteId` | Update note |
| DELETE | `/api/patients/:patientId/notes/:noteId` | Delete note |
| PUT | `/api/patients/:patientId/dental-chart/:toothNumber` | Update tooth |

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

## Registration Flow

When a new clinic registers:
1. Fill in clinic name, email, and phone
2. Create an admin account (username, email, password)
3. A new isolated organization is created
4. All subsequent data (patients, appointments) is scoped to that organization

Staff accounts can be added by an admin after registration.

## Deployment

### Backend (Render)

1. Push to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set root directory to `server`
4. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your Vercel frontend URL)
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

See [SECURITY.md](SECURITY.md) for full details.

## License

MIT
