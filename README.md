# Krishi Khel - Gamified Farming Platform MVP

This project is a functional MVP for a gamified platform to promote sustainable farming practices.

## Features
- User Authentication (JWT-based)
- Gamified Dashboard (Score, Streaks, Badges)
- Community Groups with Photo Sharing
- 2D Virtual Farm Planner with CRUD functionality
- Daily Weather Alerts

## Tech Stack
- **Frontend:** React (Vite), CSS Modules
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Containerization:** Docker

## Setup and Run

1.  **Prerequisites:** Install Docker Desktop.
2.  **Environment:** Create a `.env` file inside the `backend/` directory. Copy the contents from the instructions and add your own `JWT_SECRET` and `WEATHER_API_KEY`.
3.  **Initial Migration:** Run this command ONCE to create the database migration files:
    ```bash
    docker-compose run --rm backend npx prisma migrate dev --name final-schema-with-cache
    ```
4.  **Run:** Open a terminal in the project root and run:
    ```bash
    docker-compose up --build
    ```
5.  **Access:**
    -   Frontend: `http://localhost:3000`
    -   Backend: `http://localhost:5000`
