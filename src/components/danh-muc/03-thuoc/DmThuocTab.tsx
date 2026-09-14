import React, { useState, useMemo } from 'react';
import type { DmThuocItem } from '../../../types';
import {
  THUOC_SCHEMA_FIELDS,
  parseThuocExcelFile,
  parseThuocWorksheet,
  generateThuocXml,
  xmlToBase64,
  downloadThuocXmlFile,
  downloadThuocExcelTemplate,
  sendThuocToBhxhGateway,
  type ParseThuocExcelResult,
  type SendThuocGatewayResult
} from './services/thuocService';
import { initialThuocData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { ThuocStatsCards } from './components/ThuocStatsCards';
import { ThuocDropzone } from './components/ThuocDropzone';
import { ThuocTable } from './components/ThuocTable';
import { ThuocEditModal } from './components/ThuocEditModal';
import { SchemaMappingModal, SchemaMappingCard } from '../common';
import { XmlExportModal } from '../../common';

export const DmThuocTab: React.FC = () => {
  const toast = useToast();
  const [thuocItems, setThuocItems] = useState<DmThuocItem[]>(initialThuocData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadStats, setFileUploadStats] = useState<ParseThuocExcelResult | null>(null);

  // Modal States
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlExportTab, setXmlExportTab] = useState<'xml' | 'base64' | 'api'>('xml');
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<SendThuocGatewayResult | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmThuocItem | null>(null);

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const result = await parseThuocExcelFile(file);
      setThuocItems(result.items);
      setFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} mặt hàng thuốc (${result.matchedFields.length}/37 trường chuẩn)\nSheet: "${result.selectedSheet}"`,
        'Nạp File Excel Thuốc Thành Công'
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel Thuốc!', 'Lỗi Đọc File');
    } finally {
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };

  const handleSwitchSheet = (sheetName: string) => {
    if (!fileUploadStats?.workbook) return;
    try {
      const result = parseThuocWorksheet(fileUploadStats.workbook, sheetName, fileUploadStats.fileName);
      setThuocItems(result.items);
      setFileUploadStats(result);
      toast.info(`Đã chuyển sang Sheet "${sheetName}" (${result.items.length} mặt hàng)`, 'Chuyển Sheet Dữ Liệu');
    } catch (err: any) {
      toast.error(`Lỗi khi chuyển sang sheet "${sheetName}": ${err.message}`, 'Lỗi Đọc Sheet');
    }
  };

  const handleLoadSampleData = () => {
    setThuocItems(initialThuocData);
    setFileUploadStats(null);
    toast.success('Đã nạp dữ liệu danh mục thuốc mẫu chuẩn 37 trường', 'Nạp Dữ Liệu Mẫu');
  };

  const handleClearData = () => {
    setThuocItems([]);
    setFileUploadStats(null);
    toast.info('Đã làm trống bảng danh mục thuốc', 'Đã Dọn Dẹp');
  };

  const handleSaveItem = (item: DmThuocItem) => {
    if (editingItem) {
      setThuocItems(thuocItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật thuốc: ${item.tenThuoc}`, 'Cập Nhật Thành Công');
    } else {
      const newItem: DmThuocItem = {
        ...item,
        id: `thuoc-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stt: thuocItems.length + 1
      };
      setThuocItems([...thuocItems, newItem]);
      toast.success(`Đã thêm thuốc mới: ${item.tenThuoc}`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (item: DmThuocItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thuốc "${item.tenThuoc}" (${item.maThuoc})?`)) {
      const updated = thuocItems
        .filter((i) => i.id !== item.id)
        .map((i, idx) => ({ ...i, stt: idx + 1 }));
      setThuocItems(updated);
      toast.info(`Đã xóa: ${item.tenThuoc}`, 'Đã Xóa');
    }
  };

  const handleExportXml = () => {
    if (thuocItems.length === 0) {
      toast.warning('Chưa có dữ liệu thuốc để xuất XML!', 'Dữ Liệu Trống');
      return;
    }
    const xml = generateThuocXml(thuocItems);
    downloadThuocXmlFile(xml);
    toast.success('Đã tải xuống file XML Mẫu 03/DM chuẩn Loại hồ sơ 10', 'Xuất File Thành Công');
  };

  const handleSendBhxhApi = async () => {
    if (thuocItems.length === 0) {
      toast.warning('Chưa có dữ liệu thuốc để gửi cổng BHXH!', 'Dữ Liệu Trống');
      return;
    }
    setIsSendingApi(true);
    try {
      const res = await sendThuocToBhxhGateway(thuocItems);
      setApiResponse(res);
      toast.success(`[Sandbox] Cổng tiếp nhận thành công! Mã GD: ${res.maGiaoDich}`, 'Gửi API Thành Công (Mô phỏng)');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối Cổng BHXH', 'Gửi Thất Bại');
    } finally {
      setIsSendingApi(false);
    }
  };

  const filteredItems = thuocItems.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      i.tenThuoc.toLowerCase().includes(q) ||
      (i.tenHoatChat && i.tenHoatChat.toLowerCase().includes(q)) ||
      i.maThuoc.toLowerCase().includes(q) ||
      i.soDangKy.toLowerCase().includes(q) ||
      (i.nhaThau && i.nhaThau.toLowerCase().includes(q))
    );
  });

  const currentXml = useMemo(() => (thuocItems.length > 0 ? generateThuocXml(thuocItems) : ''), [thuocItems]);
  const currentBase64 = useMemo(() => (currentXml ? xmlToBase64(currentXml) : ''), [currentXml]);

  return (
    <div className="space-y-6">
      <ThuocStatsCards items={thuocItems} />

      <ThuocDropzone
        isLoadingFile={isLoadingFile}
        fileUploadStats={fileUploadStats}
        itemsCount={thuocItems.length}
        onFileUpload={handleFileUpload}
        onSwitchSheet={handleSwitchSheet}
        onDownloadTemplate={downloadThuocExcelTemplate}
        onLoadSample={handleLoadSampleData}
        onClearData={handleClearData}
        onOpenXmlModal={() => setIsXmlModalOpen(true)}
        onOpenApiTab={() => {
          setIsXmlModalOpen(true);
          setXmlExportTab('api');
        }}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onAddNew={() => {
          setEditingItem(null);
          setIsEditModalOpen(true);
        }}
      />

      {/* Schema Mapping & Column Comparison Card */}
      <SchemaMappingCard
        title="Đối Soát Khớp Cột Chuẩn Mẫu 03/DM (Thuốc, Máu & Chế Phẩm Máu)"
        loaiHsBadge="Loại HS 10 - 37 Trường"
        schemaFields={THUOC_SCHEMA_FIELDS}
        matchedKeys={fileUploadStats?.matchedFields || THUOC_SCHEMA_FIELDS.map((f) => f.key)}
        matchedColumnsMap={fileUploadStats?.matchedColumnsMap || {}}
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
        defaultExpanded={!!fileUploadStats}
      />

      <ThuocTable
        items={filteredItems}
        searchTerm={searchTerm}
        totalCount={thuocItems.length}
        onSearchChange={setSearchTerm}
        onEdit={(item) => {
          setEditingItem(item);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteItem}
      />

      <XmlExportModal
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        title="Cấu Trúc XML & Chuỗi Base64 Ký Số Mẫu 03/DM"
        loaiHsBadge="Loại HS 10 - GuiDanhMuc03_DMTHUOC"
        itemsCount={thuocItems.length}
        itemLabel="mặt hàng thuốc / chế phẩm máu"
        xmlContent={currentXml}
        base64Content={currentBase64}
        apiEndpoint="https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc03_DMTHUOC"
        loaiHsCode="10"
        tab={xmlExportTab}
        onTabChange={setXmlExportTab}
        onExportXml={handleExportXml}
        onSendApi={handleSendBhxhApi}
        isSendingApi={isSendingApi}
        apiResponse={apiResponse}
      />

      <ThuocEditModal
        key={editingItem?.id ?? 'new-thuoc-item'}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      {/* Reusable Schema Inspector Modal */}
      <SchemaMappingModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        title="Mẫu 03/DM: Danh Mục Thuốc, Máu & Chế Phẩm Máu BHYT"
        loaiHsBadge="Loại HS 10 - 37 Trường"
        schemaFields={THUOC_SCHEMA_FIELDS}
        matchedKeys={fileUploadStats?.matchedFields || THUOC_SCHEMA_FIELDS.map((f) => f.key)}
        matchedColumnsMap={fileUploadStats?.matchedColumnsMap || {}}
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
      />
    </div>
  );
};
