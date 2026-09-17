# TaskFlow — Frontend

A modern task management interface built with React, TypeScript, and Tailwind CSS v4. Consumes the TaskFlow Django REST API for authentication and CRUD operations on tasks.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Base UI) |
| Icons | Lucide React |
| Routing | React Router v7 |
| HTTP | Fetch API with JWT interceptor |
| Toasts | Sonner |

## Features

- **Authentication** — Register / login with email and password, JWT token storage in localStorage, automatic token refresh.
- **Password visibility toggle** — Show/hide password on both login and register forms.
- **Task CRUD** — Create, read, update, and delete tasks via the backend API.
- **Status filtering** — Filter tasks by status (To do, In progress, Done) with a segmented control.
- **Search** — Full-text search across task titles and descriptions.
- **Error handling** — API errors surfaced as toast notifications.
- **Protected routes** — Unauthenticated users are redirected to the login page.

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   └── loading-screen.tsx
│   ├── tasks/
│   │   ├── task-card.tsx
│   │   ├── task-dialog.tsx
│   │   └── task-list.tsx
│   └── ui/               # shadcn components
├── lib/
│   ├── api.ts            # API client & types
│   ├── auth-context.tsx   # Auth provider & hook
│   └── utils.ts          # cn() helper
├── pages/
│   ├── auth-page.tsx
│   └── dashboard-page.tsx
├── App.tsx               # Router & providers
├── main.tsx
└── index.css             # Tailwind + theme tokens
```

## Prerequisites

- Node.js 18+
- The [TaskFlow backend](../backend) running on `http://localhost:8000`

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## API Endpoints Consumed

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | No | Create a new account |
| POST | `/api/auth/login/` | No | Sign in, returns JWT tokens |
| POST | `/api/auth/token/refresh/` | No | Refresh an expired access token |
| GET | `/api/auth/profile/` | Yes | Get current user info |
| GET | `/api/tasks/` | Yes | List all tasks for the current user |
| POST | `/api/tasks/` | Yes | Create a new task |
| PUT | `/api/tasks/:id/` | Yes | Update a task (full replace) |
| DELETE | `/api/tasks/:id/` | Yes | Delete a task |
