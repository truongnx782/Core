package com.core.controller;

import com.core.common.BaseResponse;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * Base controller providing helper methods for standardized API responses.
 * Controller cơ bản cung cấp các hàm tiện ích để trả về response chuẩn hóa.
 */
public abstract class BaseController {

    /**
     * Return a success response with data.
     * Trả về response thành công kèm dữ liệu.
     */
    protected <T> ResponseEntity<BaseResponse<T>> success(T data) {
        return ResponseEntity.ok(BaseResponse.success(data));
    }

    /**
     * Return a success response with a simple message.
     * Trả về response thành công kèm thông báo đơn giản.
     */
    protected ResponseEntity<BaseResponse<Void>> success(String message) {
        return ResponseEntity.ok(BaseResponse.success(null));
    }

    /**
     * Return an error response with a specific error code and message.
     * Trả về response lỗi với mã lỗi và thông báo cụ thể.
     */
    protected ResponseEntity<BaseResponse<Void>> error(String message) {
        return ResponseEntity.badRequest().body(BaseResponse.error(message));
    }

    /**
     * Return a validation error response.
     * Trả về response lỗi validation (dữ liệu đầu vào không hợp lệ).
     */
    protected ResponseEntity<BaseResponse<Map<String, String>>> validationError(String message, Map<String, String> errors) {
        return ResponseEntity.badRequest().body(BaseResponse.error(message, errors));
    }
}
