# 🍔 Foodsy - Restaurant Ordering & Management System

Foodsy is a full-stack, role-based restaurant ordering and management web application. It features separate portals and capabilities for **Customers** (to browse menus, manage carts, and order), **Restaurant Admins** (to manage menus, employees, customers, and overall order flows), and **Employees/Riders** (to view and handle delivery assignments).

---

## 📋 Table of Contents
1. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
2. [Step-by-Step Installation Guide](#-step-by-step-installation-guide)
   - [Step 1: Install Node.js & npm](#step-1-install-nodejs--npm)
   - [Step 2: Install and Start MySQL](#step-2-install-and-start-mysql)
   - [Step 3: Clone the Repository](#step-3-clone-the-repository)
   - [Step 4: Install Dependencies](#step-4-install-dependencies)
   - [Step 5: Configure Environment Variables](#step-5-configure-environment-variables)
   - [Step 6: Set Up the Database](#step-6-set-up-the-database)
3. [Running the Application](#-running-the-application)
4. [Test Credentials](#-test-credentials)
5. [Project Directory Structure](#-project-directory-structure)
6. [Contributing Guidelines](#-contributing-guidelines)
7. [License](#-license)

---

## 🛠 Prerequisites & System Requirements

To run Foodsy locally, you must have the following installed on your machine:

*   **Node.js**: Version `18.x` or higher (includes `npm` package manager)
*   **MySQL Server**: Version `8.0` or higher
*   **Git**: For version control and cloning the repository
*   **A Modern Browser**: Chrome, Firefox, Edge, or Safari

---

## 🚀 Step-by-Step Installation Guide

### Step 1: Install Node.js & npm
Node.js is the runtime environment used to run the backend and the build tools for the frontend.

#### Windows & macOS:
1. Go to the [Node.js Official Website](https://nodejs.org/).
2. Download the **LTS (Long Term Support)** installer for your operating system.
3. Run the installer and follow the prompt steps (keep the default settings).
4. Verify the installation by opening your terminal or command prompt and running:
   ```bash
   node -v
   npm -v
   ```

#### Linux (Debian/Ubuntu-based):
Install Node.js via NodeSource or your package manager:
```bash
sudo apt update
sudo apt install -y nodejs npm
```

---

### Step 2: Install and Start MySQL
Foodsy uses a MySQL database to store its information.

1. Download and install **MySQL Community Server** from the [MySQL Downloads Page](https://dev.mysql.com/downloads/installer/).
2. Set a secure password for the root user during the setup process.
3. Make sure the MySQL Service is running:
   *   **Windows**: Check the Services app and ensure `MySQL` is started.
   *   **macOS / Linux**: Start via terminal:
       ```bash
       sudo systemctl start mysql   # Linux
       mysql.server start           # macOS
       ```

---

### Step 3: Clone the Repository
Clone the project repository to your local machine using Git:
```bash
git clone <your-repository-url>
cd Foodsy/Website
```
*(Note: Replace `<your-repository-url>` with the actual URL of this repository).*

---

### Step 4: Install Dependencies

Foodsy is divided into a frontend client and a backend server. You need to install dependencies for both.

#### 1. Install Frontend Dependencies (Root Folder)
From the root project folder:
```bash
npm install
```

#### 2. Install Backend Dependencies (`backend` Folder)
Navigate to the backend directory and install its dependencies:
```bash
cd backend
npm install
cd ..
```

---

### Step 5: Configure Environment Variables

The application relies on configuration variables stored in `.env` files. Copy the provided templates and fill in your details.

#### 1. Configure the Frontend Environment
From the root folder:
```bash
cp .env.example .env
```
Open the `.env` file in a text editor and verify the backend API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 2. Configure the Backend Environment
Go into the `backend/` folder and copy the example file:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and configure your port, JWT secret key, and MySQL database connection:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password   # Replace with your MySQL password
DB_NAME=FooddeliveryDB
JWT_SECRET=any_secret_key_string       # Change this to any custom secure string
```

---

### Step 6: Set Up the Database

Initialize your MySQL database using the SQL scripts located in the `mysqldatabasef/` folder.

#### Option A: Full Schema & Seeds (Recommended for first-time setup)
Open your terminal and run the following commands. Enter your MySQL password when prompted:

```bash
# 1. Create the database and tables structure
mysql -u root -p < mysqldatabasef/dbDDL.sql

# 2. Populate the database with mock records (restaurants, menus, categories)
mysql -u root -p < mysqldatabasef/dbDML2.sql
```

#### Option B: Incremental Migrations (Alternative)
If you want to apply migrations sequentially:
```bash
# Run migration files in order
for f in mysqldatabasef/migrations/*.sql; do
  mysql -u root -p < "$f"
done

# Seed initial tables
mysql -u root -p < mysqldatabasef/dbDML2.sql
```

---

## 🏃 Running the Application

To run the application, you need to start **both** the backend API server and the frontend client dev server.

### 1. Start the Backend API Server
Navigate to the `backend/` folder and run:
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000` and automatically restart when code changes are detected.

### 2. Start the Frontend Dev Server
In a new terminal window, navigate back to the root folder and run:
```bash
npm run dev
```
Vite will start the dev server, usually at `http://localhost:5173`. Open this URL in your web browser.

---

## 🔑 Test Credentials

You can use the following seeded accounts to log in and test different system roles immediately:

| Email | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `ali@gmail.com` | `123` | **Customer** | Browses menus, manages carts, checks out, tracks orders. |
| `admin@email.com` | `admin@123` | **Admin** | Accesses the administrative dashboard, employee lists, orders, and menu catalogs. |

*(Note: All other seeded demo users use the password `123`)*

---

## 📁 Project Directory Structure

```
Foodsy/Website/
├── backend/                  # Express API Server
│   ├── routes/               # API endpoints (auth, menu, cart, orders, admin, employee)
│   ├── utils/                # DB connections pool and authentication middlewares
│   ├── index.js              # Server entry point
│   ├── package.json          # Node configuration for backend
│   └── .env                  # Backend credentials config (gitignored)
│
├── mysqldatabasef/           # Database setup
│   ├── migrations/           # Versioned SQL database changes
│   ├── dbDDL.sql             # Full database schema definition
│   └── dbDML2.sql            # Database seed data
│
├── src/                      # React Frontend
│   ├── components/           # Reusable UI elements (Buttons, Badges, Protected Routes)
│   ├── context/              # Authentication and Toast notification contexts
│   ├── pages/                # Pages grouped by role (Admin, Customer, Employee, Auth)
│   ├── services/             # Axios API integration
│   ├── App.jsx               # React Router config and root layout
│   ├── index.css             # Main styling system
│   └── main.jsx              # React application entry point
│
├── package.json              # Frontend client configuration
├── vite.config.js            # Vite build tool configurations
└── README.md                 # Project Documentation
```

---

## 🤝 Contributing Guidelines

We welcome contributions from the community! If you would like to contribute to Foodsy, please follow these steps:

### 1. Set Up Your Local Workspace
1. Fork this repository on GitHub.
2. Clone your fork locally and add the upstream repository as a remote:
   ```bash
   git remote add upstream <original-repo-url>
   ```

### 2. Create a Topic Branch
Always make your changes on a dedicated feature branch. Never commit directly to the `main` branch.
```bash
git checkout -b feature/your-awesome-feature
```

### 3. Coding Guidelines & Practices
*   **Code Quality**: Write clean, self-documenting code. Do not remove existing code comments or docstrings unless they are outdated or being refactored.
*   **CSS Standards**: Foodsy uses Vanilla CSS for UI flexibility. Define custom classes or extend CSS variables inside `src/index.css` rather than writing ad-hoc styles.
*   **Database Migrations**: If you change the database schema:
    1. Do not modify `dbDDL.sql` directly.
    2. Add a new `.sql` file inside `mysqldatabasef/migrations/` using a sequential numbering prefix (e.g. `0003_add_user_bio.sql`).
*   **Test Your Changes**: Verify that both the frontend build and backend tests complete without error.

### 4. Commit and Push Changes
Write clear, concise commit messages outlining the "what" and "why":
```bash
git add .
git commit -m "feat: add user bio to customer profile page"
git push origin feature/your-awesome-feature
```

### 5. Submit a Pull Request
1. Go to the original repository on GitHub.
2. Click **New Pull Request**.
3. Provide a clear description of the modifications, screenshots of visual changes (if applicable), and how you tested the changes.

---

## 📄 License

This project is currently unlicensed. All rights reserved.
