import React, { useState, useMemo } from 'react';
import type { DmThietBiItem } from '../../../types';
import {
  THIETBI_SCHEMA_FIELDS,
  parseThietBiExcelFile,
  parseThietBiWorksheet,
  generateThietBiXml,
  xmlToBase64,
  downloadThietBiXmlFile,
  downloadThietBiExcelTemplate,
  sendThietBiToBhxhGateway,
  type ParseThietBiExcelResult,
  type SendThietBiGatewayResult
} from './services/thietBiService';
import { initialThietBiData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { ThietBiStatsCards } from './components/ThietBiStatsCards';
import { ThietBiDropzone } from './components/ThietBiDropzone';
import { ThietBiTable } from './components/ThietBiTable';
import { ThietBiXmlModal } from './components/ThietBiXmlModal';
import { ThietBiEditModal } from './components/ThietBiEditModal';
import { SchemaMappingModal } from '../common/SchemaMappingModal';
import { SchemaMappingCard } from '../common/SchemaMappingCard';

export const DmThietBiTab: React.FC = () => {
  const toast = useToast();
  const [thietBiItems, setThietBiItems] = useState<DmThietBiItem[]>(initialThietBiData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadStats, setFileUploadStats] = useState<ParseThietBiExcelResult | null>(null);

  // Modal State for Mẫu 04/DM
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlExportTab, setXmlExportTab] = useState<'xml' | 'base64' | 'api'>('xml');
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<SendThietBiGatewayResult | null>(null);

  // Edit / Add Modal State for Mẫu 04/DM
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmThietBiItem | null>(null);

  // Schema Mapping Inspector Modal State
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const result = await parseThietBiExcelFile(file);
      setThietBiItems(result.items);
      setFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} thiết bị / vật tư từ file "${file.name}"\nSheet: "${result.selectedSheet}"`,
        'Nạp File Excel TBYT Thành Công'
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel Thiết bị y tế!', 'Lỗi Đọc File');
    } finally {
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };

  const handleSwitchSheet = (sheetName: string) => {
    if (!fileUploadStats?.workbook) return;
    try {
      const ws = fileUploadStats.workbook.Sheets[sheetName];
      const result = parseThietBiWorksheet(
        ws,
        sheetName,
        fileUploadStats.availableSheets,
        fileUploadStats.fileName,
        fileUploadStats.workbook
      );
      setThietBiItems(result.items);
      setFileUploadStats(result);
      toast.info(`Đã chuyển sang Sheet "${sheetName}" (${result.items.length} thiết bị / vật tư)`, 'Chuyển Sheet Dữ Liệu');
    } catch (err: any) {
      toast.error(`Lỗi khi chuyển sang sheet "${sheetName}": ${err.message}`, 'Lỗi Đọc Sheet');
    }
  };

  const handleLoadSampleData = () => {
    setThietBiItems(initialThietBiData);
    setFileUploadStats(null);
    toast.success('Đã nạp dữ liệu danh mục thiết bị y tế mẫu gồm các vật tư / TBYT chuẩn', 'Nạp Dữ Liệu Mẫu');
  };

  const handleClearData = () => {
    setThietBiItems([]);
    setFileUploadStats(null);
    toast.info('Đã làm trống danh mục thiết bị y tế', 'Đã Dọn Dẹp');
  };

  const handleSaveItem = (item: DmThietBiItem) => {
    if (editingItem) {
      setThietBiItems(thietBiItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật thiết bị: ${item.tenVatTu}`, 'Cập Nhật Thành Công');
    } else {
      const newItem: DmThietBiItem = {
        ...item,
        id: `tb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stt: thietBiItems.length + 1
      };
      setThietBiItems([...thietBiItems, newItem]);
      toast.success(`Đã thêm thiết bị: ${item.tenVatTu}`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (item: DmThietBiItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thiết bị "${item.tenVatTu}" (${item.maVatTu})?`)) {
      setThietBiItems((prev) =>
        prev
          .filter((i) => i.id !== item.id)
          .map((i, idx) => ({ ...i, stt: idx + 1 }))
      );
      toast.info(`Đã xóa thiết bị: ${item.tenVatTu}`, 'Đã Xóa');
    }
  };

  // XML & Base64 Generation
  const xmlContent = useMemo(() => {
    return generateThietBiXml(thietBiItems);
  }, [thietBiItems]);

  const base64Content = useMemo(() => {
    return xmlToBase64(xmlContent);
  }, [xmlContent]);

  const handleExportXml = () => {
    downloadThietBiXmlFile(xmlContent, `DanhMuc04_DMVTYT_${Date.now()}.xml`);
    toast.success('Đã tải xuống tệp XML Mẫu 04/DM chuẩn Bộ Y tế & BHXH Việt Nam', 'Xuất File Thành Công');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Đã sao chép nội dung vào khay nhớ tạm', 'Đã Sao Chép');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendBhxhApi = async () => {
    setIsSendingApi(true);
    try {
      const res = await sendThietBiToBhxhGateway(thietBiItems);
      setApiResponse(res);
      toast.success(
        `Đã gửi thành công ${res.totalRecords} thiết bị / vật tư lên Cổng BHXH (Sandbox)\nMã GD: ${res.maGiaoDich}`,
        'Gửi Cổng Tiếp Nhận Thành Công'
      );
    } catch (err: any) {
      toast.error(`Lỗi gửi cổng BHXH: ${err.message}`, 'Lỗi Giao Dịch');
    } finally {
      setIsSendingApi(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return thietBiItems;
    return thietBiItems.filter(
      (i) =>
        i.tenVatTu.toLowerCase().includes(q) ||
        i.maVatTu.toLowerCase().includes(q) ||
        i.nhomVatTu.toLowerCase().includes(q) ||
        (i.hangSx && i.hangSx.toLowerCase().includes(q)) ||
        (i.soLuuHanh && i.soLuuHanh.toLowerCase().includes(q)) ||
        (i.maHieu && i.maHieu.toLowerCase().includes(q)) ||
        (i.nhaThau && i.nhaThau.toLowerCase().includes(q))
    );
  }, [thietBiItems, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 1. Top 4 Metric KPI Cards */}
      <ThietBiStatsCards items={thietBiItems} />

      {/* 2. Excel Upload Dropzone & Action Toolbar */}
      <ThietBiDropzone
        isLoadingFile={isLoadingFile}
        fileUploadStats={fileUploadStats}
        itemsCount={thietBiItems.length}
        onFileUpload={handleFileUpload}
        onSwitchSheet={handleSwitchSheet}
        onDownloadTemplate={downloadThietBiExcelTemplate}
        onLoadSample={handleLoadSampleData}
        onClearData={handleClearData}
        onOpenXmlModal={() => {
          setXmlExportTab('xml');
          setIsXmlModalOpen(true);
        }}
        onOpenApiTab={() => {
          setXmlExportTab('api');
          setIsXmlModalOpen(true);
        }}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onAddNew={() => {
          setEditingItem(null);
          setIsEditModalOpen(true);
        }}
      />

      {/* 3. Schema Mapping Inspection Card */}
      <SchemaMappingCard
        schemaFields={THIETBI_SCHEMA_FIELDS}
        matchedKeys={
          fileUploadStats
            ? Object.values(fileUploadStats.detectedHeaders)
            : THIETBI_SCHEMA_FIELDS.map((f) => f.key)
        }
        matchedColumnsMap={
          fileUploadStats
            ? Object.fromEntries(
                Object.entries(fileUploadStats.detectedHeaders).map(([colIdx, key]) => [
                  key,
                  `Cột ${Number(colIdx) + 1} (${key})`
                ])
              )
            : {}
        }
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
        loaiHsBadge="Loại HS 11 - 26 Trường"
        title="Đặc Tả Cấu Trúc 26 Trường Danh Mục Thiết Bị Y Tế (Mẫu 04/DM - Loại HS 11)"
        defaultExpanded={!!fileUploadStats}
      />

      {/* 4. Table of Devices & Consumables */}
      <ThietBiTable
        items={filteredItems}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNew={() => {
          setEditingItem(null);
          setIsEditModalOpen(true);
        }}
        onEdit={(item) => {
          setEditingItem(item);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteItem}
      />

      {/* 5. Add / Edit Modal */}
      <ThietBiEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      {/* 6. XML & Base64 Modal */}
      <ThietBiXmlModal
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        items={thietBiItems}
        xmlContent={xmlContent}
        base64Content={base64Content}
        tab={xmlExportTab}
        onTabChange={setXmlExportTab}
        isCopied={isCopied}
        onCopy={handleCopyText}
        onExportXml={handleExportXml}
        onSendApi={handleSendBhxhApi}
        isSendingApi={isSendingApi}
        apiResponse={apiResponse}
      />

      {/* 7. Schema Mapping Inspector Modal */}
      <SchemaMappingModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        title="Mẫu 04/DM: Danh Mục Thiết Bị Y Tế Áp Dụng Thanh Toán BHYT"
        loaiHsBadge="Loại HS 11 - 26 Trường"
        schemaFields={THIETBI_SCHEMA_FIELDS}
        matchedKeys={
          fileUploadStats
            ? Object.values(fileUploadStats.detectedHeaders)
            : THIETBI_SCHEMA_FIELDS.map((f) => f.key)
        }
        matchedColumnsMap={
          fileUploadStats
            ? Object.fromEntries(
                Object.entries(fileUploadStats.detectedHeaders).map(([colIdx, key]) => [
                  key,
                  `Cột ${Number(colIdx) + 1} (${key})`
                ])
              )
            : {}
        }
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
      />
    </div>
  );
};
