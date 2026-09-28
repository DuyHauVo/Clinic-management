/**
 * ============================================================
 * IDENTITY VALIDATORS & SANITIZERS
 * Quản lý quy tắc kiểm tra & giới hạn dữ liệu định danh:
 * - Số Điện Thoại (SĐT): 10 số (bắt đầu bằng 0)
 * - Số CCCD: 12 số
 * - Mã Số Thuế (MST): 10 số, 13 số hoặc 10 số kèm mã nhánh 3 số (vd: 0100109106-001)
 * - Địa chỉ Email
 * ============================================================
 */

export type IdentityType = "phone" | "cccd" | "mst";

export const IDENTITY_LIMITS: Record<IdentityType, number> = {
  phone: 10,
  cccd: 12,
  mst: 14,
};

export const IDENTITY_LABELS: Record<IdentityType, string> = {
  phone: "Số Điện Thoại",
  cccd: "Số CCCD",
  mst: "Mã Số Thuế (MST)",
};

export const IDENTITY_DESCRIPTIONS: Record<IdentityType, string> = {
  phone: "Đúng 10 chữ số (bắt đầu bằng 0)",
  cccd: "Đúng 12 chữ số định danh công dân",
  mst: "10 hoặc 13-14 ký tự (DN / Cơ sở KCB)",
};

export const IDENTITY_PLACEHOLDERS: Record<IdentityType, string> = {
  phone: "Nhập số điện thoại đăng ký SmartCA (VD: 0912345678)",
  cccd: "Nhập 12 chữ số CCCD (VD: 001085001234)",
  mst: "Nhập mã số thuế doanh nghiệp / đơn vị (VD: 4001266514)",
};

export const REGEX_PHONE = /^0[0-9]{9}$/;
export const REGEX_CCCD = /^[0-9]{12}$/;
export const REGEX_MST = /^[0-9]{10}(-[0-9]{3})?$|^[0-9]{13}$/;
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Lọc và giới hạn độ dài ký tự nhập cho từng loại định danh
 */
export function sanitizeIdentityInput(value: string, type: IdentityType): string {
  const limit = IDENTITY_LIMITS[type];
  if (type === "mst") {
    // MST cho phép số và dấu gạch nối chi nhánh
    return value.replace(/[^0-9-]/g, "").slice(0, limit);
  }
  // SĐT & CCCD chỉ cho phép chữ số
  return value.replace(/[^0-9]/g, "").slice(0, limit);
}

/**
 * Kiểm tra tính hợp lệ của Số điện thoại
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  const val = phone.trim();
  if (!val) {
    return { isValid: false, error: "Vui lòng nhập số điện thoại" };
  }
  if (!REGEX_PHONE.test(val)) {
    return {
      isValid: false,
      error: "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng 0).",
    };
  }
  return { isValid: true };
}

/**
 * Kiểm tra tính hợp lệ của Số CCCD
 */
export function validateCccd(cccd: string): { isValid: boolean; error?: string } {
  const val = cccd.trim();
  if (!val) {
    return { isValid: false, error: "Vui lòng nhập số CCCD" };
  }
  if (!REGEX_CCCD.test(val)) {
    return {
      isValid: false,
      error: "Số CCCD không hợp lệ! Vui lòng nhập đúng 12 chữ số.",
    };
  }
  return { isValid: true };
}

/**
 * Kiểm tra tính hợp lệ của Mã số thuế
 */
export function validateMst(mst: string): { isValid: boolean; error?: string } {
  const val = mst.trim();
  if (!val) {
    return { isValid: false, error: "Vui lòng nhập mã số thuế" };
  }
  if (!REGEX_MST.test(val)) {
    return {
      isValid: false,
      error: "Mã số thuế (MST) không hợp lệ! Vui lòng nhập 10 hoặc 13 chữ số (VD: 4001266514).",
    };
  }
  return { isValid: true };
}

/**
 * Kiểm tra tính hợp lệ của định danh tùy theo loại
 */
export function validateIdentity(
  value: string,
  type: IdentityType
): { isValid: boolean; error?: string } {
  switch (type) {
    case "phone":
      return validatePhone(value);
    case "cccd":
      return validateCccd(value);
    case "mst":
      return validateMst(value);
    default:
      return { isValid: false, error: "Loại định danh không hợp lệ" };
  }
}

/**
 * Kiểm tra định dạng Email
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const val = email.trim();
  if (!val) return { isValid: true }; // Email là tùy chọn nếu rỗng
  if (!REGEX_EMAIL.test(val)) {
    return {
      isValid: false,
      error: "Địa chỉ Email không hợp lệ! Vui lòng kiểm tra lại định dạng email.",
    };
  }
  return { isValid: true };
}
