import { useState, useEffect } from "react";

/**
 * Debounce a value by the specified delay / Trì hoãn việc cập nhật một giá trị theo thời gian delay chỉ định.
 * Returns the debounced value that only updates after the delay has passed / Trả về giá trị đã được debounce, chỉ cập nhật sau khi khoảng thời gian delay đã trôi qua.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
