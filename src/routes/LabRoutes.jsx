import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
const LabLayout = lazy(() => import('../layouts/LabLayout'));
const LabDashboard = lazy(() => import('../pages/dashboard/LabDashboard'));
const LabReports = lazy(() => import('../pages/lab-reports/LabReports'));

const LabRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    //console.log("LabRoutes loaded");
    //console.log("Current path:", location.pathname);
  }, [location]);

  return (
    <Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
      <Routes>
        <Route element={<LabLayout />}>
          {/* Lab Dashboard */}
          <Route
            path="dashboard"
            element={
              <>
                {/* Redirecting to dashboard */}
                <Navigate to="/lab/dashboard" replace />
              </>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default LabRoutes;