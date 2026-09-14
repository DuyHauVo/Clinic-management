import React from 'react';
import type { DmTbytThdvItem } from '../../../../types';
import { XmlExportModal } from '../../../common';

export interface TbytThdvXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmTbytThdvItem[];
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

export const TbytThdvXmlModal: React.FC<TbytThdvXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <XmlExportModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 06/DM"
      loaiHsBadge="Loại HS 70/72 - GuiDanhMuc06_TBTHDV"
      itemsCount={items.length}
      itemLabel="thiết bị thực hiện DVKT"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc06_TBTHDV"
      loaiHsCode="70"
    />
  );
};
