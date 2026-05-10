import { call, put } from 'redux-saga/effects';
import { message } from 'antd';
import type { ActionCreatorWithPayload, ActionCreatorWithoutPayload } from '@reduxjs/toolkit';
import type { AxiosResponse } from 'axios';

interface ApiSagaOptions<TResponse, TActionPayload = any> {
  apiMethod: (args: any) => Promise<AxiosResponse<any>>;
  actionPayload?: TActionPayload;
  onSuccess?: ActionCreatorWithPayload<TResponse> | ActionCreatorWithoutPayload;
  onFailure?: ActionCreatorWithPayload<string>;
  successMessage?: string;
  errorMessage?: string;
  callback?: (data: TResponse) => Generator<any, void, any>;
}

/**
 * Common Saga wrapper to handle API calls, success/error dispatching, and toast notifications.
 * Wrapper dùng chung cho các Saga để gọi API, tự động xử lý lỗi và hiển thị thông báo.
 */
export function* apiSaga<TResponse, TActionPayload = any>({
  apiMethod,
  actionPayload,
  onSuccess,
  onFailure,
  successMessage,
  errorMessage,
  callback,
}: ApiSagaOptions<TResponse, TActionPayload>) {
  try {
    const response: AxiosResponse = yield call(apiMethod, actionPayload);
    const data = response.data?.data || response.data;

    if (onSuccess) {
      yield put((onSuccess as ActionCreatorWithPayload<any>)(data));
    }

    if (successMessage) {
      message.success(successMessage);
    }

    if (callback) {
      yield* callback(data);
    }
  } catch (error: any) {
    const msg = error.response?.data?.message || errorMessage || 'An unexpected error occurred';
    
    if (onFailure) {
      yield put(onFailure(msg));
    }
    
    if (errorMessage !== null) { // if null is passed, suppress toast
      message.error(msg);
    }
  }
}
