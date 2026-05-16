import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import type { RootState, AppDispatch } from "../store";

interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Generic custom hook for managing server-side pagination / Hook dùng chung để quản lý phân trang phía server.
 *
 * @param selector Function to select pagination state from Redux / Hàm chọn state phân trang
 * @param actionCreator Function that returns the fetch action / Hàm tạo action fetch dữ liệu
 * @param extraParams Additional filters or parameters / Các tham số lọc bổ sung
 */
export function usePagination<T extends PaginationState>(
  selector: (state: RootState) => T,
  actionCreator: any,
  extraParams: any = {},
) {
  const dispatch = useDispatch<AppDispatch>();
  const pagination = useSelector(selector);

  const fetchPage = useCallback(
    (page: number, size?: number) => {
      dispatch(
        actionCreator({
          ...extraParams,
          page,
          size: size || pagination.size,
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, actionCreator, JSON.stringify(extraParams), pagination.size],
  );

  const onPageChange = useCallback(
    (page: number, pageSize: number) => {
      fetchPage(page - 1, pageSize);
    },
    [fetchPage],
  );

  return {
    ...pagination,
    currentPage: pagination.page + 1,
    onPageChange,
    refresh: () => fetchPage(pagination.page),
  };
}
