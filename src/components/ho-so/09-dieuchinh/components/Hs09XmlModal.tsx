import React from 'react';
import type { HoSoDieuChinh09Item, SendHs09GatewayResult } from '../../../../utils/types/hs09DieuChinhTypes';
import {
  generateHs09Xml,
  downloadHs09XmlFile,
  sendHs09ToBhxhGateway
} from '../../../../utils/hs09DieuChinhXmlEngine';
import { xmlToBase64 } from '../../../../utils/shared/excelXmlShared';
import { XmlExportModal } from '../../../common';
import { useXmlExportModal } from '../../../../hooks';

export interface Hs09XmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HoSoDieuChinh09Item[];
  activeTab?: 'xml' | 'base64' | 'api';
  onSendSuccess?: (result: SendHs09GatewayResult) => void;
}

export const Hs09XmlModal: React.FC<Hs09XmlModalProps> = ({
  isOpen,
  onClose,
  items,
  activeTab = 'xml',
  onSendSuccess
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
  } = useXmlExportModal<HoSoDieuChinh09Item, SendHs09GatewayResult>({
    isOpen,
    items,
    defaultTab: activeTab,
    generateXml: generateHs09Xml,
    generateBase64: (_it, xml) => (xml ? xmlToBase64(xml) : ''),
    downloadFile: (it, xml) => downloadHs09XmlFile(xml || it),
    sendGateway: (it) => sendHs09ToBhxhGateway(it),
    downloadSuccessMessage: 'Đã tải xuống tệp XML Hồ sơ điều chỉnh Mẫu 09/BH thành công!',
    emptyItemsMessage: 'Không có hồ sơ điều chỉnh nào để gửi!',
    getSendSuccessMessage: (res) =>
      `Tiếp nhận thành công ${res.totalRecords} hồ sơ điều chỉnh 09/BH!\nMã giao dịch: ${res.maGiaoDich}`,
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
    />
  );
};
