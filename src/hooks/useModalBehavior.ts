import { useEffect, useRef } from "react";

/**
 * Hook xử lý hành vi chuẩn cho Modal:
 * 1. Đóng modal khi bấm phím Escape (sử dụng Capture Phase để không bị nuốt sự kiện)
 * 2. Khóa cuộn trang (body scroll lock) khi modal đang mở
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
}

