# ResolveX — Smart Complaint Management System

A full-stack complaint management platform built for college campuses. Students and
faculty report issues, department staff work them to resolution, and admins get a
live view of the whole campus through analytics and exportable reports.

- **Frontend:** React (Vite) · Tailwind CSS · React Router · Axios · React Hook Form · Chart.js · React Toastify
- **Backend:** Node.js · Express · MongoDB (Mongoose) · JWT · bcrypt · Multer · Nodemailer · Helmet · CORS
- **Infra:** Docker · Docker Compose · Nginx (app-level static/API proxy + public reverse proxy) · Cloudinary (optional)

---

## Contents

- [Quick start (Docker)](#quick-start-docker)
- [Demo accounts](#demo-accounts)
- [Local development (without Docker)](#local-development-without-docker)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [User roles & permissions](#user-roles--permissions)
- [API overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future enhancements](#future-enhancements)

---

## Quick start (Docker)

Requirements: Docker Engine 24+ and the Docker Compose plugin.

```bash
git clone <your-repo-url> resolvex
cd resolvex

# 1. Configure the backend
cp backend/.env.example backend/.env
# Edit backend/.env: set a real JWT_SECRET, SMTP credentials, and (optionally) Cloudinary keys.
# If you skip Cloudinary, uploaded images are stored on a local Docker volume automatically.

# 2. Build and start everything
docker compose up --build -d

# 3. Seed demo data (departments, demo accounts, sample complaints)
docker compose exec backend npm run seed
```

The app is now available at **http://localhost** (port 80, via the Nginx reverse proxy).

Check container health:

```bash
docker compose ps
docker compose logs -f backend
```

Stop everything:

```bash
docker compose down          # keep data
docker compose down -v       # also wipe MongoDB/upload volumes
```

## Demo accounts

Created by `npm run seed` (all pre-verified):

| Role    | Email                          | Password      |
|---------|---------------------------------|----------------|
| Admin   | admin@resolvex.edu              | Admin@1234     |
| Staff   | staff.electrical@resolvex.edu   | Staff@1234     |
| Staff   | staff.it@resolvex.edu           | Staff@1234     |
| Faculty | faculty@resolvex.edu            | Faculty@1234   |
| Student | student@resolvex.edu            | Student@1234   |
| Student | sneha.patel@resolvex.edu        | Student@1234   |

## Local development (without Docker)

Requirements: Node.js 18+, a running MongoDB instance (local or Atlas).

**Backend**

```bash
cd backend
cp .env.example .env      # point MONGO_URI at your local/Atlas instance
npm install
npm run seed               # optional - creates demo data
npm run dev                 # http://localhost:5000
```

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173, proxies /api to localhost:5000
```

## Project structure

```
resolvex/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB & Cloudinary setup
│   │   ├── models/          # Mongoose schemas: User, Department, Complaint, Feedback, Notification, ActivityLog
│   │   ├── controllers/     # Route handlers, grouped by resource
│   │   ├── routes/          # Express routers, grouped by resource
│   │   ├── middleware/      # auth (JWT/RBAC), upload, rateLimiter, errorHandler, validate
│   │   ├── services/        # emailService (Nodemailer), activityService (audit log + notifications)
│   │   ├── utils/           # ApiError, asyncHandler, apiFeatures (search/filter/sort/paginate), generateToken
│   │   └── app.js           # Express app assembly
│   ├── seed/seed.js         # Demo data seeder
│   ├── server.js            # Entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance + endpoint wrappers
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Sidebar, Topbar, layout shells
│   │   │   ├── common/        # Button-less primitives: Spinner, Badge, Modal, Pagination, EmptyState, StatCard
│   │   │   ├── complaints/    # ComplaintCard, ComplaintTimeline
│   │   │   └── charts/        # Chart.js wrappers (trend, pie, bar)
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/             # One file per route; admin/ subfolder for admin-only pages
│   │   ├── routes/            # ProtectedRoute, RoleRoute guards
│   │   └── utils/             # constants, chart registration
│   ├── nginx.conf            # Serves the built SPA + proxies /api and /uploads to the backend
│   └── Dockerfile
├── nginx/                    # Public-facing reverse proxy (SSL termination, domain routing)
│   └── conf.d/
├── docker-compose.yml
├── DEPLOYMENT.md
└── API.md
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list with comments.
Key ones:

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | backend | MongoDB connection string (overridden by Compose to point at the `mongo` service) |
| `JWT_SECRET` | backend | **Change this** before deploying — used to sign auth tokens |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | backend | Outgoing email for verification, password reset, and status update notifications |
| `CLOUDINARY_*` | backend | Optional. If unset, uploaded images are stored on a local Docker volume instead |
| `CLIENT_URL` | backend | Used to build links inside emails (verify email, reset password) |
| `VITE_API_URL` | frontend | API base path baked into the build; `/api` works out of the box behind the bundled Nginx |

## User roles & permissions

| Role | Can do |
|---|---|
| **Student / Faculty** | Register, submit complaints with photos, track status & timeline, view own history, leave feedback once resolved, edit own profile |
| **Department Staff** | View complaints assigned to their department, update status, upload resolution photos, add remarks |
| **Admin** | Everything above, plus: manage users & departments, assign complaints, view analytics dashboards, export Excel/PDF reports, send broadcast notifications, view audit logs |

## API overview

Full endpoint reference in [API.md](./API.md). All endpoints are under `/api` and (except
auth/register/login/health) require a `Bearer` token or the `token` cookie set at login.

## Testing

There's no automated test suite bundled by default (kept out of scope to keep the
build lean) — see below for a manual QA pass that exercises the whole system:

1. **Auth flow:** register a student → check the console/log for the verification email
   (or a real inbox if SMTP is configured) → visit the verification link → log in.
2. **Complaint lifecycle:** as the student, submit a complaint with a photo. As admin,
   assign it to a department/staff member. As staff, move it through
   In Progress → Resolved with a resolution photo and remarks. As the student, confirm
   the timeline updated and leave feedback.
3. **RBAC:** confirm a student cannot reach `/admin/*` routes or call staff/admin-only
   API endpoints (should 403).
4. **Analytics:** as admin, open the dashboard and confirm the charts populate, then
   test the Excel and PDF export buttons.
5. **Notifications:** confirm the bell icon shows unread counts after a status change,
   and that "mark all read" clears them.

If you'd like to add real automated tests, `backend` is set up for `jest` + `supertest`
(add them to `package.json` devDependencies) and `frontend` for `vitest` +
`@testing-library/react`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions covering AWS EC2,
IBM Cloud, Azure VM, and DigitalOcean, plus SSL via Let's Encrypt and Nginx domain
configuration.

## Future enhancements

- WebSocket-based live notifications (current implementation polls every 60s)
- SMS notifications alongside email
- Complaint escalation rules (auto-escalate if unresolved past an SLA window)
- Multi-language support
- Native mobile app (React Native) reusing the existing REST API
- Automated test suite (Jest/Supertest backend, Vitest/RTL frontend) and CI pipeline
