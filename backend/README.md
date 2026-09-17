# Cova Task API

A RESTful task management API built with Django REST Framework and JWT authentication.

## Tech Stack

- **Framework:** Django 6.1.1 + Django REST Framework
- **Authentication:** JWT (Simple JWT)
- **Database:** SQLite (default) / MySQL 8.4 (Docker)
- **Documentation:** Swagger UI + ReDoc (drf-yasg)
- **Containerization:** Docker + Docker Compose

## Project Structure

```
backend/
├── backend/         # Project settings and URL config
├── users/           # Authentication and user management
├── tasks/           # Task CRUD operations
├── Dockerfile
├── docker-compose.yml
├── manage.py
└── requirements.txt
```

## Getting Started

### Prerequisites

- Python 3.14+
- Docker & Docker Compose (for MySQL setup)

### Local Development (SQLite)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Docker (MySQL)

```bash
cd backend
cp .env.example .env   # configure USE_MYSQL=True and credentials
docker compose up --build
```

The API will be available at `http://localhost:8000`.

## API Documentation

| Documentation | URL |
|---|---|
| Swagger UI | http://localhost:8000/swagger/ |
| ReDoc | http://localhost:8000/redoc/ |
| Admin Panel | http://localhost:8000/admin/ |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new user account |
| POST | `/api/auth/login/` | Log in and receive JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh an expired access token |
| GET | `/api/auth/profile/` | Get the current user's profile |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks/` | List all tasks for the current user |
| POST | `/api/tasks/` | Create a new task |
| PUT | `/api/tasks/{id}/` | Update an existing task |
| DELETE | `/api/tasks/{id}/` | Delete a task |

> All task endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `USE_MYSQL` | `False` | Use MySQL instead of SQLite |
| `DB_NAME` | `cova` | MySQL database name |
| `DB_USER` | `cova` | MySQL user |
| `DB_PASSWORD` | `cova_password` | MySQL password |
| `DB_HOST` | `db` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Allowed hostnames |
| `DJANGO_DEBUG` | `1` | Enable debug mode |

## License

MIT
