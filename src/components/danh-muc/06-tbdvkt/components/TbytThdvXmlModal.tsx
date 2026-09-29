import React from 'react';
import type { DmTbytThdvItem } from '../../../../types';
import {
  generateTbytThdvXml,
  downloadTbytThdvXmlFile,
  sendTbytThdvToBhxhGateway,
} from '../../../../utils/tbyttHdvXmlEngine';
import type { SendTbytThdvGatewayResult } from '../../../../types/tbyttHdvTypes';
import { xmlToBase64, DEFAULT_MA_CSKCB } from '../../../../utils/shared/excelXmlShared';
import { XmlExportModal } from '../../../common';
import { useXmlExportModal } from '../../../../hooks';

import type { SourceFileUploadInfo } from '../../../common';

export interface TbytThdvXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DmTbytThdvItem[];
  defaultTab?: 'xml' | 'base64' | 'api' | 'smartca';
  onSendSuccess?: (result: SendTbytThdvGatewayResult) => void;
  fileUploadStats?: SourceFileUploadInfo | null;
}

export const TbytThdvXmlModal: React.FC<TbytThdvXmlModalProps> = ({
  isOpen,
  onClose,
  items,
  defaultTab = 'xml',
  onSendSuccess,
  fileUploadStats,
}) => {
  const {
    tab,
    setTab,
    isSending,
    sendResult,
    xmlContent,
    base64Content,
    handleDownloadXml,
    handleSendGateway,
  } = useXmlExportModal<DmTbytThdvItem, SendTbytThdvGatewayResult>({
    isOpen,
    items,
    defaultTab,
    generateXml: generateTbytThdvXml,
    generateBase64: (_items, xml) => (xml ? xmlToBase64(xml) : ''),
    downloadFile: (_items, xml) => {
      downloadTbytThdvXmlFile(xml || items, `DM06_TBTHDV_${DEFAULT_MA_CSKCB}.xml`);
    },
    sendGateway: sendTbytThdvToBhxhGateway,
    downloadSuccessMessage: 'Đã tải xuống file XML Mẫu 06/DM chuẩn Loại hồ sơ 70/72',
    getSendSuccessMessage: (res) =>
      `[Sandbox] Cổng tiếp nhận thành công! Mã GD: ${res.maGiaoDich}`,
    onSendSuccess,
  });

  return (
    <XmlExportModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 06/DM"
      loaiHsBadge="Loại HS 70/72 - GuiDanhMuc06_TBTHDV"
      itemsCount={items.length}
      itemLabel="thiết bị thực hiện DVKT"
      xmlContent={xmlContent}
      base64Content={base64Content}
      apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc06_TBTHDV"
      loaiHsCode="70"
      tab={tab}
      onTabChange={setTab}
      onExportXml={handleDownloadXml}
      onSendApi={handleSendGateway}
      isSendingApi={isSending}
      apiResponse={sendResult}
      customFileName={`DM06_TBTHDV_${DEFAULT_MA_CSKCB}.xml`}
      enableSmartCa
      sourceFileInfo={fileUploadStats}
    />
  );
};
