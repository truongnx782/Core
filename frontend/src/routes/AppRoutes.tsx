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
import ExamSubmissionsPage from "../features/exam/pages/ExamSubmissionsPage";
import ExamResultPage from "../features/exam/pages/ExamResultPage";
import type { RootState } from "../store";

/**
 * Component to protect routes based on user role / Component bảo vệ các tuyến đường dựa trên vai trò người dùng.
 */
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

/**
 * Main application routing configuration / Cấu hình định tuyến chính của ứng dụng.
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes / Các tuyến đường công khai */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected dashboard routes / Các tuyến đường yêu cầu đăng nhập */}
      <Route path="/dashboard" element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />

          {/* User management / Quản lý người dùng - Admin only */}
          <Route
            path="users"
            element={
              <RequireRole roles={["ADMIN", "MANAGER"]}>
                <UserManagementPage />
              </RequireRole>
            }
          />

          {/* Exam routes / Các tuyến đường liên quan đến đề thi */}
          <Route path="exams" element={<ExamListPage />} />

          {/* View submissions / Xem kết quả học sinh - Admin only */}
          <Route
            path="exams/:id/results"
            element={
              <RequireRole roles={["ADMIN", "MANAGER"]}>
                <ExamSubmissionsPage />
              </RequireRole>
            }
          />

          <Route path="exams/:id/take" element={<ExamTakingPage />} />
          <Route path="exams/:id/result" element={<ExamResultPage />} />
        </Route>
      </Route>

      {/* Default redirect / Chuyển hướng mặc định */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
