import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState, AppDispatch } from '../store';
import { fetchUsersRequest } from '../features/users/userSlice';

/**
 * Custom hook for managing server-side pagination + filters.
 */
export function usePagination() {
  const dispatch = useDispatch<AppDispatch>();
  const { pagination, filters } = useSelector((state: RootState) => state.users);

  const fetchPage = useCallback(
    (page: number, size?: number) => {
      dispatch(
        fetchUsersRequest({
          keyword: filters.keyword,
          role: filters.role,
          page: page,
          size: size || pagination.size,
        })
      );
    },
    [dispatch, filters, pagination.size]
  );

  const onPageChange = useCallback(
    (page: number, pageSize: number) => {
      // Ant Design pagination is 1-indexed; API is 0-indexed
      fetchPage(page - 1, pageSize);
    },
    [fetchPage]
  );

  return {
    ...pagination,
    currentPage: pagination.page + 1, // Convert to 1-indexed for UI
    filters,
    fetchPage,
    onPageChange,
  };
}
