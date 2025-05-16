# 🗣️ IELTS Speaking Test - Assignment 20 (Role-Based Access Control)

This project is built as part of Assignment 20 for the IELTS Speaking Test application. It demonstrates **Role-Based Access Control (RBAC)** using React (frontend) and Flask (backend), allowing different features for Admins and Test Takers.

---

## 📌 Features

- 🔒 **Authentication** using JWT tokens
- 👤 **Admin and Test Taker roles**
- 🔁 **Role-based redirection and dashboards**
- 🧭 **Protected routes** using custom middleware
- 💬 Speaking test questions and structured practice workflow
- 📦 Frontend and backend integrated with real API

---

## 🚀 Technologies Used

### 🧠 Backend (Flask)
- Python 3
- Flask
- Flask-CORS
- Flask-SQLAlchemy
- PyJWT
- SQLite

### 🎨 Frontend (React)
- React + React Router
- Axios
- Bootstrap 5
- LocalStorage for user auth state

---

## 👥 User Roles

| Role        | Capabilities                            |
|-------------|------------------------------------------|
| **Admin**   | Access Admin Dashboard, create tests     |
| **Test Taker** | View and take speaking tests only      |

---

## 🔐 Authentication Flow

- Users log in via `/login`
- On success, the backend returns a JWT token and role
- Frontend stores token & role in `localStorage`
- Role is used to protect routes and conditionally render content

---

✅ Test Credentials
Role	Email	Password
Admin	admin@gmail.com	Admin@123
Test Taker	test@gmail.com	Test@123
