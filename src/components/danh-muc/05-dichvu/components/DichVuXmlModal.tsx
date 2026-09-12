import React from 'react';
import type { DmDichVuItem } from '../../../../types';
import { XmlExportModal } from '../../../common';

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
  apiResponse: any;
}

export const DichVuXmlModal: React.FC<DichVuXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <XmlExportModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 05/DM"
      loaiHsBadge="Loại HS 70/72 - GuiDanhMuc05_DICHVUKBCB"
      itemsCount={items.length}
      itemLabel="dịch vụ kỹ thuật"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc05_DICHVUKBCB"
      loaiHsCode="70"
    />
  );
};
