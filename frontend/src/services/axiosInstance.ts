import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../store";
import { refreshTokenSuccess, logoutAction } from "../features/auth/authSlice";

// Determine the base API URL based on the environment (development or production)
// Xác định địa chỉ API cơ sở dựa trên môi trường (phát triển hoặc thực tế)
const API_BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8080/api" : "/api";

/**
 * Initialize Axios instance with default configurations:
 * Khởi tạo Instance Axios với các cấu hình mặc định:
 * - baseURL: Root path of the API / Đường dẫn gốc của API
 * - withCredentials: Allow sending cookies (important for session/refresh tokens) / Cho phép gửi cookie (quan trọng cho session/refresh token)
 * - headers: Default data format is JSON / Định dạng dữ liệu mặc định là JSON
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request Interceptor (Bộ chặn yêu cầu gửi đi) ----
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Redux Store
    // Lấy token từ Redux Store
    const token = store.getState().auth.accessToken;

    // If token exists, automatically attach it to the Authorization Header as Bearer
    // Nếu có token, tự động gắn vào Header Authorization dưới dạng Bearer
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response Interceptor with Token Refresh Queue (Bộ chặn phản hồi và Xử lý làm mới Token) ----
// State variable to track if a refresh token request is currently in progress
// Biến trạng thái để biết đang trong quá trình làm mới token hay không
let isRefreshing = false;

// Queue to store requests that are paused while waiting for a new token
// Hàng đợi lưu trữ các yêu cầu bị tạm dừng chờ token mới
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: AxiosError) => void;
}> = [];

/**
 * Function to process the queue: retry or cancel requests based on refresh token result
 * Hàm xử lý hàng đợi: Thực thi lại các yêu cầu hoặc hủy bỏ chúng dựa trên kết quả refresh token
 */
const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response, // If response is successful (2xx), return result immediately / Nếu phản hồi thành công (2xx), trả về kết quả ngay
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 (Unauthorized) and it's not a retry or an auth-related request
    // Kiểm tra nếu lỗi là 401 (Hết hạn token) và không phải là yêu cầu thử lại hay yêu cầu đăng nhập/auth
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      // If a refresh token request is already running
      // Nếu đang có một yêu cầu làm mới token khác đang chạy
      if (isRefreshing) {
        // Return a Promise that will resolve when the refresh process completes
        // Trả về một Promise sẽ được giải quyết khi quá trình refresh token hoàn tất
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axiosInstance(originalRequest)); // Retry original request with new token / Thực thi lại yêu cầu cũ với token mới
            },
            reject,
          });
        });
      }

      originalRequest._retry = true; // Mark this request as retried to avoid infinite loops / Đánh dấu yêu cầu này đã thử lại (tránh lặp vô tận)
      isRefreshing = true; // Start the refreshing process / Bắt đầu quá trình làm mới token

      try {
        // Call refresh token API
        // Gọi API làm mới token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data.data.accessToken;

        // Save new token to Redux Store
        // Lưu token mới vào Redux Store
        store.dispatch(
          refreshTokenSuccess({
            accessToken: newAccessToken,
            user: response.data.data.user,
          }),
        );

        // Notify all queued requests that the new token is available
        // Thông báo cho tất cả các yêu cầu trong hàng đợi là đã có token mới
        processQueue(null, newAccessToken);

        // Attach new token to current request and retry it
        // Gắn token mới vào yêu cầu hiện tại và thực thi lại
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token also expired)
        // Nếu làm mới token thất bại (ví dụ: Refresh Token cũng hết hạn)
        processQueue(refreshError as AxiosError); // Cancel all queued requests / Hủy tất cả yêu cầu trong hàng đợi
        store.dispatch(logoutAction()); // Logout user / Đăng xuất người dùng
        window.location.href = "/login"; // Redirect to login page / Chuyển về trang đăng nhập
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // End the refreshing process / Kết thúc quá trình làm mới
      }
    }

    // If not a 401 error or already handled, reject the error for the caller to handle
    // Nếu lỗi không phải 401 hoặc đã xử lý xong, trả về lỗi cho phía gọi API xử lý tiếp
    return Promise.reject(error);
  },
);

export default axiosInstance;
