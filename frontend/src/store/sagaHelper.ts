import { call, put } from "redux-saga/effects";
import { message } from "antd";
import type {
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from "@reduxjs/toolkit";
import type { AxiosResponse } from "axios";

interface ApiSagaOptions<TResponse, TActionPayload = unknown> {
  apiMethod: (args: TActionPayload) => Promise<AxiosResponse<TResponse>>;
  actionPayload?: TActionPayload;
  onSuccess?: ActionCreatorWithPayload<TResponse> | ActionCreatorWithoutPayload;
  onFailure?: ActionCreatorWithPayload<string>;
  successMessage?: string;
  errorMessage?: string;
  callback?: (data: TResponse) => Generator<unknown, void, unknown>;
}

/**
 * Common Saga wrapper to handle API calls, success/error dispatching, and toast notifications / Wrapper dùng chung cho các Saga để gọi API, tự động xử lý lỗi và hiển thị thông báo.
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
    const response: AxiosResponse<TResponse> = yield call(
      apiMethod,
      actionPayload as TActionPayload,
    );
    const responseData = response.data as Record<string, unknown>;
    const data = (
      responseData?.data !== undefined ? responseData.data : responseData
    ) as TResponse;

    if (onSuccess) {
      yield put(
        (onSuccess as ActionCreatorWithPayload<TResponse>)(data as TResponse),
      );
    }

    if (successMessage) {
      message.success(successMessage);
    }

    if (callback) {
      yield* callback(data as TResponse);
    }
  } catch (error: unknown) {
    const err = error as import("axios").AxiosError<{ message?: string }>;
    const msg =
      err.response?.data?.message ||
      err.message ||
      errorMessage ||
      "An unexpected error occurred";

    if (onFailure) {
      yield put(onFailure(msg));
    }

    if (errorMessage !== null) {
      // if null is passed, suppress toast / nếu giá trị null được truyền vào, bỏ qua thông báo
      message.error(msg);
    }
  }
}
