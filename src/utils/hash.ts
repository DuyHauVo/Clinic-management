// ============================================================
// HASH - SHA-256 Base64 & Hex bằng Web Crypto (chuẩn W3C Web Cryptography API)
// Lưu ý: crypto.subtle khả dụng trên HTTPS & localhost (secure context)
// ============================================================

/**
 * Băm dữ liệu bằng SHA-256, trả về cả chuỗi Base64 và Hex.
 * Có xử lý chia chunk 0x8000 (32KB) để tránh tràn call stack với payload XML lớn.
 */
export async function sha256Full(
  text: string,
): Promise<{ base64: string; hex: string }> {
  const bytes = new TextEncoder().encode(text);
  const digestBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const view = new Uint8Array(digestBuffer);

  let binary = "";
  let hex = "";
  const chunkSize = 0x8000; // Tránh Maximum call stack size exceeded khi dữ liệu XML dài
  for (let i = 0; i < view.length; i += chunkSize) {
    binary += String.fromCharCode(...view.subarray(i, i + chunkSize));
  }
  for (let i = 0; i < view.length; i++) {
    hex += view[i].toString(16).padStart(2, "0");
  }

  return {
    base64: btoa(binary),
    hex,
  };
}

/**
 * Băm dữ liệu bằng SHA-256, trả về chuỗi base64 chuẩn
 * đúng định dạng yêu cầu của API signhash SmartCA
 * (vd: "y4ahlQA4RZxb1Fh7V6dfK84ga3nnEecSdroDx1LmLGE=").
 */
export async function sha256Base64(text: string): Promise<string> {
  const { base64 } = await sha256Full(text);
  return base64;
}

/**
 * Băm dữ liệu bằng SHA-256, trả về chuỗi Hexadecimal (64 ký tự thường)
 */
export async function sha256Hex(text: string): Promise<string> {
  const { hex } = await sha256Full(text);
  return hex;
}

/** Băm nhiều phần dữ liệu song song (async-parallel: 1 vòng await thay vì tuần tự) */
export async function sha256Base64Many(texts: string[]): Promise<string[]> {
  return Promise.all(texts.map((t) => sha256Base64(t)));
}
