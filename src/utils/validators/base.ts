/**
 * Core validation engine types & runner
 */

export type ValidationRule<T> = [
  isInvalid: (data: T) => boolean,
  errorMessage: string
];

/**
 * Chạy danh sách các quy tắc kiểm tra tính hợp lệ và trả về mảng danh sách các lỗi phát hiện được.
 */
export function runValidationRules<T>(data: T, rules: ValidationRule<T>[]): string[] {
  const errors: string[] = [];
  for (const [isInvalid, message] of rules) {
    if (isInvalid(data)) {
      errors.push(message);
    }
  }
  return errors;
}
