import { useState, useEffect } from 'react';

/**
 * Custom hook useDebounce giúp hoãn cập nhật giá trị sau một khoảng thời gian (delay).
 * Dùng chung cho: Search input, filter danh mục, gọi API tìm kiếm,... để tránh re-render liên tục.
 *
 * @param value Giá trị cần debounce (string, number, object,...)
 * @param delay Thời gian hoãn tính theo mili-giây (ms), mặc định 300ms
 * @returns Giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
