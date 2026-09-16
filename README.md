# SwadGhar – Full-Stack Restaurant Website & Management System

SwadGhar is a modern, production-grade Restaurant Website and Multi-Role Restaurant Management System built with the MERN stack (MongoDB, Express, React, Node.js), Tailwind CSS, Razorpay payment gateway, Cloudinary, and JWT role-based authorization.

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, React Hook Form, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Helmet, Morgan, Express Rate Limit
- **Integrations**: Razorpay Checkout, Cloudinary Media

---

## 📁 Project Structure

```
swadGhar_restaurant/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Razorpay configs
│   │   ├── controllers/     # API request handlers
│   │   ├── middleware/      # Auth, Error & validation guards
│   │   ├── models/          # Mongoose database models
│   │   ├── routes/          # Express REST API routes
│   │   ├── seeds/           # Database seed scripts
│   │   ├── services/        # Business logic & integrations
│   │   ├── utils/           # Helper functions & constants
│   │   ├── validators/      # Schema validators
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server listener
│   ├── .env.example         # Backend environment templates
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Images & icons
│   │   ├── components/      # UI components (Navbar, Footer, Modals, Cards)
│   │   ├── context/         # Auth, Cart, & Notification Contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Main, Admin & Staff layouts
│   │   ├── pages/           # Customer & Admin pages
│   │   ├── routes/          # Protected and public routes
│   │   ├── services/        # Axios API client
│   │   ├── utils/           # Price & format helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── package.json             # Root workspace orchestration
```

---

## 🛠️ Installation & Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run Development Servers:**
   - Run Backend:
     ```bash
     npm run dev:backend
     ```
   - Run Frontend:
     ```bash
     npm run dev:frontend
     ```

3. **Check API Health:**
   - Navigate to `http://localhost:5000/api/health`
