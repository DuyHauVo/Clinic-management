import React from 'react';
import type { DmThietBiItem } from '../../../../types';
import type { SendThietBiGatewayResult } from '../services/thietBiService';
import { DanhMucXmlModal } from '../../common/DanhMucXmlModal';

export interface ThietBiXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmThietBiItem[];
  xmlContent: string;
  base64Content: string;
  tab: 'xml' | 'base64' | 'api';
  onTabChange: (tab: 'xml' | 'base64' | 'api') => void;
  isKeyCopied?: (key: string) => boolean;
  onCopy?: (text: string, message?: string, key?: string) => void;
  onExportXml: () => void;
  onSendApi: () => void;
  isSendingApi: boolean;
  apiResponse: SendThietBiGatewayResult | null;
}

export const ThietBiXmlModal: React.FC<ThietBiXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <DanhMucXmlModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 04/DM"
      loaiHsBadge="Loại HS 11 - GuiDanhMuc04_DMTBYT"
      itemsCount={items.length}
      itemLabel="trang thiết bị y tế"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc04_DMTBYT"
      loaiHsCode="11"
    />
  );
};
