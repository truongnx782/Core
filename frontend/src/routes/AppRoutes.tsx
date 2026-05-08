import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import UserManagementPage from '../features/users/pages/UserManagementPage';
import ExamListPage from '../features/exam/pages/ExamListPage';
import ExamTakingPage from '../features/exam/pages/ExamTakingPage';
import ExamResultPage from '../features/exam/pages/ExamResultPage';
import ExamQuestionManagementPage from '../features/exam/pages/ExamQuestionManagementPage';
import type { RootState } from '../store';

const AppRoutes: React.FC = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  const RequireRole: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
    return roles.includes(userRole || '') ? <>{children}</> : <Navigate to="/dashboard/exams" replace />;
  };

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
            element={userRole === 'STUDENT' ? <Navigate to="/dashboard/exams" replace /> : <DashboardPage />}
          />
          <Route
            path="/dashboard/users"
            element={
              <RequireRole roles={['ADMIN', 'MANAGER']}>
                <UserManagementPage />
              </RequireRole>
            }
          />
          <Route path="/dashboard/exams" element={<ExamListPage />} />
          <Route path="/dashboard/exams/:id/take" element={<ExamTakingPage />} />
          <Route path="/dashboard/exams/:id/result" element={<ExamResultPage />} />
          <Route
            path="/dashboard/exams/:id/questions"
            element={
              <RequireRole roles={['ADMIN', 'MANAGER']}>
                <ExamQuestionManagementPage />
              </RequireRole>
            }
          />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
