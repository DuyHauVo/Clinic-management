import React from 'react';
import type { DmThietBiItem } from '../../../../types';
import { XmlExportModal } from '../../../common';

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
  apiResponse: any;
}

export const ThietBiXmlModal: React.FC<ThietBiXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <XmlExportModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 04/DM"
      loaiHsBadge="Loại HS 72 - GuiDanhMuc04_THIETBIKBCB"
      itemsCount={items.length}
      itemLabel="vật tư / thiết bị"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc04_THIETBIKBCB"
      loaiHsCode="72"
    />
  );
};
