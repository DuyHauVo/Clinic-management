import { useRef, useState, useCallback } from 'react';

/**
 * Hook xử lý hành vi kéo-thả (drag & drop) file Excel chuẩn cho mọi dropzone:
 * 1. Quản lý input file ẩn (ref) + trạng thái isDragging để highlight UI
 * 2. Chặn kéo thả / mở dialog khi đang loading
 * 3. Gán file thả vào input ẩn rồi dispatch sự kiện 'change' để tái sử dụng
 *    đúng một đường xử lý onChange của caller (onFileUpload).
 */
export function useFileDropzone(isLoadingFile: boolean) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isLoadingFile) {
        setIsDragging(true);
      }
    },
    [isLoadingFile],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (isLoadingFile) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0 && fileInputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(files[0]);
        fileInputRef.current.files = dt.files;
        const changeEvent = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(changeEvent);
      }
    },
    [isLoadingFile],
  );

  const openFilePicker = useCallback(() => {
    if (!isLoadingFile) {
      fileInputRef.current?.click();
    }
  }, [isLoadingFile]);

  return {
    fileInputRef,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFilePicker,
  };
}
