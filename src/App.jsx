import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load Components
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const LabLogin = lazy(() => import('./pages/auth/LabLogin'));
const EmployeeLogin = lazy(() => import('./pages/auth/EmployeeLogin'));
const AuthLogin = lazy(() => import('./pages/auth/AuthLogin'));

const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));

// Lazy Load Routes
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const EmployeeRoutes = lazy(() => import('./routes/EmployeeRoutes'));
const LabRoutes = lazy(() => import('./routes/LabRoutes'));

// Footer Pages
const Seeds = lazy(() => import('./pages/footer/Seeds'));
const Fertilizers = lazy(() => import('./pages/footer/Fertilizers'));
const AboutUs = lazy(() => import('./pages/footer/AboutUs'));
const ContactUs = lazy(() => import('./pages/footer/ContactUs'));
const FAQs = lazy(() => import('./pages/footer/FAQs'));
const Blog = lazy(() => import('./pages/footer/Blog'));

import './styles/main.css';

// Simple Loading Component
const PageLoader = () => (
  <div className="loading-container">
    <div className="spinner"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Auth Pages */}
          <Route path="/login" element={<EmployeeLogin />} />
          <Route path="/auth-login" element={<AuthLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/lab-login" element={<LabLogin />} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<UserDashboard />} />

          {/* Role Based */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/employee/*" element={<EmployeeRoutes />} />
          <Route path="/lab/*" element={<LabRoutes />} />

          {/* Footer */}
          <Route path="/seeds" element={<Seeds />} />
          <Route path="/fertilizers" element={<Fertilizers />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/blog" element={<Blog />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
