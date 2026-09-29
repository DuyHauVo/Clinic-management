import React, { useEffect, useRef, useCallback } from "react";

/**
 * Hook xử lý hành vi chuẩn cho Modal:
 * 1. Đóng modal khi bấm phím Escape (sử dụng Capture Phase để không bị nuốt sự kiện)
 * 2. Khóa cuộn trang (body scroll lock) khi modal đang mở
 * 3. Đóng modal an toàn khi click backdrop (ngăn đóng nhầm khi bôi đen/kéo chuột)
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Ref theo dõi điểm bắt đầu mousedown trên backdrop
  const isBackdropMouseDownRef = useRef(false);

  const handleBackdropMouseDown = useCallback((e: React.MouseEvent) => {
    isBackdropMouseDownRef.current = e.target === e.currentTarget;
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Chỉ đóng modal khi CẢ mousedown và click đều diễn ra trên backdrop
    if (e.target === e.currentTarget && isBackdropMouseDownRef.current) {
      onCloseRef.current();
    }
    isBackdropMouseDownRef.current = false;
  }, []);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (window.getSelection) {
            window.getSelection()?.removeAllRanges();
          }
        } catch {
          // ignore
        }
        onCloseRef.current();
      }
    };

    const handleWindowMouseUp = () => {
      // Khi người dùng nhả chuột ở bất kỳ đâu ngoài khung hoặc trên scrollbar,
      // trình duyệt sẽ kết thúc trạng thái drag-selection ngay lập tức
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Dùng capture phase (true) để luôn bắt được phím Escape ở cấp cao nhất
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("mouseup", handleWindowMouseUp, true);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("mouseup", handleWindowMouseUp, true);
    };
  }, [isOpen]);

  return {
    isBackdropMouseDownRef,
    handleBackdropMouseDown,
    handleBackdropClick,
    handleStopPropagation,
    backdropProps: {
      onMouseDown: handleBackdropMouseDown,
      onClick: handleBackdropClick,
    },
    modalContentProps: {
      onClick: handleStopPropagation,
    },
  };
}
