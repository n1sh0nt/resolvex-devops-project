# ResolveX API Reference

Base URL: `/api` (e.g. `https://yourdomain.com/api` or `http://localhost:5000/api` in local dev)

Authentication: send `Authorization: Bearer <token>` on every protected request, or rely on
the `token` httpOnly cookie set automatically by `/auth/login` and `/auth/register`.

All responses are JSON with a `success: boolean` field. Errors look like:

```json
{ "success": false, "message": "Human-readable error message", "errors": ["optional", "detail list"] }
```

List endpoints support these shared query params: `page`, `limit`, `sort` (e.g. `-createdAt`),
`search`, and simple field filters (e.g. `?status=Pending&category=Electrical`).

---

## Auth — `/api/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register as student or faculty |
| POST | `/login` | Public | Log in, returns JWT + sets cookie |
| POST | `/logout` | Private | Clears auth cookie |
| GET | `/me` | Private | Get the current logged-in user |
| GET | `/verify-email/:token` | Public | Verify email from emailed link |
| POST | `/resend-verification` | Public | Resend verification email |
| POST | `/forgot-password` | Public | Request password reset email |
| PUT | `/reset-password/:token` | Public | Set a new password from reset link |
| PUT | `/update-password` | Private | Change password while logged in |

## Users — `/api/users`

| Method | Path | Access | Description |
|---|---|---|---|
| PUT | `/profile` | Private | Update own name/phone/IDs |
| PUT | `/avatar` | Private | Upload own avatar (multipart `avatar`) |
| GET | `/department/:departmentId/staff` | Admin/Staff | List staff in a department |
| GET | `/` | Admin | List all users (search/filter/paginate) |
| POST | `/` | Admin | Create a user (e.g. staff/admin account) |
| GET | `/:id` | Admin | Get a single user |
| PUT | `/:id` | Admin | Update role/department/status |
| DELETE | `/:id` | Admin | Deactivate a user (soft delete) |

## Complaints — `/api/complaints`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/my-stats` | Private | Dashboard stats for the logged-in user |
| GET | `/` | Private | List complaints (role-scoped: own / department / all) |
| POST | `/` | Student/Faculty | Submit a complaint (multipart, field `images[]`, up to 5) |
| GET | `/:id` | Private | Get full complaint with timeline |
| DELETE | `/:id` | Private | Delete (owner while Pending, or admin anytime) |
| PUT | `/:id/assign` | Admin | Assign to a department and/or staff member |
| PUT | `/:id/status` | Staff/Admin | Update status (multipart, optional `images[]` + `note`) |

## Departments — `/api/departments`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Private | List all departments |
| GET | `/:id` | Private | Get one department |
| POST | `/` | Admin | Create a department |
| PUT | `/:id` | Admin | Update a department |
| DELETE | `/:id` | Admin | Delete (or deactivate if complaints reference it) |

## Feedback — `/api/feedback`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Student/Faculty | Submit feedback for a resolved/closed complaint |
| GET | `/` | Admin | List all feedback with average rating |
| GET | `/complaint/:complaintId` | Private | Get feedback for one complaint |

## Notifications — `/api/notifications`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Private | List own notifications (`?unreadOnly=true` supported) |
| PUT | `/:id/read` | Private | Mark one as read |
| PUT | `/read-all` | Private | Mark all as read |
| DELETE | `/:id` | Private | Delete a notification |
| POST | `/broadcast` | Admin | Send a notification + email to a role or everyone |

## Analytics — `/api/analytics`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/admin-dashboard` | Admin | Totals, status breakdown, monthly trend, top departments |
| GET | `/department-dashboard` | Staff | Assigned/pending/in-progress/completed counts |
| GET | `/export/excel` | Admin | Download all complaints as `.xlsx` |
| GET | `/export/pdf` | Admin | Download all complaints as `.pdf` |

## Admin — `/api/admin`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/activity-logs` | Admin | Paginated audit log of system actions |

## Health

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Returns `{ status: "ok" }` — used by Docker healthchecks |
