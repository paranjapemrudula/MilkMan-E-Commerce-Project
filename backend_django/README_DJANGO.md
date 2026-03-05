# Milkman Pro - Django Backend Setup Guide

This folder contains a complete Django implementation of the Milkman Pro backend.

## Prerequisites
- Python 3.8+
- pip (Python package manager)

## Local Setup Instructions

1. **Navigate to the backend folder**:
   ```bash
   cd backend_django
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations**:
   ```bash
   python manage.py makemigrations api
   python manage.py migrate
   ```

6. **Create a superuser (optional, for admin access)**:
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the Django server**:
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://127.0.0.1:8000/api/`.

## API Endpoints
The following endpoints are implemented with Django Rest Framework:
- `GET /api/categories/`
- `GET /api/products/`
- `GET /api/subscriptions/`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/orders`
- `GET /api/orders/<user_id>`

**Note on Trailing Slashes**: Django Rest Framework typically expects a trailing slash for viewsets (e.g., `/api/categories/`). If your frontend calls `/api/categories`, ensure your Django `APPEND_SLASH` setting is `True` (default) or update your frontend fetch calls.
