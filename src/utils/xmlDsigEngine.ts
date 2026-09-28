// ============================================================
// XMLDSig ENGINE - Động cơ ký số XML theo chuẩn W3C XMLDSig
// & Đặc tả ký số VNPT SmartCA / Quyết định 130 / BHXH Việt Nam 2025
// ============================================================

import { sha256Full } from "./hash";
import {
  formatXmlSigningTime,
  buildSignatureBlock,
} from "./shared/excelXmlShared";

export { formatXmlSigningTime, buildSignatureBlock };

export interface XmlDSigParams {
  signatureId?: string;
  digestValue: string;
  signatureValue: string;
  rsaModulus?: string;
  rsaExponent?: string;
  subjectDN: string;
  x509Certificate: string;
  signingTime?: string;
  /** Định dạng ký số: 'standard' (QĐ 130) hoặc 'bhxh2025' (Phụ lục 02 BHXH 2025) */
  signatureFormat?: "standard" | "bhxh2025";
  /** Id của thẻ dữ liệu cần trỏ tới (ví dụ: Id của <THONGTINHOSO>, <GIAYBAOTU>, <GIAYCHUNGSINH>) */
  targetDataId?: string;
  /** Mã băm SHA-256 của thẻ <Object> (nếu dùng format bhxh2025) */
  objectDigestValue?: string;
}

export interface ExtractedSignatureInfo {
  hasSignature: boolean;
  signatureId?: string;
  digestValue?: string;
  signatureValue?: string;
  subjectDN?: string;
  serialNumber?: string;
  signingTime?: string;
  targetDataId?: string;
  /** Danh sách tất cả các chữ ký trong tài liệu (hỗ trợ Countersign / Đa chữ ký) */
  signatures?: ExtractedSignatureInfo[];
  signatureCount?: number;
}

export interface CanonicalizeOptions {
  excludeSignatureId?: string;
  preserveOtherSignatures?: boolean;
}

export function canonicalizeForDigest(
  xml: string,
  options?: CanonicalizeOptions | string,
): string {
  if (!xml) return "";
  const opts: CanonicalizeOptions =
    typeof options === "string"
      ? { excludeSignatureId: options, preserveOtherSignatures: true }
      : options || {};

  if (opts.preserveOtherSignatures) {
    if (opts.excludeSignatureId) {
      const targetSigRegex = new RegExp(
        `<Signature\\s+[^>]*Id="${opts.excludeSignatureId}"[\\s\\S]*?<\\/Signature>\\s*`,
        "gi",
      );
      let res = xml.replace(targetSigRegex, "");
      // Nếu CHUKYDONVI trống rỗng sau khi bỏ chữ ký này, đưa về dạng self-closing
      res = res.replace(/<CHUKYDONVI>\s*<\/CHUKYDONVI>/gi, "<CHUKYDONVI />");
      return res;
    }
    return xml.replace(/<CHUKYDONVI>\s*<\/CHUKYDONVI>/gi, "<CHUKYDONVI />");
  }

  // Mặc định: loại bỏ toàn bộ khối chữ ký để băm tài liệu gốc chưa ký
  let res = xml.replace(
    /<CHUKYDONVI>[\s\S]*?<\/CHUKYDONVI>/gi,
    "<CHUKYDONVI />",
  );
  res = res.replace(/<CHUKYDONVI\s*\/>/gi, "<CHUKYDONVI />");
  return res;
}

/**
 * Băm SHA-256 nội dung XML gốc (loại trừ thẻ CHUKYDONVI hoặc chữ ký tương ứng nếu đã có)
 * Trả về chuỗi DigestValue Base64 và mã Hex để hiển thị.
 */
export async function computeXmlDigest(
  rawXml: string,
  options?: CanonicalizeOptions | string,
): Promise<{ digestValue: string; hexDigest: string }> {
  const cleanXml = canonicalizeForDigest(rawXml, options);
  const { base64, hex } = await sha256Full(cleanXml);
  return { digestValue: base64, hexDigest: hex };
}

/**
 * Tạo khối <Signature> chuẩn W3C XMLDSig theo đặc tả VNPT SmartCA / QĐ 130 / BHXH 2025
 */
export function buildXmlDSigBlock(
  params: XmlDSigParams,
  indent = "  ",
): string {
  const isBhxh2025 =
    params.signatureFormat === "bhxh2025" || Boolean(params.targetDataId);
  const rawId =
    params.targetDataId || params.signatureId || `Id-${crypto.randomUUID()}`;
  const cleanId = rawId.startsWith("Id-") ? rawId : `Id-${rawId}`;
  const signatureId = `CHUKYDONVI-${cleanId}`;
  const objectId = `Object-${signatureId}`;
  const sigPropId = `SignatureProperty-${signatureId}`;
  const signingTime = params.signingTime || formatXmlSigningTime();

  const rsaModulus = params.rsaModulus;
  const rsaExponent = params.rsaExponent || "AQAB";

  if (!isBhxh2025 && !rsaModulus) {
    throw new Error(
      "Lỗi ký số XMLDSig: Thiếu thông tin RSA Modulus từ chứng thư số.",
    );
  }

  // --- A. CHUẨN BHXH 2025 (Phụ lục 02 - 2 References + Object SigningTime) --- Dùng cho Từng Chứng Từ Y Tế Cụ Thể
  if (isBhxh2025) {
    const objectHash = params.objectDigestValue || params.digestValue; // Mock/fallback hash nếu chưa băm riêng Object

    return `${indent}  <Signature Id="${signatureId}" xmlns="http://www.w3.org/2000/09/xmldsig#">
${indent}    <SignedInfo>
${indent}      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
${indent}      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" />
${indent}      <Reference URI="#${objectId}">
${indent}        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
${indent}        <DigestValue>${objectHash}</DigestValue>
${indent}      </Reference>
${indent}      <Reference URI="#${cleanId}">
${indent}        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
${indent}        <DigestValue>${params.digestValue}</DigestValue>
${indent}      </Reference>
${indent}    </SignedInfo>
${indent}    <SignatureValue>${params.signatureValue}</SignatureValue>
${indent}    <KeyInfo>
${indent}      <X509Data>
${indent}        <X509SubjectName>${params.subjectDN}</X509SubjectName>
${indent}        <X509Certificate>${params.x509Certificate}</X509Certificate>
${indent}      </X509Data>
${indent}    </KeyInfo>
${indent}    <Object Id="${objectId}">
${indent}      <SignatureProperties xmlns="">
${indent}        <SignatureProperty Target="#${signatureId}" Id="${sigPropId}">
${indent}          <SigningTime>${signingTime}</SigningTime>
${indent}        </SignatureProperty>
${indent}      </SignatureProperties>
${indent}    </Object>
${indent}  </Signature>`;
  }

  // --- B. CHUẨN W3C XMLDSig THÔNG THƯỜNG (QĐ 130 / Danh mục BHYT) --- Dùng cho Gói Dữ Liệu Thanh Toán BHYT & Danh Mục
  const standardSigId =
    params.signatureId || `Signature-${crypto.randomUUID()}`;
  return `${indent}  <Signature Id="${standardSigId}" xmlns="http://www.w3.org/2000/09/xmldsig#">
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

export interface InjectSignatureOptions {
  mode?: "append" | "replace";
  targetSignatureId?: string;
}

/**
 * Thay thế hoặc chèn khối <Signature> vào tài liệu XML.
 * Hỗ trợ đồng ký / Countersign: Mặc định bảo toàn các chữ ký đã có trước đó trong <CHUKYDONVI>.
 */
export function injectSignatureToXml(
  rawXml: string,
  signatureBlockOrParams: string | XmlDSigParams,
  options?: InjectSignatureOptions,
): string {
  const signatureXml =
    typeof signatureBlockOrParams === "string"
      ? signatureBlockOrParams
      : buildXmlDSigBlock(signatureBlockOrParams, "  ");

  const opts = options || {};
  const sigIdMatch = signatureXml.match(/<Signature\s+[^>]*Id="([^"]+)"/i);
  const targetId = opts.targetSignatureId || sigIdMatch?.[1];

  const chuKyDonViFullRegex = /<CHUKYDONVI>([\s\S]*?)<\/CHUKYDONVI>/i;
  const chuKyDonViSelfClosingRegex = /<CHUKYDONVI\s*\/>/i;

  // Trường hợp 1: XML đã có thẻ <CHUKYDONVI>...</CHUKYDONVI>
  if (chuKyDonViFullRegex.test(rawXml)) {
    const match = rawXml.match(chuKyDonViFullRegex);
    const innerContent = match ? match[1] : "";

    if (opts.mode === "replace") {
      if (opts.targetSignatureId) {
        const singleSigRegex = new RegExp(
          `<Signature\\s+[^>]*Id="${opts.targetSignatureId}"[\\s\\S]*?<\\/Signature>`,
          "i",
        );
        if (singleSigRegex.test(innerContent)) {
          const newInner = innerContent.replace(singleSigRegex, signatureXml);
          return rawXml.replace(
            chuKyDonViFullRegex,
            `<CHUKYDONVI>\n${newInner.trim()}\n</CHUKYDONVI>`,
          );
        }
      }
      return rawXml.replace(
        chuKyDonViFullRegex,
        `<CHUKYDONVI>\n  ${signatureXml.trim()}\n</CHUKYDONVI>`,
      );
    }

    // Mặc định: Chế độ Append / Countersign bảo toàn các chữ ký hiện có
    if (!innerContent.trim()) {
      return rawXml.replace(
        chuKyDonViFullRegex,
        `<CHUKYDONVI>\n  ${signatureXml.trim()}\n</CHUKYDONVI>`,
      );
    }

    // Nếu chữ ký cùng Id đã tồn tại thì cập nhật chữ ký đó
    if (targetId) {
      const existingSameIdRegex = new RegExp(
        `<Signature\\s+[^>]*Id="${targetId}"[\\s\\S]*?<\\/Signature>`,
        "i",
      );
      if (existingSameIdRegex.test(innerContent)) {
        const newInner = innerContent.replace(
          existingSameIdRegex,
          signatureXml.trim(),
        );
        return rawXml.replace(
          chuKyDonViFullRegex,
          `<CHUKYDONVI>\n${newInner.trim()}\n</CHUKYDONVI>`,
        );
      }
    }

    // Nối tiếp chữ ký mới vào danh sách chữ ký bên trong thẻ <CHUKYDONVI>
    const updatedInner = `${innerContent.trim()}\n  ${signatureXml.trim()}`;
    return rawXml.replace(
      chuKyDonViFullRegex,
      `<CHUKYDONVI>\n  ${updatedInner}\n</CHUKYDONVI>`,
    );
  }

  // Trường hợp 2: XML có thẻ đóng <CHUKYDONVI /> tự đóng
  if (chuKyDonViSelfClosingRegex.test(rawXml)) {
    return rawXml.replace(
      chuKyDonViSelfClosingRegex,
      `<CHUKYDONVI>\n  ${signatureXml.trim()}\n</CHUKYDONVI>`,
    );
  }

  // Trường hợp 3: Chèn trước thẻ đóng của root element (vd: </HSDANHMUC>, </HSTH01BH>, </HSCHUNGTU>, </HSDLGBT>, </HSDLGCS>)
  const rootCloseRegex =
    /(\n?\s*<\/(HSDANHMUC|HSTH01BH|HSDIEUCHINH09BH|HSCHUNGTU|HSDLGBT|HSDLGCS|[A-Za-z0-9_]+)>)$/i;
  if (rootCloseRegex.test(rawXml.trim())) {
    return rawXml
      .trim()
      .replace(
        rootCloseRegex,
        `\n<CHUKYDONVI>\n  ${signatureXml.trim()}\n</CHUKYDONVI>$1`,
      );
  }

  // Fallback: Nối vào cuối XML
  return `${rawXml}\n<CHUKYDONVI>\n  ${signatureXml.trim()}\n</CHUKYDONVI>`;
}

/**
 * Gỡ bỏ chữ ký. Nếu truyền targetSigId thì chỉ xóa chữ ký tương ứng và giữ nguyên các chữ ký khác;
 * nếu không truyền thì đưa thẻ <CHUKYDONVI> về rỗng chuẩn hóa.
 */
export function removeSignatureFromXml(
  xml: string,
  targetSigId?: string,
): string {
  if (targetSigId) {
    return canonicalizeForDigest(xml, {
      excludeSignatureId: targetSigId,
      preserveOtherSignatures: true,
    });
  }
  return canonicalizeForDigest(xml);
}

/**
 * Trích xuất danh sách tất cả các chữ ký có trong tài liệu XML (hỗ trợ đồng ký Countersign)
 */
export function extractXmlSignatures(xml: string): ExtractedSignatureInfo[] {
  if (!xml) return [];

  const sigRegex = /<Signature[\s\S]*?<\/Signature>/gi;
  const matches = xml.match(sigRegex);
  if (!matches || matches.length === 0) return [];

  return matches.map((sigContent) => {
    const sigIdMatch = sigContent.match(/<Signature\s+[^>]*Id="([^"]+)"/i);
    const digestMatch = sigContent.match(/<DigestValue>([^<]+)<\/DigestValue>/i);
    const sigValMatch = sigContent.match(
      /<SignatureValue>([^<]+)<\/SignatureValue>/i,
    );
    const subjectMatch = sigContent.match(
      /<X509SubjectName>([^<]+)<\/X509SubjectName>/i,
    );
    const signingTimeMatch = sigContent.match(
      /<SigningTime>([^<]+)<\/SigningTime>/i,
    );
    const refMatch = sigContent.match(/<Reference\s+URI="#?([^"]*)"/i);

    let serialNumber: string | undefined;
    if (subjectMatch?.[1]) {
      const snMatch = subjectMatch[1].match(
        /MST:([0-9]+)|UID=([A-Za-z0-9_]+)/i,
      );
      if (snMatch) {
        serialNumber = `SMARTCA_${snMatch[1] || snMatch[2]}`;
      }
    }

    return {
      hasSignature: true,
      signatureId: sigIdMatch?.[1],
      digestValue: digestMatch?.[1]?.trim(),
      signatureValue: sigValMatch?.[1]?.trim(),
      subjectDN: subjectMatch?.[1]?.trim(),
      serialNumber,
      signingTime: signingTimeMatch?.[1]?.trim(),
      targetDataId: refMatch?.[1]?.startsWith("Object-") ? undefined : refMatch?.[1],
    };
  });
}

/**
 * Trích xuất thông tin chữ ký từ tài liệu XML đã ký (trả về chữ ký chính kèm danh sách toàn bộ chữ ký)
 */
export function extractXmlSignature(xml: string): ExtractedSignatureInfo {
  const allSigs = extractXmlSignatures(xml);
  if (allSigs.length === 0) {
    return { hasSignature: false, signatures: [], signatureCount: 0 };
  }

  // Chữ ký chính là chữ ký mới nhất (cuối cùng)
  const primary = allSigs[allSigs.length - 1];
  return {
    ...primary,
    signatures: allSigs,
    signatureCount: allSigs.length,
  };
}
