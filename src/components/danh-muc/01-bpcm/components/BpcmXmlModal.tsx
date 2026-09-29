import React from 'react';
import type { DmBpcmItem } from '../../../../types';
import { XmlExportModal } from '../../../common';
import { DEFAULT_MA_CSKCB } from '../../../../utils/shared/excelXmlShared';

export interface BpcmXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmBpcmItem[];
  xmlContent: string;
  base64Content: string;
  tab: 'xml' | 'base64' | 'api' | 'smartca';
  onTabChange: (tab: 'xml' | 'base64' | 'api' | 'smartca') => void;
  isKeyCopied?: (key: string) => boolean;
  onCopy?: (text: string, message?: string, key?: string) => void;
  onExportXml: () => void;
  onSendApi: (signatureResult?: any) => void;
  isSendingApi: boolean;
  apiResponse: any;
}

export const BpcmXmlModal: React.FC<BpcmXmlModalProps> = ({
  items,
  ...props
}) => {
  return (
    <XmlExportModal
      {...props}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 01/DM (Khoa Phòng / BPCM)"
      loaiHsBadge="Loại HS 70 - GuiDanhMuc01_BPCMKBCB"
      itemsCount={items.length}
      itemLabel="khoa phòng / bàn khám"
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc01_BPCMKBCB"
      loaiHsCode="70"
      customFileName={`DM01_BPCMKBCB_${DEFAULT_MA_CSKCB}.xml`}
      enableSmartCa
    />
  );
};
