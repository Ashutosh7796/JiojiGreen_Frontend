import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
const EmployeeLayout = lazy(() => import('../layouts/EmployeeLayout'));
const EmployeeDashboard = lazy(() => import('../pages/dashboard/EmployeeDashboard'));
const FarmerRegistration = lazy(() => import('../pages/EmployeeModule/FarmerRegistration/FarmerRegistration'));
const HistoryOverview = lazy(() => import('../pages/EmployeeModule/HistoryOverview/HistoryOverview'));
const PreviousHistory = lazy(() => import('../pages/EmployeeModule/PreviousHistoryFarmers/PreviousHistory'));
const UpdateFarmer = lazy(() => import('../pages/EmployeeModule/UpdateFarmer/UpdateFarmer'));
const MyLeaves = lazy(() => import('../pages/employees/MyLeaves'));

const EmployeeRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    //console.log('EmployeeRoutes loaded');
    //console.log('Current path:', location.pathname);
  }, [location]);

  return (
    <Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
      <Routes>
        <Route element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="my-leaves" element={<MyLeaves />} />
          <Route path="farmer-registration" element={<FarmerRegistration />} />
          <Route path="update-farmer" element={<UpdateFarmer />} />
          <Route path="history-overview" element={<HistoryOverview />} />
          <Route path="previous-history" element={<PreviousHistory />} />
          <Route path="fill-farmer-survey" element={<FarmerRegistration />} />
          <Route path="farmer-history" element={<PreviousHistory />} />
          <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default EmployeeRoutes;
