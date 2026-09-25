// ============================================================
// XMLDSig ENGINE - Động cơ ký số XML theo chuẩn W3C XMLDSig
// & Đặc tả ký số VNPT SmartCA cho Hồ sơ BHYT / Quyết định 130
//
// Đóng gói cấu trúc:
// <CHUKYDONVI>
//   <Signature Id="..." xmlns="http://www.w3.org/2000/09/xmldsig#">
//     <SignedInfo>...</SignedInfo>
//     <SignatureValue>...</SignatureValue>
//     <KeyInfo>
//       <KeyValue><RSAKeyValue>...</RSAKeyValue></KeyValue>
//       <X509Data><X509SubjectName>...</X509SubjectName><X509Certificate>...</X509Certificate></X509Data>
//     </KeyInfo>
//   </Signature>
// </CHUKYDONVI>
// ============================================================

import { sha256Full } from "./hash";

export interface XmlDSigParams {
  signatureId?: string;
  digestValue: string;
  signatureValue: string;
  rsaModulus?: string;
  rsaExponent?: string;
  subjectDN: string;
  x509Certificate: string;
  signingTime?: string;
}

export interface ExtractedSignatureInfo {
  hasSignature: boolean;
  signatureId?: string;
  digestValue?: string;
  signatureValue?: string;
  subjectDN?: string;
  serialNumber?: string;
  signingTime?: string;
}

/**
 * Băm SHA-256 nội dung XML gốc (loại trừ thẻ CHUKYDONVI nếu đã có)
 * Trả về chuỗi DigestValue Base64 và mã Hex để hiển thị.
 * Tái sử dụng trực tiếp hàm băm tập trung sha256Full từ utils/hash (DRY).
 */
export async function computeXmlDigest(
  rawXml: string,
): Promise<{ digestValue: string; hexDigest: string }> {
  // Chuẩn hóa: nếu XML đã có thẻ CHUKYDONVI cũ thì tạm đưa về dạng rỗng để tính Digest
  const cleanXml = removeSignatureFromXml(rawXml);
  const { base64, hex } = await sha256Full(cleanXml);
  return { digestValue: base64, hexDigest: hex };
}

/**
 * Tạo khối <Signature> chuẩn W3C XMLDSig theo đặc tả VNPT SmartCA (có thụt dòng rõ ràng, chuẩn đẹp)
 */
export function buildXmlDSigBlock(
  params: XmlDSigParams,
  indent = "  ",
): string {
  const signatureId = params.signatureId || crypto.randomUUID();
  const rsaModulus =
    params.rsaModulus ||
    "4NWTrzr5oAN9FKXJQ0VsQ2ipkistUWEawJCYxTWByu6kHv/uKoeDtXjLtccxpYPon18qvaoKQCbMSeREaoUZAR3gQ/gFVTIT9YofGsMkHvntOK/Jw3lXXHmBjY+brc38FJavZTlfK3vtH3fMgMxQkDKeueuvSQmroYalnMdplQ/Nw2XE/RozuezUJpMEoCiw03tUjS78yPKitp432yWLNxVhYcEsvR22gNYnYDL+0xCchwBaHCAZglyN1ejdf2qpSa2r1qhNGuFz29Ug0hydvwGRn3hN8H3ogVoATsm8etTnffQf7L4jVPQyh5zy+h7dr3YUZx0DZbulmpN9j9y27Q==";
  const rsaExponent = params.rsaExponent || "AQAB";

  return `${indent}  <Signature Id="${signatureId}" xmlns="http://www.w3.org/2000/09/xmldsig#">
${indent}    <SignedInfo>
${indent}      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
${indent}      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" />
${indent}      <Reference URI="">
${indent}        <Transforms>
${indent}          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature" />
${indent}        </Transforms>
${indent}        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
${indent}        <DigestValue>${params.digestValue}</DigestValue>
${indent}      </Reference>
${indent}    </SignedInfo>
${indent}    <SignatureValue>${params.signatureValue}</SignatureValue>
${indent}    <KeyInfo>
${indent}      <KeyValue>
${indent}        <RSAKeyValue xmlns="http://www.w3.org/2000/09/xmldsig#">
${indent}          <Modulus>${rsaModulus}</Modulus>
${indent}          <Exponent>${rsaExponent}</Exponent>
${indent}        </RSAKeyValue>
${indent}      </KeyValue>
${indent}      <X509Data>
${indent}        <X509SubjectName>${params.subjectDN}</X509SubjectName>
${indent}        <X509Certificate>${params.x509Certificate}</X509Certificate>
${indent}      </X509Data>
${indent}    </KeyInfo>
${indent}  </Signature>`;
}

import { buildSignatureBlock } from "./shared/excelXmlShared";

export { buildSignatureBlock };

/**
 * Thay thế hoặc chèn khối <CHUKYDONVI> vào tài liệu XML
 */
export function injectSignatureToXml(
  rawXml: string,
  signatureBlockOrParams: string | XmlDSigParams,
): string {
  const signatureXml =
    typeof signatureBlockOrParams === "string"
      ? signatureBlockOrParams
      : buildXmlDSigBlock(signatureBlockOrParams, "  ");

  const fullChuKyDonVi = buildSignatureBlock(signatureXml, "  ");

  // Trường hợp 1: XML đã có thẻ <CHUKYDONVI>...</CHUKYDONVI>
  const chuKyDonViRegex = /<CHUKYDONVI>[\s\S]*?<\/CHUKYDONVI>/i;
  if (chuKyDonViRegex.test(rawXml)) {
    return rawXml.replace(chuKyDonViRegex, fullChuKyDonVi);
  }

  // Trường hợp 2: XML có thẻ đóng <CHUKYDONVI /> tự đóng
  const chuKyDonViSelfClosingRegex = /<CHUKYDONVI\s*\/>/i;
  if (chuKyDonViSelfClosingRegex.test(rawXml)) {
    return rawXml.replace(chuKyDonViSelfClosingRegex, fullChuKyDonVi);
  }

  // Trường hợp 3: Chèn trước thẻ đóng của root element (vd: </HSDANHMUC> hoặc </HSTH01BH> hoặc </HSDIEUCHINH09BH>)
  const rootCloseRegex =
    /(\n?\s*<\/(HSDANHMUC|HSTH01BH|HSDIEUCHINH09BH|[A-Za-z0-9_]+)>)$/i;
  if (rootCloseRegex.test(rawXml.trim())) {
    return rawXml.trim().replace(rootCloseRegex, `\n${fullChuKyDonVi}$1`);
  }

  // Fallback: Nối vào cuối XML
  return `${rawXml}\n${fullChuKyDonVi}`;
}

/**
 * Gỡ bỏ chữ ký, đưa thẻ <CHUKYDONVI> về rỗng
 */
export function removeSignatureFromXml(xml: string): string {
  const chuKyDonViRegex = /<CHUKYDONVI>[\s\S]*?<\/CHUKYDONVI>/gi;
  if (chuKyDonViRegex.test(xml)) {
    return xml.replace(chuKyDonViRegex, "<CHUKYDONVI></CHUKYDONVI>");
  }
  return xml;
}

/**
 * Kiểm tra và trích xuất thông tin chứng thư số từ XML đã ký
 */
export function extractXmlSignature(xml: string): ExtractedSignatureInfo {
  if (!xml || !xml.includes("<Signature")) {
    return { hasSignature: false };
  }

  try {
    const sigIdMatch = xml.match(/<Signature\s+Id="([^"]+)"/i);
    const digestMatch = xml.match(/<DigestValue>([^<]+)<\/DigestValue>/i);
    const sigValueMatch = xml.match(
      /<SignatureValue>([^<]+)<\/SignatureValue>/i,
    );
    const subjectMatch = xml.match(
      /<X509SubjectName>([^<]+)<\/X509SubjectName>/i,
    );

    let serialNumber: string | undefined;
    if (subjectMatch && subjectMatch[1]) {
      const serialMatch = subjectMatch[1].match(
        /(?:MST|SERIAL|CN)[:=]([^,]+)/i,
      );
      if (serialMatch) {
        serialNumber = serialMatch[1].trim();
      }
    }

    return {
      hasSignature: Boolean(sigValueMatch && sigValueMatch[1]),
      signatureId: sigIdMatch ? sigIdMatch[1] : undefined,
      digestValue: digestMatch ? digestMatch[1] : undefined,
      signatureValue: sigValueMatch ? sigValueMatch[1] : undefined,
      subjectDN: subjectMatch ? subjectMatch[1] : undefined,
      serialNumber,
    };
  } catch {
    return { hasSignature: false };
  }
}
