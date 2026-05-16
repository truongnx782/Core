import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import UserManagementPage from "../features/users/pages/UserManagementPage";
import ExamListPage from "../features/exam/pages/ExamListPage";
import ExamTakingPage from "../features/exam/pages/ExamTakingPage";
import ExamResultPage from "../features/exam/pages/ExamResultPage";
import type { RootState } from "../store";

const RequireRole: React.FC<{ roles: string[]; children: React.ReactNode }> = ({
  roles,
  children,
}) => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  return roles.includes(userRole || "") ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard/exams" replace />
  );
};

const AppRoutes: React.FC = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              userRole === "STUDENT" ? (
                <Navigate to="/dashboard/exams" replace />
              ) : (
                <DashboardPage />
              )
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <RequireRole roles={["ADMIN", "MANAGER"]}>
                <UserManagementPage />
              </RequireRole>
            }
          />
          <Route path="/dashboard/exams" element={<ExamListPage />} />
          <Route
            path="/dashboard/exams/:id/take"
            element={<ExamTakingPage />}
          />
          <Route
            path="/dashboard/exams/:id/result"
            element={<ExamResultPage />}
          />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
