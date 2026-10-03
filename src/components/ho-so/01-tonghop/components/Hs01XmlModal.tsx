import React from 'react';
import type { Hs01TongHopItem, SendHs01GatewayResult } from '../services/hs01TongHopService';
import {
  generateHs01Xml,
  xmlToBase64,
  downloadHs01XmlFile,
  sendHs01ToBhxhGateway
} from '../services/hs01TongHopService';
import { XmlExportModal } from '../../../common';
import { useXmlExportModal } from '../../../../hooks';
import { DEFAULT_MA_CSKCB } from '../../../../utils/shared/excelXmlShared';

import type { SourceFileUploadInfo } from '../../../common';

export interface Hs01XmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Hs01TongHopItem[];
  defaultTab?: 'xml' | 'base64' | 'api' | 'smartca';
  activeTab?: 'xml' | 'base64' | 'api' | 'smartca';
  onSendSuccess?: (result: SendHs01GatewayResult) => void;
  fileUploadStats?: SourceFileUploadInfo | null;
}

// ==========================================
// CÁC HÀM XỬ LÝ DỮ LIỆU HS01 (Dễ maintain & tái sử dụng)
// ==========================================
const generateHs01XmlHandler = (items: Hs01TongHopItem[]) => {
  return generateHs01Xml(items, DEFAULT_MA_CSKCB);
};

const generateHs01Base64Handler = (_items: Hs01TongHopItem[], xml?: string) => {
  return xml ? xmlToBase64(xml) : '';
};

const downloadHs01FileHandler = (items: Hs01TongHopItem[]) => {
  downloadHs01XmlFile(items, DEFAULT_MA_CSKCB);
};

const sendHs01GatewayHandler = (
  items: Hs01TongHopItem[],
  signature?: any,
  fileBase64?: string,
) => {
  return sendHs01ToBhxhGateway(items, undefined, signature, fileBase64);
};

const getHs01SendSuccessMessage = (res: SendHs01GatewayResult) => {
  return `Tiếp nhận thành công ${res.totalRecords} hồ sơ tổng hợp 01/BH!\nMã giao dịch: ${res.maGiaoDich}`;
};

export const Hs01XmlModal: React.FC<Hs01XmlModalProps> = ({
  isOpen,
  onClose,
  items,
  defaultTab,
  activeTab = 'xml',
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
    handleSendGateway
  } = useXmlExportModal<Hs01TongHopItem, SendHs01GatewayResult>({
    isOpen,
    items,
    defaultTab: defaultTab || activeTab,
    generateXml: generateHs01XmlHandler,
    generateBase64: generateHs01Base64Handler,
    downloadFile: downloadHs01FileHandler,
    sendGateway: sendHs01GatewayHandler,
    downloadSuccessMessage: 'Đã tải xuống tệp XML Mẫu 01/BH thành công!',
    emptyItemsMessage: 'Không có hồ sơ nào để gửi!',
    getSendSuccessMessage: getHs01SendSuccessMessage,
    onSendSuccess
  });

  return (
    <XmlExportModal
      isOpen={isOpen}
      onClose={onClose}
      title="Xuất XML & Cổng Giám Định BHYT (Mẫu 01/BH)"
      loaiHsBadge="Loại HS 5 - GuiHoSoTongHop01BH"
      itemsCount={items.length}
      itemLabel="hồ sơ tổng hợp"
      xmlContent={xmlContent}
      base64Content={base64Content}
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/HoSoTongHop7980/GuiHoSoTongHop01BH"
      loaiHsCode="5"
      tab={tab}
      onTabChange={setTab}
      onExportXml={handleDownloadXml}
      onSendApi={handleSendGateway}
      isSendingApi={isSending}
      apiResponse={sendResult}
      sourceFileInfo={fileUploadStats}
    />
  );
};
