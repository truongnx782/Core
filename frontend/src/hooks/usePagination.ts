import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { UnknownAction } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '../store';

interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Generic custom hook for managing server-side pagination.
 * Hook dùng chung để quản lý phân trang phía server.
 * 
 * @param selector Function to select pagination state from Redux / Hàm chọn state phân trang
 * @param actionCreator Function that returns the fetch action / Hàm tạo action fetch dữ liệu
 */
export function usePagination<T extends PaginationState>(
  selector: (state: RootState) => T,
  actionCreator: (params: Record<string, unknown>) => UnknownAction,
  extraParams: Record<string, unknown> = {}
) {
  const dispatch = useDispatch<AppDispatch>();
  const pagination = useSelector(selector);

  // Stringify extraParams to use in dependency array without triggering on every render
  const extraParamsKey = JSON.stringify(extraParams);

  const fetchPage = useCallback(
    (page: number, size?: number) => {
      dispatch(
        actionCreator({
          ...JSON.parse(extraParamsKey),
          page: page,
          size: size || pagination.size,
        })
      );
    },
    [dispatch, actionCreator, extraParamsKey, pagination.size]
  );

  const onPageChange = useCallback(
    (page: number, pageSize: number) => {
      fetchPage(page - 1, pageSize);
    },
    [fetchPage]
  );

  return {
    ...pagination,
    currentPage: pagination.page + 1,
    onPageChange,
    refresh: () => fetchPage(pagination.page),
  };
}
