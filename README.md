# Fieldwise Agriculture Management System

Fieldwise is a full-stack farm operations application for managing crops, orders, buyers, tasks, expenses, inventory, workers, attendance, equipment, maintenance, team users and activity records.

- **Frontend:** React 18, Vite, Redux Toolkit, React Router, Axios, Recharts and Lucide
- **Backend:** Node.js, Express, Sequelize and PostgreSQL
- **Authentication:** JWT bearer tokens, bcrypt password hashing and role-based authorization

## Application overview

The dashboard provides KPI cards and charts for crop health, harvest availability versus sales, monthly and category expenses, upcoming harvests, low inventory, worker attendance and equipment service dates. The interface also includes responsive navigation, search, light/dark themes, notifications, confirmation dialogs and toast/error feedback.

The main resource screens are:

- Crops
- Orders
- Buyers
- Tasks
- Expenses
- Inventory
- Workers
- Attendance
- Equipment
- Maintenance
- Activity log
- Team members (administrators only)

## Permissions

| Role | Access |
|---|---|
| Administrator | Full view, create, update and delete access for farm resources and team users |
| Farm manager | View and create farm resources; resource updates and deletes require administrator access |
| Activity log | All authenticated users can view the log; only administrators can delete entries |

New accounts created through the public signup page are assigned the `manager` role. Team member accounts can be created or updated by administrators.

## Features

- Public signup, login and persistent browser sessions
- Profile access and password changes
- Role-aware navigation and protected API routes
- Resource tables with create, view, edit and delete workflows where permitted
- Relationships between crops, orders, buyers, tasks, expenses, attendance, equipment and maintenance
- Dashboard KPIs, charts, activity feed and near-due farm alerts
- Login attempt rate limiting
- Sequelize model associations and an idempotent demo seed

## Request flow

React page → Redux/auth state and `redux/api` Axios client → Express route → authentication/role middleware → controller → Sequelize model → PostgreSQL → JSON response → UI.

The API is available at `http://localhost:5000/api`; the Vite frontend defaults to `http://localhost:5173`.

## Requirements

- Node.js 18 or later and npm
- PostgreSQL 13 or later
- Two terminal windows: one for the API and one for Vite

## Backend setup

1. Create a PostgreSQL database, for example `technodevs37`.
2. From `backend/`, copy `.env.example` to `.env` and set the database credentials:

   ```powershell
   Copy-Item .env.example .env
   ```

   Required values are `DB_NAME`, `DB_USER`, `DB_PASSWORD` and `JWT_SECRET`. `DB_HOST`, `DB_PORT` and `PORT` are optional and default to `localhost`, `5432` and `5000`.

   Generate a strong random JWT secret; never commit `.env`.

3. Install dependencies and verify the database connection:

   ```powershell
   npm install
   npm run test:db
   ```

4. Start the API:

   ```powershell
   npm run dev
   ```

   The API authenticates and synchronizes Sequelize models on startup.

5. In another terminal, optionally seed demo data:

   ```powershell
   npm run seed
   ```

## Frontend setup

1. From `frontend/`, copy `.env.example` to `.env` if you need to change the API URL:

   ```powershell
   Copy-Item .env.example .env
   ```

   The default is `http://localhost:5000/api`.

2. Install dependencies and start Vite:

   ```powershell
   npm install
   npm run dev
   ```

3. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

4. Build for production with:

   ```powershell
   npm run build
   npm run preview
   ```

## Health check

With the backend running:

- `GET http://localhost:5000/api/health`

Successful response:

```json
{
  "succeeded": true,
  "message": "API is running",
  "data": { "status": "ok" }
}
```

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Manager | `manager` | `Manager@123` |

These are local demo credentials only. Change them and use a strong JWT secret before deploying.

The idempotent seed adds sample farm records across crops, sales, tasks, inventory, workers, attendance, equipment, maintenance, expenses and activity history, plus three manager accounts for the Team Members list. Their initial passwords are randomly generated and are not printed; an admin must set a password before those accounts can sign in.

## API overview

All application routes are under `/api`. Except for the health and signup/login endpoints, routes require `Authorization: Bearer <token>`.

| Area | Routes | Manager | Admin |
|---|---|---:|---:|
| Auth | `POST /users/register`, `POST /users/login`, `GET /users/me`, `POST /users/logout`, `PUT /users/change-password` | Yes | Yes |
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/:id` | No | Yes |
| Crops, orders, buyers, tasks, expenses, inventory, workers, attendance, equipment, maintenance | `GET/POST /:resource`, `GET/PUT/DELETE /:resource/:id` | View + create | Full |
| Activity | `GET /activity`, `DELETE /activity/:id` | View | View + delete |

Successful responses use `{ "succeeded": true, "message": "...", "data": ... }`; errors use `{ "succeeded": false, "message": "...", "data": null }`. Login returns the authenticated user and token in a `user` property.

## Project structure

```text
backend/
  app.js              Express application and route registration
  config/             Database and environment configuration
  controllers/        API request handlers
  middleware/         Authentication, authorization and error handling
  models/             Sequelize models and associations
  routes/             Endpoint definitions
  utils/              CRUD helpers and response utilities
  seed.js             Demo data seeding
frontend/
  src/App.jsx         Application routes and layout
  src/pages/          Auth, dashboard, profile and resource screens
  src/components/     Shared form, toast and modal components
  src/app/            Redux store, API client and resource definitions
```

## Screenshots

Add your own screenshots here before submission:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/crops.png`
- `docs/screenshots/mobile.png`

## Submission email draft

**To:** submissions@udevspvtltd.com  
**Subject:** Batch 6 - Backend Task - Your Full Name

Hello,

My name is **Your Full Name**, and I am submitting my Agriculture Management System for **Batch 6**.

- GitHub repository: **Your repository URL**
- Live demo: **Your live demo URL (if available)**

Regards,  
Your Full Name

## Security notes

- `.env` files and uploaded images are excluded from Git; `.env.example` contains placeholders only.
- The demo accounts and local defaults are for development. Use a long, unique, randomly generated `JWT_SECRET`, non-demo account passwords, HTTPS, and production database credentials before deployment.
- Sequelize `sync({ alter: true })` is convenient for this learning project. Use reviewed migrations instead for production schema changes.
