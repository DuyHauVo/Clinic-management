import React from 'react';
import type { DmTbytThdvItem, SendTbytThdvGatewayResult } from '../../../../types';
import { DanhMucXmlModal } from '../../common/DanhMucXmlModal';

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
  apiResponse: SendTbytThdvGatewayResult | null;
}

export const TbytThdvXmlModal: React.FC<TbytThdvXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <DanhMucXmlModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 06/DM"
      loaiHsBadge="Loại HS 72 - GuiDanhMuc06_TBYTTHDV"
      itemsCount={items.length}
      itemLabel="thiết bị thực hiện DVKT"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc06_TBYTTHDV"
      loaiHsCode="72"
    />
  );
};
