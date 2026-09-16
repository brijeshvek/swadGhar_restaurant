# SwadGhar – Premium Full-Stack Restaurant Website & Management System

> **A Complete MERN Stack Enterprise Solution with Role-Based Portals, Table Reservations, Live Order Tracking, Coupon Engine, Razorpay Payments, and Analytics Dashboard.**

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features by Role](#-key-features-by-role)
3. [Technology Stack](#-technology-stack)
4. [Architecture & Folder Structure](#-architecture--folder-structure)
5. [Quick Demo Credentials](#-quick-demo-credentials)
6. [Installation & Setup](#-installation--setup)
7. [Environment Configuration](#-environment-configuration)
8. [Database Seeder](#-database-seeder)
9. [REST API Documentation](#-rest-api-documentation)
10. [Payment Integration (Razorpay)](#-payment-integration-razorpay)
11. [Production Deployment](#-production-deployment)

---

## 🌟 Project Overview

**SwadGhar** is a full-stack restaurant management platform designed to deliver an authentic fine-dining experience to customers while providing restaurant staff and administrators with comprehensive digital tools to manage orders, inventory, seating reservations, customer analytics, and business financials.

---

## 👥 Key Features by Role

### 1. Customer Experience
- **Interactive Homepage**: Hero section, signature dish spotlights, cuisine heritage story, diner reviews, and banquet booking CTAs.
- **Dynamic Menu Explorer**:
  - Live search with instant debouncing.
  - Multi-criteria filtering (Category tabs, Pure Veg / Vegan / Non-Veg toggles, Spice levels from Mild to Extra Spicy).
  - Sorting (Most Popular, Highest Rated, Price Low to High, Price High to Low, Name A-Z).
- **Food Details Page**: High-resolution gallery, nutrition profile (Calories, Protein, Carbs, Fats), ingredient list, and verified reviews.
- **Smart Shopping Cart**: LocalStorage persistent plate, coupon discount calculator, free delivery progress bar (unlocked on orders > ₹499), and 5% GST calculation.
- **Multi-Mode Checkout**: Choose between Home Delivery, Takeaway Pickup, or Dine-In; select saved addresses or enter custom delivery locations; choose Cash on Delivery (COD) or Online Razorpay.
- **Live Order Tracking**: Real-time 6-stage animated progression stepper (`Placed` -> `Confirmed` -> `Cooking` -> `Packed` -> `Out for Delivery` -> `Delivered`) with automated status polling.
- **Table Reservation System**: Pick party size (1–20 guests), calendar date picker, lunch/dinner slot selector, and special seating requests with capacity conflict prevention.
- **User Profile & Order Invoices**: Manage saved delivery addresses, update passwords, view order history, and submit 1–5 star reviews on completed meals.

### 2. Staff Kitchen Portal
- **Live Kitchen Orders Desk**: View active tickets in real time, filter by status, and update cooking progression (`Pending` -> `Confirmed` -> `Preparing` -> `Ready`).
- **Table Seating Desk**: View reservations and confirm or complete table bookings.
- **Menu Stock Control**: Instantly mark dishes `In Stock` or `Sold Out` based on kitchen inventory.

### 3. Administrator Portal
- **Real-Time Analytics Dashboard**: Total revenue, daily revenue, active customer counts, kitchen load, and 7-day revenue trend bar charts.
- **Menu & Dish CRUD**: Add, edit, and delete delicacies; configure prices, promotional discounts, spice ratings, and featured tags.
- **Category Manager**: Create and re-order menu categories.
- **Customer Directory**: View customer order volumes, lifetime spend, and toggle account access suspension.
- **Coupon Campaign Engine**: Launch percentage or flat discount promo codes with minimum basket thresholds and usage caps.
- **Review Moderation**: Moderate diner reviews.
- **Restaurant Settings**: Adjust GST rates, delivery fees, minimum order thresholds, and store open/closed switches.

---

## 💻 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React Icons, React Hook Form
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ODM, JWT Authentication, bcryptjs, Helmet, Morgan, Express Rate Limit
- **Integrations**: Razorpay Checkout SDK, Cloudinary Image Storage, Google Maps Embed

---

## 📁 Architecture & Folder Structure

```
swadGhar_restaurant/
├── backend/
│   ├── src/
│   │   ├── config/              # DB connection & external service configs
│   │   ├── controllers/         # Auth, Food, Category, Order, Reservation, Coupon, Admin
│   │   ├── middleware/          # Auth, Role guards, Rate limiter, Error handler
│   │   ├── models/              # User, Food, Category, Order, Reservation, Review, Coupon, Settings
│   │   ├── routes/              # RESTful API routes
│   │   ├── seeds/               # Database seeder script
│   │   ├── utils/               # Resilient in-memory fallback store
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server listener
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # FoodCard, Modals, Buttons
│   │   │   └── layout/          # Navbar, Footer
│   │   ├── context/             # AuthContext, CartContext, NotificationContext
│   │   ├── layouts/             # MainLayout, AdminLayout
│   │   ├── pages/               # Home, Menu, FoodDetails, Cart, Checkout, OrderTracking, Admin views
│   │   ├── routes/              # AppRoutes with Role Guards
│   │   ├── services/            # Axios API client with Bearer token interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── package.json                 # Root workspace orchestration
```

---

## 🔑 Quick Demo Credentials

For testing and evaluation, one-click demo credentials are built directly into the login screen at `/login`:

| Role | Email | Password | Access Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@swadghar.com` | `Admin@123` | Full Dashboard, Menu CRUD, Settings, Customers, Coupons |
| **Staff** | `staff@swadghar.com` | `Staff@123` | Kitchen Orders Desk, Table Bookings, Dish Availability |
| **Customer** | `customer@gmail.com` | `Customer@123` | Ordering, Cart, Checkout, Order Tracking, Table Booking |

---

## 🚀 Installation & Setup

1. **Clone and Install Dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start Backend Server:**
   ```bash
   npm run dev:backend
   ```
   *(Runs on `http://localhost:5000`)*

3. **Start Frontend Client:**
   ```bash
   npm run dev:frontend
   ```
   *(Runs on `http://localhost:5173`)*

4. **Seed Initial Database:**
   ```bash
   npm run seed
   ```

---

## ⚙️ Environment Configuration

Create `backend/.env` based on `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.3q4spvt.mongodb.net/swadghar?retryWrites=true&w=majority
JWT_SECRET=swadghar_super_secure_jwt_secret_key_2026_dev_prod
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=1234567890
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register customer account
- `POST /api/auth/login` – Authenticate user and receive JWT
- `GET /api/auth/me` – Fetch current user profile (Protected)
- `PUT /api/auth/profile` – Update profile details (Protected)
- `PUT /api/auth/change-password` – Change password (Protected)
- `POST /api/auth/address` – Add saved delivery address (Protected)
- `DELETE /api/auth/address/:id` – Remove saved address (Protected)
- `POST /api/auth/forgot-password` – Generate recovery code
- `POST /api/auth/reset-password` – Reset password with code

### Foods & Categories (`/api/foods`, `/api/categories`)
- `GET /api/foods` – Search, filter by category/diet/spice, sort, paginate
- `GET /api/foods/featured` – Signature dishes for homepage
- `GET /api/foods/popular` – Most loved dishes
- `GET /api/foods/:id` – Food details with customer reviews
- `POST /api/foods` – Create new dish (Admin)
- `PUT /api/foods/:id` – Update dish (Admin)
- `DELETE /api/foods/:id` – Delete dish (Admin)
- `PATCH /api/foods/:id/availability` – Toggle stock status (Staff/Admin)
- `GET /api/categories` – Fetch active categories
- `POST /api/categories` – Create category (Admin)

### Orders & Tracking (`/api/orders`)
- `POST /api/orders` – Create order with strict backend calculations
- `GET /api/orders/my-orders` – Customer order history
- `GET /api/orders/:id` – Single order tracking details
- `PUT /api/orders/:id/status` – Update cooking/delivery status (Staff/Admin)
- `PUT /api/orders/:id/cancel` – Cancel pending order

### Table Reservations (`/api/reservations`)
- `POST /api/reservations` – Request table reservation
- `GET /api/reservations/my-reservations` – Customer booking history
- `GET /api/reservations` – All table reservations (Staff/Admin)
- `PUT /api/reservations/:id/status` – Confirm, reject, or assign table (Staff/Admin)

### Coupons (`/api/coupons`)
- `GET /api/coupons` – Active promotional coupons
- `POST /api/coupons/validate` – Validate code against basket subtotal
- `POST /api/coupons` – Create coupon code (Admin)
- `DELETE /api/coupons/:id` – Remove coupon (Admin)

### Admin Analytics (`/api/admin`)
- `GET /api/admin/dashboard-stats` – Live metrics and 7-day revenue trends
- `GET /api/admin/customers` – Customer lifetime spend metrics
- `PATCH /api/admin/customers/:id/toggle-block` – Suspend/activate customer account

---

## 💳 Payment Integration (Razorpay)

1. Customer places order on Checkout with "Online Payment (Razorpay)" selected.
2. Backend creates order and initiates Razorpay transaction ID via `POST /api/payments/razorpay/create-order`.
3. Frontend opens official Razorpay Checkout modal.
4. On payment completion, the backend verifies the cryptographic HMAC SHA256 signature via `POST /api/payments/razorpay/verify`.
5. Order advances to `confirmed` status and stores the `razorpayPaymentId`.

---

## 🚢 Production Deployment

- **Frontend**: Deploy `frontend/dist` on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) with root rewrite to `/index.html`.
- **Backend**: Deploy `backend` on [Render](https://render.com), [Railway](https://railway.app), or AWS EC2 with environment variables.
- **Database**: MongoDB Atlas Cluster with IP whitelist `0.0.0.0/0`.
