import React from 'react';
import type { DmDichVuItem, SendDichVuGatewayResult } from '../../../../types';
import { DanhMucXmlModal } from '../../common/DanhMucXmlModal';

export interface DichVuXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmDichVuItem[];
  xmlContent: string;
  base64Content: string;
  tab: 'xml' | 'base64' | 'api';
  onTabChange: (tab: 'xml' | 'base64' | 'api') => void;
  isKeyCopied?: (key: string) => boolean;
  onCopy?: (text: string, message?: string, key?: string) => void;
  onExportXml: () => void;
  onSendApi: () => void;
  isSendingApi: boolean;
  apiResponse: SendDichVuGatewayResult | null;
}

export const DichVuXmlModal: React.FC<DichVuXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <DanhMucXmlModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 05/DM"
      loaiHsBadge="Loại HS 12 - GuiDanhMuc05_DMDVKT"
      itemsCount={items.length}
      itemLabel="dịch vụ kỹ thuật / KBCB"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc05_DMDVKT"
      loaiHsCode="12"
    />
  );
};
