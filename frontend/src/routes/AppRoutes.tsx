import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import UserManagementPage from '../features/users/pages/UserManagementPage';
import ExamManagementPage from '../features/exam/pages/ExamManagementPage';
import QuestionManagementPage from '../features/exam/pages/QuestionManagementPage';
import ExamListPage from '../features/exam/pages/ExamListPage';
import ExamTakingPage from '../features/exam/pages/ExamTakingPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/users" element={<UserManagementPage />} />
          <Route path="/dashboard/exams" element={<ExamManagementPage />} />
          <Route path="/dashboard/exams/:examId/questions" element={<QuestionManagementPage />} />
          <Route path="/exams" element={<ExamListPage />} />
          <Route path="/exams/:examId/take" element={<ExamTakingPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
