import { call, put } from "redux-saga/effects";
import { message } from "antd";
import type {
  ActionCreatorWithPayload
} from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";

/**
 * Options for the apiSaga helper / Các tùy chọn cho hàm apiSaga.
 */
interface ApiSagaOptions<TResponse, TActionPayload = unknown> {
  /** API function to call / Hàm gọi API từ service */
  apiMethod: (args: TActionPayload) => Promise<AxiosResponse<TResponse>>;
  /** Payload to pass to the API function / Dữ liệu truyền vào hàm API */
  actionPayload?: TActionPayload;
  /** Action to dispatch on success / Action gửi đi khi thành công */
  onSuccess?: ActionCreatorWithPayload<any, string>;
  /** Action to dispatch on failure / Action gửi đi khi thất bại */
  onFailure?: ActionCreatorWithPayload<any, string>;
  /** Message to show on success toast / Thông báo hiện lên khi thành công */
  successMessage?: string;
  /** Message to show on error toast (pass null to hide) / Thông báo hiện lên khi lỗi (truyền null để ẩn) */
  errorMessage?: string;
  /** Custom logic to run after success / Logic tùy chỉnh chạy sau khi thành công */
  callback?: (data: any) => Generator<unknown, void, unknown>;
}

/**
 * A clean and versatile wrapper for handling API calls in Redux-Saga.
 * Một wrapper sạch sẽ và đa năng để xử lý các cuộc gọi API trong Redux-Saga.
 */
export function* apiSaga<TResponse, TActionPayload = unknown>({
  apiMethod,
  actionPayload,
  onSuccess,
  onFailure,
  successMessage,
  errorMessage,
  callback,
}: ApiSagaOptions<TResponse, TActionPayload>) {
  try {
    // 1. CALL: Execute the API request / Thực hiện yêu cầu API
    const response: AxiosResponse<TResponse> = yield call(
      apiMethod,
      actionPayload as TActionPayload,
    );

    // 2. UNWRAP: Extract the useful data / Bóc tách dữ liệu hữu ích
    // Usually backend returns { success, message, data: T }, we only need the 'data' part.
    const responseBody = response.data as any;
    const resultData = responseBody?.data ?? responseBody;

    // 3. SUCCESS: Dispatch action and show notification / Xử lý khi thành công
    if (onSuccess) yield put(onSuccess(resultData));
    if (successMessage) message.success(successMessage);
    if (callback) yield* callback(resultData);

  } catch (error: unknown) {
    // 4. ERROR: Handle API or system errors / Xử lý lỗi API hoặc hệ thống
    const axiosError = error as import("axios").AxiosError<{ message?: string }>;
    
    // Resolve the best error message to show / Xác định thông báo lỗi tốt nhất để hiển thị
    const finalErrorMessage =
      axiosError.response?.data?.message || 
      axiosError.message || 
      errorMessage || 
      "An unexpected error occurred";

    if (onFailure) yield put(onFailure(finalErrorMessage));

    // Show toast unless errorMessage is explicitly null / Hiện thông báo trừ khi errorMessage là null
    if (errorMessage !== null) {
      message.error(finalErrorMessage);
    }
  }
}
