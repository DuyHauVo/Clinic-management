import React, { useState, useMemo } from "react";
import { SmartCaErrorModal } from "./ErrorModal";
import { extractXmlSignature } from "../../utils/xmlDsigEngine";
import { useSmartCaSignQ1 } from "../../hooks/useSmartCaSignQ1";
import type { DocSignOptionType } from "../../types/tt25ChungTuTypes";
import { downloadXmlFile } from "../../utils/shared";
import {
  DocTypeSelector,
  XmlPreviewModal,
  DigestInfoCard,
  SignedResultView,
  WaitingApprovalView,
  SignerForm,
} from "./smartca";
import type { SignerProfile } from "../../types/smartcaTypes";
import type { SmartCaSignResponse } from "../../services/smartca/smartcaHandlers";

import type { SourceFileUploadInfo } from "./XmlExportModal";

export interface SmartCaSignPanelProps {
  xmlContent: string;
  signedXml?: string;
  fileName: string;
  itemsCount?: number;
  itemLabel?: string;
  signers?: SignerProfile[];
  signatureInfo?: ReturnType<typeof extractXmlSignature>;
  sourceFileInfo?: SourceFileUploadInfo | null;
  onSignedSuccess: (
    signedXml: string,
    signResponse: SmartCaSignResponse,
  ) => void;
  onResetSignature: () => void;
  onDownloadSignedXml?: () => void;
  onViewXml?: () => void;
}

export const SmartCaSignPanel: React.FC<SmartCaSignPanelProps> = ({
  xmlContent,
  signedXml,
  fileName,
  itemsCount,
  itemLabel = "bản ghi",
  signatureInfo: externalSignatureInfo,
  sourceFileInfo,
  onSignedSuccess,
  onResetSignature,
  onDownloadSignedXml,
  onViewXml,
}) => {
  // 1. Quản lý trạng thái chọn loại hồ sơ / chứng từ
  const [selectedDocType, setSelectedDocType] =
    useState<DocSignOptionType>("CURRENT");
  const [showXmlPreview, setShowXmlPreview] = useState(false);

  // State nạp file từ máy tính
  const [uploadedCustomXml, setUploadedCustomXml] = useState<string | null>(
    null,
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // 2. Tính toán XML hiệu lực cần ký (chỉ có khi đã nạp file hoặc có dữ liệu thực tế)
  const effectiveXmlToSign = useMemo(() => {
    if (uploadedCustomXml) return uploadedCustomXml;
    if (selectedDocType === "CURRENT") return xmlContent || signedXml || "";
    return "";
  }, [selectedDocType, xmlContent, uploadedCustomXml, signedXml]);

  // State ký nối tiếp (Countersign)
  const [isCountersigning, setIsCountersigning] = useState(false);

  // Tên file hiệu lực hiển thị (ưu tiên file tải lên, sau đó fileName từ props hoặc template)
  const effectiveFileName = useMemo(() => {
    if (uploadedFileName) {
      return `${uploadedFileName.replace(/\.[^/.]+$/, "")}.xml`;
    }
    if (selectedDocType === "CURRENT" && fileName) {
      return fileName;
    }
    if (uploadedCustomXml) {
      return `${selectedDocType}_TaiLen.xml`;
    }
    return "";
  }, [uploadedFileName, fileName, selectedDocType, uploadedCustomXml]);

  // XML đưa vào quy trình ký: nếu đang ở chế độ đồng ký thì ký tiếp trên bản đã có chữ ký
  const actualXmlForHook = useMemo(() => {
    if (isCountersigning && (signedXml || effectiveXmlToSign)) {
      return signedXml || effectiveXmlToSign;
    }
    return effectiveXmlToSign;
  }, [isCountersigning, signedXml, effectiveXmlToSign]);

  // Trích xuất chữ ký số nếu đã ký
  const signatureInfo = useMemo(() => {
    if (!uploadedCustomXml && selectedDocType === "CURRENT" && externalSignatureInfo) {
      return externalSignatureInfo;
    }
    return extractXmlSignature(signedXml || effectiveXmlToSign);
  }, [uploadedCustomXml, selectedDocType, externalSignatureInfo, signedXml, effectiveXmlToSign]);

  const isSigned = signatureInfo.hasSignature && !isCountersigning;

  // 3. Custom Hook quản lý toàn bộ quy trình ký Q1
  const {
    credential,
    config,
    signerName,
    setSignerName,
    signerEmail,
    setSignerEmail,
    idType,
    identityValue,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isInitiating,
    waitingTransaction,
    countdown,
    authErrorModalData,
    digestInfo,
    copiedKey,
    handleCopy,
    handleIdentityChange,
    handleSelectIdType,
    handleCloseAuthErrorModal,
    handleCancelWaiting,
    handleResetAndResign,
    handleInitiateQ1Sign,
    handleCheckNow,
    formatCountdown,
  } = useSmartCaSignQ1({
    effectiveXmlToSign: actualXmlForHook,
    effectiveFileName,
    isSigned,
    onSignedSuccess: (newSignedXml, res) => {
      setIsCountersigning(false);
      onSignedSuccess(newSignedXml, res);
    },
    onResetSignature: () => {
      setIsCountersigning(false);
      onResetSignature?.();
    },
  });

  const handleDefaultDownloadSignedXml = () => {
    const content = signedXml || effectiveXmlToSign;
    if (!content) return;
    downloadXmlFile(content, effectiveFileName || "Signed_Document.xml");
  };

  return (
    <div className="space-y-4">
      {/* 1. Khối chọn loại hồ sơ & Nạp file Excel / XML */}
      <DocTypeSelector
        fileName={fileName}
        itemsCount={itemsCount}
        itemLabel={itemLabel}
        selectedDocType={selectedDocType}
        isSigned={isSigned}
        hasFile={Boolean(effectiveXmlToSign)}
        sourceFileInfo={sourceFileInfo}
        onSelectDocType={(type) => {
          setSelectedDocType(type);
          if (isSigned) onResetSignature();
        }}
        onUploadedFileParsed={({ xmlContent: parsedXml, fileName: name }) => {
          setUploadedCustomXml(parsedXml);
          setUploadedFileName(name);
          if (isSigned) onResetSignature();
        }}
        onClearUploaded={() => {
          setUploadedCustomXml(null);
          setUploadedFileName(null);
          if (isSigned) onResetSignature();
        }}
        onOpenPreviewXml={() => {
          if (onViewXml) {
            onViewXml();
          } else {
            setShowXmlPreview(true);
          }
        }}
      />

      {/* Modal Popup Xem Trước Cấu Trúc XML */}
      <XmlPreviewModal
        isOpen={showXmlPreview}
        onClose={() => setShowXmlPreview(false)}
        fileName={effectiveFileName || `${selectedDocType}_Template.xml`}
        xmlContent={isSigned && signedXml ? signedXml : effectiveXmlToSign}
        copiedKey={copiedKey}
        onCopy={handleCopy}
        isSigned={isSigned}
      />

      {/* 2. Thẻ hiển thị tệp tin & Mã băm SHA-256 DigestValue */}
      <DigestInfoCard
        effectiveFileName={effectiveFileName}
        isSigned={isSigned}
        isWaiting={Boolean(waitingTransaction)}
        digestValue={
          isSigned ? signatureInfo.digestValue : digestInfo?.digestValue
        }
        copiedKey={copiedKey}
        onCopyDigest={(digest) => handleCopy(digest, "digest")}
      />

      {/* 3. Hiển thị tương ứng: Đã ký / Chờ App phê duyệt / Form nhập liệu */}
      {isSigned ? (
        <SignedResultView
          signatureInfo={signatureInfo}
          credential={credential}
          signerName={signerName}
          identityValue={identityValue}
          signerEmail={signerEmail}
          copiedKey={copiedKey}
          onCopySignedXml={() =>
            handleCopy(signedXml || effectiveXmlToSign, "signedXml")
          }
          onDownloadSignedXml={
            onDownloadSignedXml || handleDefaultDownloadSignedXml
          }
          onResetAndResign={handleResetAndResign}
          onCountersign={() => setIsCountersigning(true)}
        />
      ) : waitingTransaction ? (
        <WaitingApprovalView
          config={config}
          waitingTransaction={waitingTransaction}
          countdown={countdown}
          formatCountdown={formatCountdown}
          identityValue={identityValue}
          idType={idType}
          effectiveFileName={effectiveFileName}
          copiedKey={copiedKey}
          onCopyTranId={() => handleCopy(waitingTransaction.tranId, "tranId")}
          onCheckNow={handleCheckNow}
          onCancelWaiting={handleCancelWaiting}
        />
      ) : (
        <div className="space-y-3">
          {isCountersigning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
              <div>
                <b>Chế độ Đồng ký (Countersign):</b> Đang thêm chữ ký tiếp theo
                (Thủ trưởng đơn vị / Cơ sở KCB). Chữ ký trước đó được bảo toàn.
              </div>
              <button
                type="button"
                onClick={() => setIsCountersigning(false)}
                className="text-amber-700 hover:text-amber-950 underline font-bold text-xs ml-3 shrink-0 cursor-pointer"
              >
                Hủy đồng ký
              </button>
            </div>
          )}
          <SignerForm
            config={config}
            signerName={signerName}
            setSignerName={setSignerName}
            signerEmail={signerEmail}
            setSignerEmail={setSignerEmail}
            idType={idType}
            identityValue={identityValue}
            onIdentityChange={handleIdentityChange}
            onSelectIdType={handleSelectIdType}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isInitiating={isInitiating}
            onInitiateSign={handleInitiateQ1Sign}
          />
        </div>
      )}

      {/* Error Modal khi kết nối VNPT thật gặp lỗi */}
      <SmartCaErrorModal
        isOpen={authErrorModalData.isOpen}
        onClose={handleCloseAuthErrorModal}
        errorMessage={authErrorModalData.errorMessage}
        env={config.env}
        clientId={config.clientId}
        username={identityValue}
      />
    </div>
  );
};
