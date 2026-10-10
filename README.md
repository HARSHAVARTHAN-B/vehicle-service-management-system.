# 🚗 AutoCare Pro – Vehicle Service Management System

Tagline: **"Smart Service. Better Vehicles."**

AutoCare Pro is a complete full-stack web application designed for professional vehicle service centers and automotive SaaS management. It connects a high-performance **Node.js + Express.js + MySQL** backend to a modern, colorful **React + Vite + Tailwind CSS** dashboard.

---

## 🌟 Key Features

* 🔐 **Authentication & Security**: JWT-based session security with bcrypt password hashing and role-based access control (Admin & Staff).
* 👥 **Customer Management**: Full CRUD directory with live search, pagination, and multi-vehicle owner mapping (`CUS-1001`, `CUS-1002`).
* 🚘 **Vehicle Registry**: Track vehicle types (Car, Bike, SUV, Van, Truck), fuel types (Petrol, Diesel, Electric, Hybrid, CNG), registration plates (`TN 38 AB 1234`), color, and mileage.
* 👨‍🔧 **Mechanic Roster**: Specialization tracking (Engine, Electrical, Brakes, AC, Transmission, General Service) with live status toggling (Available 🟢, Busy 🟣, Inactive 🔴).
* 📅 **Service Bookings**: Interactive schedule manager with status workflow (Pending 🟡, Confirmed 🔵, In Progress 🟣, Completed 🟢, Cancelled 🔴) and auto-generated IDs (`VS-1001`).
* 🛠️ **Service Records**: Automated backend summation `total_cost = parts_cost + labor_cost`. Automatic status synchronization updating booking status to `Completed` and mechanic status to `Available`.
* 💳 **Billing & Payments**: Track invoices across payment methods (UPI, Cash, Credit Card, Debit Card, Net Banking) and transaction reference UTRs (`PAY-1001`).
* 📊 **Live Analytics Dashboard**: Single aggregated `/api/dashboard` API powering real-time KPI metrics, monthly revenue trends, booking ratio pie charts, popular services, and recent activity.
* 📈 **Visual Reports Suite**: Recharts data visualizations for Revenue, Bookings, Services, Mechanics, and Customers with custom date range filters (`?from=YYYY-MM-DD&to=YYYY-MM-DD`).

---

## 🛠️ Technology Stack

### Frontend
* **React.js (v18)** & **Vite**
* **Tailwind CSS** & **Vanilla CSS**
* **Lucide React** (Modern Icons)
* **Recharts** (Interactive SVG Graphs)
* **Axios** (API Client Service Layer)

### Backend
* **Node.js** & **Express.js** (REST API)
* **MySQL** (`mysql2/promise` Connection Pool)
* **JWT** (`jsonwebtoken`) & **bcryptjs** (Password Hashing)
* **CORS** & **Dotenv**

---

## 📁 Architecture & Folder Structure

```text
vehicle/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool & auto-migration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── vehicleController.js
│   │   ├── bookingController.js
│   │   ├── serviceController.js
│   │   ├── mechanicController.js
│   │   ├── paymentController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Vehicle.js
│   │   ├── Mechanic.js
│   │   ├── Booking.js
│   │   ├── Service.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── mechanicRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT protection
│   │   └── errorMiddleware.js   # Central error JSON handler
│   ├── utils/
│   │   └── generateId.js        # Domain ID generator (CUS-1001, VS-1001)
│   ├── scripts/
│   │   └── seed.js              # Database seed script (20 customers, 25 vehicles, etc.)
│   ├── schema.sql               # MySQL Database schema export
│   ├── .env                     # Server environment settings
│   ├── package.json
│   └── server.js                # Server entry point (Port 5000)
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, StatusBadge, ConfirmModal, Toast, Pagination
│   │   ├── context/             # AuthContext.jsx
│   │   ├── pages/               # Login, Dashboard, Customers, Vehicles, Mechanics, Bookings, Services, Payments, Reports
│   │   ├── services/            # api.js (Axios API Client Layer)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🔑 Demo Login Credentials

You can log in to the dashboard using the default administrator account:

* **Email**: `admin@autocare.com`
* **Password**: `admin123`

*(Staff Account: `staff@autocare.com` / `staff123`)*

---

## ⚙️ Environment Variables (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=autocare_db
JWT_SECRET=autocare_pro_jwt_secret_key_2026_super_secure!
```

---

## 🚀 Quick Start & Installation Guide

### Step 1: Ensure MySQL is Running
Make sure your MySQL database service (e.g. XAMPP, WAMP, MySQL Server) is running on `localhost:3306`.

### Step 2: Seed the MySQL Database
Navigate to the `backend` folder and run the seed command:

```bash
cd backend
npm install
npm run seed
```

This script will automatically create the `autocare_db` database, initialize all 7 relational tables with appropriate indexes, and insert realistic sample data (20 Indian customers, 25 vehicles with Indian registration plates like `TN 38 AB 1234`, 8 mechanics, 30 service bookings, 25 service records, and 25 payment invoices).

### Step 3: Start the Node.js Backend API
In the `backend` directory:

```bash
npm run dev
```
The Express backend will start listening at **`http://localhost:5000`**.

### Step 4: Start the React Frontend Dashboard
In a new terminal, navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```
The React Vite dashboard will open at **`http://localhost:5173`**.

---

## 🧪 API Verification & Testing

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate user & receive JWT token |
| `/api/auth/profile` | `GET` | Retrieve logged-in user profile |
| `/api/dashboard` | `GET` | Aggregated dashboard metrics & charts |
| `/api/customers` | `GET / POST` | Customer directory CRUD & search |
| `/api/vehicles` | `GET / POST` | Vehicle registry CRUD |
| `/api/vehicles/customer/:id` | `GET` | Fetch vehicles owned by specific customer |
| `/api/mechanics` | `GET / POST` | Mechanic roster CRUD |
| `/api/mechanics/available` | `GET` | Fetch technicians ready for job assignment |
| `/api/bookings` | `GET / POST` | Service bookings CRUD |
| `/api/bookings/:id/status` | `PATCH` | Quick status updates (`Pending`, `Completed`, etc.) |
| `/api/services` | `GET / POST` | Service records with auto parts+labor summation |
| `/api/payments` | `GET / POST` | Invoices & payment method transactions |
| `/api/reports/revenue` | `GET` | Date-filtered financial reports for Recharts |

---

## 🎨 Visual Identity & Status Color System

* **Primary**: `#2563EB` (Electric Blue)
* **Secondary**: `#06B6D4` (Cyan Accent)
* **Accent**: `#F97316` (Warm Orange)
* **Success**: `#22C55E` (Emerald Green)
* **Danger**: `#EF4444` (Rose Red)

### Status Badges:
* 🟡 **Pending**
* 🔵 **Confirmed**
* 🟣 **In Progress**
* 🟢 **Completed** / **Paid** / **Available**
* 🔴 **Cancelled** / **Failed** / **Inactive**

---

© 2026 AutoCare Pro – Smart Service. Better Vehicles.
