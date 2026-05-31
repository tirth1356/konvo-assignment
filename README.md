# Project & Task Manager Application

A modern project and task management application. Built with a React Native (Expo) web-ready frontend, Node.js/Express backend, and Neon PostgreSQL database.

## Tech Stack
* **Frontend**: React Native (Expo Web), Redux Toolkit, Axios, React Navigation
* **Backend**: Node.js, Express, Nodemailer, JSON Web Tokens (JWT)
* **Database**: PostgreSQL (Neon Postgres)

---

## Getting Started

### 1. Database Setup
1. Create a free account and a new PostgreSQL project at [neon.tech](https://neon.tech).
2. Copy the connection string.

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Set your environment variables in `.env`:
   * `DATABASE_URL`: Your Neon Postgres connection string.
   * `JWT_SECRET`: A secure key for token encryption.
   * `PORT`: Default is `5000`.
   * *SMTP Variables (Optional)*: Set your email credentials (e.g., Gmail + App Passwords) to send real OTP emails. If left empty, OTPs will print to the console.
4. Run migrations to initialize tables:
   ```bash
   npm run migrate
   ```
5. Start the server:
   * **Development**: `npm run dev`
   * **Production**: `npm start`

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend:
   ```bash
   npm run web
   ```

---

## Deployment Instructions

### Backend (Render)
1. Push the code to a GitHub repository.
2. In [Render](https://render.com), create a new **Web Service** and link your repo.
3. Configure the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables from your `.env` (like `DATABASE_URL` and `JWT_SECRET`).
7. Once deployed, note down the backend live URL.

### Frontend (Vercel)
1. Create a new project in [Vercel](https://vercel.com) linking the same repo.
2. Configure the Root Directory to `frontend`.
3. Framework Preset: **Other** or **Create React App**.
4. Build Command: `npm run build` (runs `expo export --platform web`).
5. Output Directory: `dist`.
6. Add Environment Variables:
   * `EXPO_PUBLIC_API_URL`: Set to your Render backend URL (e.g., `https://your-backend.onrender.com/api`).
7. Deploy.
