import React, { useState, useMemo } from 'react';
import type { DmDichVuItem, DmThuocPxItem } from '../../../types';
import {
  DICHVU_SCHEMA_FIELDS,
  parseDichVuExcelFile,
  parseDichVuWorksheet,
  generateDichVuXml,
  xmlToBase64,
  downloadDichVuXmlFile,
  generateDichVuTemplate,
  sendDichVuToBhxhGateway,
  type ParseDichVuExcelResult,
  type SendDichVuGatewayResult
} from './services/dichVuService';
import { initialDichVuData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import {
  DichVuStatsCards,
  DichVuDropzone,
  DichVuTable,
  DichVuEditModal,
  ThuocPxModal,
  DichVuXmlModal
} from './components';
import { SchemaMappingModal } from '../common/SchemaMappingModal';
import { SchemaMappingCard } from '../common/SchemaMappingCard';

import { useClipboard } from '../../../hooks';

export const DmDichVuTab: React.FC = () => {
  const toast = useToast();
  const { isCopied, copy: handleCopyText } = useClipboard();
  const [dichVuItems, setDichVuItems] = useState<DmDichVuItem[]>(initialDichVuData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadStats, setFileUploadStats] = useState<ParseDichVuExcelResult | null>(null);

  // Modal State for Mẫu 05/DM
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlExportTab, setXmlExportTab] = useState<'xml' | 'base64' | 'api'>('xml');
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<SendDichVuGatewayResult | null>(null);

  // Edit / Add Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmDichVuItem | null>(null);

  // Thuốc phóng xạ Modal State
  const [isThuocPxModalOpen, setIsThuocPxModalOpen] = useState(false);
  const [selectedServiceForPx, setSelectedServiceForPx] = useState<DmDichVuItem | null>(null);

  // Schema Mapping Inspector Modal State
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const result = await parseDichVuExcelFile(file);
      setDichVuItems(result.items);
      setFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} dịch vụ kỹ thuật từ file "${file.name}"\nSheet: "${result.selectedSheet}"`,
        'Nạp File Excel DVKT Thành Công'
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel Dịch vụ kỹ thuật!', 'Lỗi Đọc File');
    } finally {
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };

  const handleSwitchSheet = (sheetName: string) => {
    if (!fileUploadStats?.workbook) return;
    try {
      const ws = fileUploadStats.workbook.Sheets[sheetName];
      const result = parseDichVuWorksheet(
        ws,
        sheetName,
        fileUploadStats.availableSheets,
        fileUploadStats.fileName,
        fileUploadStats.workbook
      );
      setDichVuItems(result.items);
      setFileUploadStats(result);
      toast.info(`Đã chuyển sang Sheet "${sheetName}" (${result.items.length} dịch vụ)`, 'Chuyển Sheet Dữ Liệu');
    } catch (err: any) {
      toast.error(`Lỗi khi chuyển sang sheet "${sheetName}": ${err.message}`, 'Lỗi Đọc Sheet');
    }
  };

  const handleLoadSampleData = () => {
    setDichVuItems(initialDichVuData);
    setFileUploadStats(null);
    toast.success('Đã nạp dữ liệu danh mục DVKT mẫu gồm khám, X-quang, siêu âm, xét nghiệm, xạ hình', 'Nạp Dữ Liệu Mẫu');
  };

  const handleClearData = () => {
    setDichVuItems([]);
    setFileUploadStats(null);
    toast.info('Đã làm trống danh mục dịch vụ kỹ thuật', 'Đã Dọn Dẹp');
  };

  const handleSaveItem = (item: DmDichVuItem) => {
    if (editingItem) {
      setDichVuItems(dichVuItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật dịch vụ: ${item.tenDichVu}`, 'Cập Nhật Thành Công');
    } else {
      const newItem: DmDichVuItem = {
        ...item,
        id: `dv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stt: dichVuItems.length + 1
      };
      setDichVuItems([...dichVuItems, newItem]);
      toast.success(`Đã thêm dịch vụ: ${item.tenDichVu}`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (item: DmDichVuItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${item.tenDichVu}" (${item.maDichVu})?`)) {
      setDichVuItems((prev) =>
        prev
          .filter((i) => i.id !== item.id)
          .map((i, idx) => ({ ...i, stt: idx + 1 }))
      );
      toast.info(`Đã xóa dịch vụ: ${item.tenDichVu}`, 'Đã Xóa');
    }
  };

  const handleOpenThuocPxModal = (item: DmDichVuItem) => {
    setSelectedServiceForPx(item);
    setIsThuocPxModalOpen(true);
  };

  const handleSaveThuocPx = (pxItems: DmThuocPxItem[]) => {
    if (!selectedServiceForPx) return;
    const totalPx = pxItems.reduce((acc, cur) => acc + (cur.thanhTienThuoc || 0), 0);
    setDichVuItems((prev) =>
      prev.map((i) => {
        if (i.id === selectedServiceForPx.id) {
          return {
            ...i,
            dsThuocPx: pxItems,
            giaThanhToan: (i.donGia || 0) + totalPx
          };
        }
        return i;
      })
    );
    toast.success(`Đã cập nhật thuốc phóng xạ cho dịch vụ: ${selectedServiceForPx.tenDichVu}`, 'Cập Nhật Thuốc PX');
  };

  // XML & Base64 Generation
  const xmlContent = useMemo(() => {
    return generateDichVuXml(dichVuItems);
  }, [dichVuItems]);

  const base64Content = useMemo(() => {
    return xmlToBase64(xmlContent);
  }, [xmlContent]);

  const handleExportXml = () => {
    downloadDichVuXmlFile(dichVuItems, `DanhMuc05_DVKT_${Date.now()}.xml`);
    toast.success('Đã tải xuống tệp XML Mẫu 05/DM chuẩn QĐ 3176/QĐ-BYT & BHXH Việt Nam', 'Xuất File Thành Công');
  };

  const handleSendBhxhApi = async () => {
    setIsSendingApi(true);
    try {
      const res = await sendDichVuToBhxhGateway(dichVuItems);
      setApiResponse(res);
      toast.success(
        `Đã gửi thành công ${res.totalRecords} dịch vụ kỹ thuật lên Cổng BHXH (Sandbox)\nMã GD: ${res.maGiaoDich}`,
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
    if (!q) return dichVuItems;
    return dichVuItems.filter(
      (i) =>
        i.tenDichVu.toLowerCase().includes(q) ||
        i.maDichVu.toLowerCase().includes(q) ||
        (i.tenDvktGia && i.tenDvktGia.toLowerCase().includes(q)) ||
        (i.quyTrinh && i.quyTrinh.toLowerCase().includes(q)) ||
        (i.qdDvkt && i.qdDvkt.toLowerCase().includes(q)) ||
        (i.qdPdGia && i.qdPdGia.toLowerCase().includes(q)) ||
        (i.ghiChu && i.ghiChu.toLowerCase().includes(q))
    );
  }, [dichVuItems, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 1. Top 4 Metric KPI Cards */}
      <DichVuStatsCards items={dichVuItems} />

      {/* 2. Excel Upload Dropzone & Action Toolbar */}
      <DichVuDropzone
        isLoadingFile={isLoadingFile}
        fileUploadStats={fileUploadStats}
        itemsCount={dichVuItems.length}
        onFileUpload={handleFileUpload}
        onSwitchSheet={handleSwitchSheet}
        onDownloadTemplate={generateDichVuTemplate}
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
        schemaFields={DICHVU_SCHEMA_FIELDS}
        matchedKeys={
          fileUploadStats
            ? Object.values(fileUploadStats.detectedHeaders)
            : DICHVU_SCHEMA_FIELDS.map((f: { key: string }) => f.key)
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
        loaiHsBadge="Loại HS 12 - 16 Trường"
        title="Đặc Tả Cấu Trúc 16 Trường Danh Mục Dịch Vụ KBCB (Mẫu 05/DM - Loại HS 12)"
        defaultExpanded={!!fileUploadStats}
      />

      {/* 4. Table of Services */}
      <DichVuTable
        items={filteredItems}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNew={() => {
          setEditingItem(null);
          setIsEditModalOpen(true);
        }}
        onEdit={(item: DmDichVuItem) => {
          setEditingItem(item);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteItem}
        onManageThuocPx={handleOpenThuocPxModal}
      />

      {/* 5. Add / Edit Modal */}
      <DichVuEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      {/* 6. Thuốc Phóng Xạ Modal */}
      {selectedServiceForPx && (
        <ThuocPxModal
          isOpen={isThuocPxModalOpen}
          onClose={() => {
            setIsThuocPxModalOpen(false);
            setSelectedServiceForPx(null);
          }}
          serviceName={selectedServiceForPx.tenDichVu}
          serviceCode={selectedServiceForPx.maDichVu}
          items={selectedServiceForPx.dsThuocPx || []}
          onSave={handleSaveThuocPx}
        />
      )}

      {/* 7. XML & API Sandbox Modal */}
      <DichVuXmlModal
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        items={dichVuItems}
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

      {/* 8. 16 Standard Fields Schema Mapping Inspector Modal */}
      <SchemaMappingModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        title="Mẫu 05/DM: Danh Mục Dịch Vụ Khám Bệnh, Chữa Bệnh Áp Dụng BHYT"
        loaiHsBadge="Loại HS 12 - 16 Trường"
        schemaFields={DICHVU_SCHEMA_FIELDS}
        matchedKeys={
          fileUploadStats
            ? Object.values(fileUploadStats.detectedHeaders)
            : DICHVU_SCHEMA_FIELDS.map((f: { key: string }) => f.key)
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
