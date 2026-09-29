import type { DocSignOptionType } from "../../types/tt25ChungTuTypes";

export interface ValidateDocTypeParams {
  /** Loại chứng từ người dùng đang chọn trên dropdown (hoặc 'CURRENT' nếu tự do) */
  selectedDocType: DocSignOptionType;
  /** Loại chứng từ nhận diện được từ nội dung tệp (XML hoặc Excel) */
  detectedType: DocSignOptionType | null | undefined;
  /** Nhãn định dạng tệp hiển thị trong thông báo lỗi ('XML' | 'Excel') */
  fileTypeLabel: "XML" | "Excel";
  /** Cờ kiểm tra tính hợp lệ (đối với Excel có thể chứa nhiều loại qua breakdown) */
  isMatched?: boolean;
}

export interface ValidateDocTypeResult {
  /** Loại chứng từ cần tự động cập nhật lên dropdown (nếu có) */
  nextDocTypeToSelect: DocSignOptionType | null;
}

/**
 * Hàm kiểm tra tính hợp lệ và tự động đồng bộ loại chứng từ khi tải file:
 * 
 * 1. KIỂM TRA TƯƠNG THÍCH (VALIDATION):
 *    - Nếu người dùng đang chọn một loại chứng từ cụ thể (khác 'CURRENT'):
 *      Bắt buộc tệp tải lên (XML hoặc Excel) phải đúng loại đó (hoặc có chứa loại đó).
 *      Nếu phát hiện tệp thuộc mẫu khác -> Ném Error để cảnh báo người dùng.
 * 
 * 2. TỰ ĐỘNG ĐỒNG BỘ (AUTO-SYNC):
 *    - Nếu người dùng đang ở chế độ tự do ('CURRENT'):
 *      Tự động nhận diện mẫu tệp và trả về `nextDocTypeToSelect` để cập nhật lại dropdown.
 * 
 * @param params Tham số đầu vào kiểm tra
 * @returns Kết quả kiểm tra gồm loại chứng từ cần cập nhật (nếu có)
 * @throws Error nếu tệp tải lên không khớp với loại chứng từ đã chọn trước đó
 */
export function validateAndResolveDocType({
  selectedDocType,
  detectedType,
  fileTypeLabel,
  isMatched = detectedType === selectedDocType,
}: ValidateDocTypeParams): ValidateDocTypeResult {
  // TH1: Người dùng đã chọn 1 loại chứng từ cụ thể -> Bắt buộc tệp phải khớp
  if (selectedDocType !== "CURRENT") {
    if (detectedType && !isMatched) {
      throw new Error(
        `Tệp ${fileTypeLabel} tải lên [${detectedType}] không khớp với loại chứng từ đã chọn [${selectedDocType}]. Vui lòng chọn lại loại chứng từ hoặc tải đúng tệp.`,
      );
    }
    return { nextDocTypeToSelect: null };
  }

  // TH2: Đang ở chế độ tự do (CURRENT) -> Tự động chuyển dropdown sang loại nhận diện được
  if (detectedType && detectedType !== "CURRENT") {
    return { nextDocTypeToSelect: detectedType };
  }

  return { nextDocTypeToSelect: null };
}
