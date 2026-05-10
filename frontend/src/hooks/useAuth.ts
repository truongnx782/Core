import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState, AppDispatch } from '../store';
import {
  loginRequest,
  logoutAction,
  clearAuthError,
  registerRequest,
} from '../features/auth/authSlice';

/**
 * Custom hook providing auth state and helpers.
 * Hook tuỳ chỉnh cung cấp trạng thái xác thực (auth state) và các hàm tiện ích (login, logout, register).
 */
export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    (email: string, password: string) => {
      dispatch(loginRequest({ email, password }));
    },
    [dispatch]
  );

  const register = useCallback(
    (
      username: string,
      email: string,
      password: string,
      fullName?: string
    ) => {
      dispatch(registerRequest({ username, email, password, fullName }));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    logout,
    clearError,
  };
}
