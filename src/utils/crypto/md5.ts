/**
 * RFC 1321 MD5 Implementation on Uint8Array
 */
export function md5(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const origLen = bytes.length;
  // Pad message: append 0x80, then zeros, then 64-bit length in bits
  const bitLen = origLen * 8;
  const padLen = (origLen % 64 < 56) ? (56 - (origLen % 64)) : (120 - (origLen % 64));
  const totalLen = origLen + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes, 0);
  padded[origLen] = 0x80;

  // Append 64-bit bit length (little endian)
  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 8, bitLen >>> 0, true);
  view.setUint32(totalLen - 4, Math.floor(bitLen / 0x100000000), true);

  // Constants
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }
  const S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  for (let offset = 0; offset < totalLen; offset += 64) {
    const M = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      M[i] = view.getUint32(offset + i * 4, true);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | ((~B) & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | ((~D) & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | (~D));
        g = (7 * i) % 16;
      }

      const temp = D;
      D = C;
      C = B;
      const sum = (A + F + K[i] + M[g]) >>> 0;
      const rot = ((sum << S[i]) | (sum >>> (32 - S[i]))) >>> 0;
      B = (B + rot) >>> 0;
      A = temp;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const outView = new DataView(new ArrayBuffer(16));
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);

  const hexBytes = new Uint8Array(outView.buffer);
  let hex = '';
  for (let i = 0; i < 16; i++) {
    hex += hexBytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function formatBhxhPassword(rawPassword: string): string {
  if (!rawPassword) return '';
  const trimmed = rawPassword.trim();
  const isAlreadyMd5 = /^[a-fA-F0-9]{32}$/.test(trimmed);
  if (isAlreadyMd5) {
    return trimmed.toUpperCase();
  }
  return md5(trimmed).toUpperCase();
}
