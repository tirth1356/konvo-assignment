# 🚀 Project & Task Manager

🔗 **Live Demo:**[ https://konvo-assignment.vercel.app](https://konvo-assignment.vercel.app/)

A modern, full-stack **Project & Task Management Application** designed to help teams and individuals organize projects, manage tasks, and track project progress efficiently.

Built with **React Native (Expo Web)**, **Node.js/Express**, and **Neon PostgreSQL**.
---
## ✨ Features

* 🔐 JWT Authentication
* 📧 OTP-Based Email Verification
* 👤 User Registration & Login
* 📁 Project Creation & Management
* ✅ Task Creation and Tracking
* 📊 Progress Monitoring
* 🔄 Redux Toolkit State Management
* 🌐 Responsive Web Interface
---

## 🛠️ Tech Stack
### Frontend

* React Native (Expo Web)
* Redux Toolkit
* React Navigation
* Axios
### Backend

* Node.js
* Express.js
* JWT
* Nodemailer

### Database

* PostgreSQL
* Neon Database

---

## 📂 Project Structure

```text
project-root/
│
├── frontend/          # React Native (Expo Web)
│
├── backend/           # Express API Server
│
└── README.md
```

---

## 🔑 Environment Variables

### Backend

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secure_secret_key
PORT=5000

# Optional SMTP Configuration
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Frontend

Create a `.env` file inside the `frontend` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/auth/register`   | Register a new user      |
| POST   | `/api/auth/send-otp`   | Send OTP to email        |
| POST   | `/api/auth/verify-otp` | Verify OTP               |
| POST   | `/api/auth/login`      | Login user               |
| GET    | `/api/auth/profile`    | Get current user profile |

---

### Projects

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| GET    | `/api/projects`     | Get all projects    |
| POST   | `/api/projects`     | Create a project    |
| GET    | `/api/projects/:id` | Get project details |
| PUT    | `/api/projects/:id` | Update project      |
| DELETE | `/api/projects/:id` | Delete project      |

---

### Tasks

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | `/api/tasks`     | Get all tasks    |
| POST   | `/api/tasks`     | Create task      |
| GET    | `/api/tasks/:id` | Get task details |
| PUT    | `/api/tasks/:id` | Update task      |
| DELETE | `/api/tasks/:id` | Delete task      |

---

## 🚀 Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/tirth1356/konvo-assignment.git
cd konvo-assignment
```

---

### 2. Database Setup

Create a PostgreSQL database on:

https://neon.tech

Copy the database connection string.

---

### 3. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Run migrations:

```bash
npm run migrate
```

Start development server:

```bash
npm run dev
```

Production:

```bash
npm start
```

Backend URL:

```text
http://localhost:5000
```

---

### 4. Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Expo Web:

```bash
npm run web
```

Frontend URL:

```text
http://localhost:8081
```

---

## 📄 License

This project is licensed under the MIT License.
