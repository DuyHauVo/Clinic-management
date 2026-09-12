import React, { useState, useMemo } from 'react';
import type { Hs01TongHopItem, SendHs01GatewayResult } from '../services/hs01TongHopService';
import {
  generateHs01Xml,
  xmlToBase64,
  downloadHs01XmlFile,
  sendHs01ToBhxhGateway
} from '../services/hs01TongHopService';
import { useToast } from '../../../../context/ToastContext';
import { DanhMucXmlModal } from '../../../danh-muc/common/DanhMucXmlModal';
import { DEFAULT_MA_CSKCB, DEFAULT_MA_TINH } from '../../../../utils/shared/excelXmlShared';

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
  const toast = useToast();
  const [tab, setTab] = useState<'xml' | 'base64' | 'api'>(activeTab);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendHs01GatewayResult | null>(null);

  const xmlContent = useMemo(
    () => (isOpen ? generateHs01Xml(items, DEFAULT_MA_CSKCB) : ''),
    [isOpen, items]
  );

  const base64Content = useMemo(
    () => (xmlContent ? xmlToBase64(xmlContent) : ''),
    [xmlContent]
  );

  const handleDownloadXml = () => {
    downloadHs01XmlFile(items, DEFAULT_MA_CSKCB);
    toast.success('Đã tải xuống tệp XML Mẫu 01/BH thành công!', 'Tải Tệp XML');
  };

  const handleSendGateway = async () => {
    if (items.length === 0) {
      toast.error('Không có hồ sơ nào để gửi!', 'Lỗi Gửi Dữ Liệu');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendHs01ToBhxhGateway(items, {
        maCskcb: DEFAULT_MA_CSKCB,
        username: `${DEFAULT_MA_CSKCB}_BV`,
        passwordHash: '81dc9bdb52d04dc20036dbd8313ed055',
        accessToken: 'Y3lSVnFqS2JVN0RaUXNyb21WSzFxVE8xM0w4REpTeDhIR3c4Qkw3MCtXbz06MDE5MjlfQlY6MTM0MTY1MDU2NzAzMDkxOTA4',
        tokenId: '7b3bc7b0-014f-41b5-b910-953a673a5e47',
        maTinh: DEFAULT_MA_TINH,
        kyQT: '202602'
      });
      setSendResult(res);
      toast.success(
        `Tiếp nhận thành công ${res.totalRecords} hồ sơ tổng hợp 01/BH!\nMã giao dịch: ${res.maGiaoDich}`,
        'Gửi Cổng BHXH Thành Công'
      );
      if (onSendSuccess) {
        onSendSuccess(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối cổng BHXH';
      toast.error(msg, 'Lỗi Gửi Cổng');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DanhMucXmlModal
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
