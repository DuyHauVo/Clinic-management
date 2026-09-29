import React from 'react';
import type { DmDichVuItem } from '../../../../types';
import {
  generateDichVuXml,
  downloadDichVuXmlFile,
  sendDichVuToBhxhGateway,
} from '../../../../utils/dichVuXmlEngine';
import type { SendDichVuGatewayResult } from '../../../../types/dichVuTypes';
import { xmlToBase64, DEFAULT_MA_CSKCB } from '../../../../utils/shared/excelXmlShared';
import { XmlExportModal } from '../../../common';
import { useXmlExportModal } from '../../../../hooks';

import type { SourceFileUploadInfo } from '../../../common';

export interface DichVuXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmDichVuItem[];
  defaultTab?: 'xml' | 'base64' | 'api' | 'smartca';
  onSendSuccess?: (result: SendDichVuGatewayResult) => void;
  fileUploadStats?: SourceFileUploadInfo | null;
}

export const DichVuXmlModal: React.FC<DichVuXmlModalProps> = ({
  isOpen,
  onClose,
  items,
  defaultTab = 'xml',
  onSendSuccess,
  fileUploadStats,
}) => {
  const {
    tab,
    setTab,
    isSending,
    sendResult,
    xmlContent,
    base64Content,
    handleDownloadXml,
    handleSendGateway,
  } = useXmlExportModal<DmDichVuItem, SendDichVuGatewayResult>({
    isOpen,
    items,
    defaultTab,
    generateXml: generateDichVuXml,
    generateBase64: (_items, xml) => (xml ? xmlToBase64(xml) : ''),
    downloadFile: (_items, xml) => {
      downloadDichVuXmlFile(xml || items, `DM05_DVKT_${DEFAULT_MA_CSKCB}.xml`);
    },
    sendGateway: sendDichVuToBhxhGateway,
    downloadSuccessMessage: 'Đã tải xuống file XML Mẫu 05/DM chuẩn QĐ 3176/QĐ-BYT & BHXH Việt Nam',
    getSendSuccessMessage: (res) =>
      `[Sandbox] Cổng tiếp nhận thành công! Mã GD: ${res.maGiaoDich}`,
    onSendSuccess,
  });

  return (
    <XmlExportModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 05/DM"
      loaiHsBadge="Loại HS 70/72 - GuiDanhMuc05_DICHVUKBCB"
      itemsCount={items.length}
      itemLabel="dịch vụ kỹ thuật"
      xmlContent={xmlContent}
      base64Content={base64Content}
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc05_DICHVUKBCB"
      loaiHsCode="70"
      tab={tab}
      onTabChange={setTab}
      onExportXml={handleDownloadXml}
      onSendApi={handleSendGateway}
      isSendingApi={isSending}
      apiResponse={sendResult}
      customFileName={`DM05_DVKT_${DEFAULT_MA_CSKCB}.xml`}
      enableSmartCa
      sourceFileInfo={fileUploadStats}
    />
  );
};
