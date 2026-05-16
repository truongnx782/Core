import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

// ---- Reducers / Các reducer quản lý state của từng tính năng ----
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import examReducer from "../features/exam/examSlice";
import appReducer from "./appSlice";
import rootSaga from "./rootSaga";

// Create saga middleware / Khởi tạo middleware cho Redux Saga
const sagaMiddleware = createSagaMiddleware();

/**
 * Configure Redux Store / Cấu hình Redux Store trung tâm của ứng dụng
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    exam: examReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
      sagaMiddleware,
    ),
});

// Run root saga / Chạy root saga để lắng nghe các action
sagaMiddleware.run(rootSaga);

// Export types for TypeScript / Xuất các kiểu dữ liệu cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
