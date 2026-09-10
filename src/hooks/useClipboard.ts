import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

export const useClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);
  const toast = useToast();

  const copy = useCallback(
    (text: string, message = 'Đã sao chép nội dung vào khay nhớ tạm') => {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(message, 'Đã Sao Chép');
      setTimeout(() => setIsCopied(false), timeout);
    },
    [toast, timeout]
  );

  return { isCopied, copy };
};
