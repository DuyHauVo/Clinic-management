import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { copyTextToClipboard } from '../utils/shared/excelXmlShared';

export const useClipboard = (timeout = 2000) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const toast = useToast();

  const copy = useCallback(
    async (text: string, message = 'Đã sao chép nội dung vào khay nhớ tạm', key = 'default') => {
      if (!text) {
        toast.warning('Không có nội dung để sao chép', 'Sao Chép');
        return false;
      }
      const success = await copyTextToClipboard(text);
      if (success) {
        setCopiedKey(key);
        toast.success(message, 'Đã Sao Chép');
        setTimeout(() => setCopiedKey(null), timeout);
        return true;
      } else {
        toast.error('Không thể truy cập khay nhớ tạm (Clipboard)', 'Lỗi Sao Chép');
        return false;
      }
    },
    [toast, timeout]
  );

  return {
    isCopied: copiedKey !== null,
    copiedKey,
    isKeyCopied: (key: string) => copiedKey === key,
    copy
  };
};
