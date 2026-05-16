import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import type { UnknownAction } from "@reduxjs/toolkit";

interface MutationOptions {
  onSuccess?: () => void;
  selector: (state: RootState) => { loading: boolean; error: string | null };
}

/**
 * Custom hook to handle API mutations (Create/Update/Delete) and UI side-effects / Hook xử lý các thao tác thay đổi dữ liệu (Thêm/Sửa/Xóa) và các hiệu ứng UI đi kèm.
 */
export function useMutation({ onSuccess, selector }: MutationOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector(selector);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutate = (action: UnknownAction) => {
    setIsSubmitting(true);
    dispatch(action);
  };

  useEffect(() => {
    if (isSubmitting && !loading) {
      if (!error) {
        onSuccess?.();
      }
      const timer = setTimeout(() => setIsSubmitting(false), 0);
      return () => clearTimeout(timer);
    }
  }, [loading, error, isSubmitting, onSuccess]);

  return {
    mutate,
    isLoading: loading && isSubmitting,
  };
}
