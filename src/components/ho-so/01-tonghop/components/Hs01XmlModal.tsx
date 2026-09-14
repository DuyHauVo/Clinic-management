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

export interface Hs01XmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Hs01TongHopItem[];
  activeTab?: 'xml' | 'base64' | 'api';
  onSendSuccess?: (result: SendHs01GatewayResult) => void;
}

export const Hs01XmlModal: React.FC<Hs01XmlModalProps> = ({
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
  } = useXmlExportModal<Hs01TongHopItem, SendHs01GatewayResult>({
    isOpen,
    items,
    defaultTab: activeTab,
    generateXml: (it) => generateHs01Xml(it, DEFAULT_MA_CSKCB),
    generateBase64: (_it, xml) => (xml ? xmlToBase64(xml) : ''),
    downloadFile: (it) => downloadHs01XmlFile(it, DEFAULT_MA_CSKCB),
    sendGateway: (it) => sendHs01ToBhxhGateway(it),
    downloadSuccessMessage: 'Đã tải xuống tệp XML Mẫu 01/BH thành công!',
    emptyItemsMessage: 'Không có hồ sơ nào để gửi!',
    getSendSuccessMessage: (res) =>
      `Tiếp nhận thành công ${res.totalRecords} hồ sơ tổng hợp 01/BH!\nMã giao dịch: ${res.maGiaoDich}`,
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
    />
  );
};
