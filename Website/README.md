# Foodsy

Foodsy is a restaurant ordering web application built with React, Vite, Express, and MySQL. It supports multiple user roles including customers, restaurant admins, and employees/riders, with separate pages for menu browsing, cart management, order tracking, administration, and employee order assignment.

## Project Structure

- `src/` - React frontend source files
- `backend/` - Express backend API server
- `mysqldatabasef/` - MySQL database creation, migrations, and sample data
- `mysqldatabasef/migrations/` - Numbered schema migration files
- `index.html` - Frontend entry HTML

## Features

- User authentication and role-based access
- Customer: browse menu, add items to cart, place orders, view orders with tracking timeline
- Admin: dashboard, menu management, employee management, order management
- Employee/Rider: view assigned orders
- JWT-based authorization with protected routes
- Shared UI design system with CSS variables and reusable components
- Environment-based API URL configuration

## Tech Stack

- Frontend: React, React Router, Vite
- Backend: Node.js, Express, MySQL, dotenv, bcryptjs, jsonwebtoken, cors
- Database: MySQL (InnoDB, ENUM constraints, indexes)

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd "Project/Database Project/Project"
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Copy the example files and edit values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:5000/api
```

**Backend `backend/.env`:**

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=FooddeliveryDB
JWT_SECRET=your_jwt_secret
```

### 5. Prepare the database

**Option A — full schema (recommended for fresh setup):**

```bash
mysql -u root -p < mysqldatabasef/dbDDL.sql
mysql -u root -p < mysqldatabasef/dbDML2.sql
```

**Option B — run numbered migrations:**

```bash
for f in mysqldatabasef/migrations/*.sql; do
  mysql -u root -p < "$f"
done
mysql -u root -p < mysqldatabasef/dbDML2.sql
```

### 6. Run the backend server

```bash
cd backend
npm run dev
```

### 7. Run the frontend app

```bash
cd ..
npm run dev
```

## Seed credentials

All demo users use password `123` except the admin account:

| Email | Password | Role |
|-------|----------|------|
| ali@gmail.com | 123 | Customer |
| admin@email.com | admin@123 | Admin |

Passwords are stored as bcrypt hashes in the seed data.

## Available Scripts

From the frontend root:

- `npm run dev` - start Vite development server
- `npm run build` - build the frontend for production
- `npm run preview` - preview the production build

From the backend folder:

- `npm start` - run the backend server
- `npm run dev` - run the backend with nodemon for development

## Development Notes

- Frontend routes are defined in `src/App.jsx`
- Backend API routes are in `backend/routes/`
- Axios API client is configured in `src/services/api.js` using `VITE_API_URL`
- Shared UI components live in `src/components/ui/`
- Database name is `FooddeliveryDB` (not `foodsy`)

## Recommended Workflow

1. Start the backend server first
2. Start the frontend app
3. Open the frontend in your browser and log in or register

## License

This project does not currently include a license file.
