import React from 'react';
import type { DmNhanLucItem } from '../../../../types';
import { XmlExportModal } from '../../../common';

export interface NhanLucXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmNhanLucItem[];
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

export const NhanLucXmlModal: React.FC<NhanLucXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <XmlExportModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 02/DM"
      loaiHsBadge="Loại HS 71 - GuiDanhMuc02_NHANLUCKBCB"
      itemsCount={items.length}
      itemLabel="nhân lực y tế"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc02_NHANLUCKBCB"
      loaiHsCode="71"
    />
  );
};
