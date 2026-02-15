import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const EmployeeList = lazy(() => import('../pages/employees/EmployeeList'));
const AddEditEmployee = lazy(() => import('../pages/employees/AddEditEmployee'));
const FarmerList = lazy(() => import('../pages/farmers/FarmerList'));
const FarmerDetail = lazy(() => import('../pages/farmers/FarmerDetail'));
const AddEditFarmer = lazy(() => import('../pages/farmers/AddEditFarmer'));
const SurveyHistory = lazy(() => import('../pages/farmers/SurveyHistory'));
const OrderList = lazy(() => import('../pages/orders/OrderList'));
const OrderDetail = lazy(() => import('../pages/orders/OrderDetail'));
const ProductList = lazy(() => import('../pages/products/ProductList'));
const AddEditProduct = lazy(() => import('../pages/products/AddEditProduct'));
const LabReports = lazy(() => import('../pages/lab-reports/LabReports'));
const AttendanceManagement = lazy(() => import('../pages/employees/AttendanceManagement'));
const EmployeeLocationHistory = lazy(() => import('../pages/employees/EmployeeLocationHistory'));
const LeaveManagement = lazy(() => import('../pages/employees/LeaveManagement'));

const AdminRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<div className="loading-container"><div className="spinner"></div></div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="attendance/employee/:employeeId" element={<EmployeeLocationHistory />} />
          <Route path="leave-management" element={<LeaveManagement />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/add" element={<AddEditEmployee />} />
          <Route path="employees/edit/:id" element={<AddEditEmployee />} />
          <Route path="farmers" element={<FarmerList />} />
          <Route path="farmers/add" element={<AddEditFarmer />} />
          <Route path="farmers/edit/:id" element={<AddEditFarmer />} />
          <Route path="farmers/:id" element={<FarmerDetail />} />
          <Route path="history" element={<SurveyHistory />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddEditProduct />} />
          <Route path="products/edit/:id" element={<AddEditProduct />} />
          <Route path="lab-reports" element={<LabReports />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;