import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Customer Pages
import Home from '../pages/Home';
import Menu from '../pages/Menu';
import FoodDetails from '../pages/FoodDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import MyOrders from '../pages/MyOrders';
import OrderTracking from '../pages/OrderTracking';
import Reservations from '../pages/Reservations';
import About from '../pages/About';
import Gallery from '../pages/Gallery';
import Contact from '../pages/Contact';
import Franchise from '../pages/Franchise';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Profile from '../pages/Profile';
import OrderInvoice from '../pages/OrderInvoice';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminFoods from '../pages/admin/AdminFoods';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminInquiries from '../pages/admin/AdminInquiries';
import AdminReservations from '../pages/admin/AdminReservations';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AdminSettings from '../pages/admin/AdminSettings';

import { useAuth } from '../context/AuthContext';

// Protected Customer Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Protected Staff & Admin Guard
const StaffRoute = ({ children }) => {
  const { isStaff, loading } = useAuth();
  if (loading) return null;
  return isStaff ? children : <Navigate to="/login" replace />;
};

// Protected Admin-Only Guard
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Facing Web App */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="food/:id" element={<FoodDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="about" element={<About />} />
        <Route path="franchise" element={<Franchise />} />
        <Route path="franchises" element={<Franchise />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        {/* Customer Protected Routes */}
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success/:orderNumber"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/track/:id"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id/invoice"
          element={
            <ProtectedRoute>
              <OrderInvoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin & Staff Management Portal */}
      <Route
        path="/admin"
        element={
          <StaffRoute>
            <AdminLayout />
          </StaffRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="foods" element={<AdminFoods />} />
        <Route
          path="categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route path="reservations" element={<AdminReservations />} />
        <Route
          path="customers"
          element={
            <AdminRoute>
              <AdminCustomers />
            </AdminRoute>
          }
        />
        <Route
          path="reviews"
          element={
            <AdminRoute>
              <AdminReviews />
            </AdminRoute>
          }
        />
        <Route
          path="coupons"
          element={
            <AdminRoute>
              <AdminCoupons />
            </AdminRoute>
          }
        />
        <Route
          path="settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
