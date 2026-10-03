import React from 'react';
import type { HoSoDieuChinh09Item, SendHs09GatewayResult } from '../../../../types/hs09DieuChinhTypes';
import {
  generateHs09Xml,
  downloadHs09XmlFile,
  sendHs09ToBhxhGateway
} from '../../../../utils/hs09DieuChinhXmlEngine';
import { xmlToBase64 } from '../../../../utils/shared/excelXmlShared';
import { XmlExportModal } from '../../../common';
import { useXmlExportModal } from '../../../../hooks';

import type { SourceFileUploadInfo } from '../../../common';

export interface Hs09XmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HoSoDieuChinh09Item[];
  defaultTab?: 'xml' | 'base64' | 'api' | 'smartca';
  activeTab?: 'xml' | 'base64' | 'api' | 'smartca';
  onSendSuccess?: (result: SendHs09GatewayResult) => void;
  fileUploadStats?: SourceFileUploadInfo | null;
}

// ==========================================
// CÁC HÀM XỬ LÝ DỮ LIỆU HS09 (Dễ maintain & tái sử dụng)
// ==========================================
const generateHs09Base64Handler = (_items: HoSoDieuChinh09Item[], xml?: string) => {
  return xml ? xmlToBase64(xml) : '';
};

const downloadHs09FileHandler = (items: HoSoDieuChinh09Item[], xml?: string) => {
  downloadHs09XmlFile(xml || items);
};

const sendHs09GatewayHandler = (items: HoSoDieuChinh09Item[]) => {
  return sendHs09ToBhxhGateway(items);
};

const getHs09SendSuccessMessage = (res: SendHs09GatewayResult) => {
  return `Tiếp nhận thành công ${res.totalRecords} hồ sơ điều chỉnh 09/BH!\nMã giao dịch: ${res.maGiaoDich}`;
};

export const Hs09XmlModal: React.FC<Hs09XmlModalProps> = ({
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
    handleSendGateway,
    handleResetSendResult,
  } = useXmlExportModal<HoSoDieuChinh09Item, SendHs09GatewayResult>({
    isOpen,
    items,
    defaultTab: defaultTab || activeTab,
    generateXml: generateHs09Xml,
    generateBase64: generateHs09Base64Handler,
    downloadFile: downloadHs09FileHandler,
    sendGateway: sendHs09GatewayHandler,
    downloadSuccessMessage: 'Đã tải xuống tệp XML Hồ sơ điều chỉnh Mẫu 09/BH thành công!',
    emptyItemsMessage: 'Không có hồ sơ điều chỉnh nào để gửi!',
    getSendSuccessMessage: getHs09SendSuccessMessage,
    onSendSuccess
  });

  return (
    <XmlExportModal
      isOpen={isOpen}
      onClose={onClose}
      title="Xuất XML & Cổng Giám Định BHYT (Hồ Sơ Điều Chỉnh Mẫu 09/BH)"
      loaiHsBadge="Loại HS 73 - GuiHoSoDieuChinh09BH"
      itemsCount={items.length}
      itemLabel="hồ sơ điều chỉnh"
      xmlContent={xmlContent}
      base64Content={base64Content}
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/HSDCTT12/GuiHoSoDieuChinh09BH"
      loaiHsCode="73"
      tab={tab}
      onTabChange={setTab}
      onExportXml={handleDownloadXml}
      onSendApi={handleSendGateway}
      isSendingApi={isSending}
      apiResponse={sendResult}
      onResetApiResponse={handleResetSendResult}
      sourceFileInfo={fileUploadStats}
    />
  );
};
