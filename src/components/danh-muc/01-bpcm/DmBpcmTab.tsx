import React, { useState, useMemo } from 'react';
import type { DmBpcmItem } from '../../../types';
import {
  BPCM_SCHEMA_FIELDS,
  parseBpcmExcelFile,
  parseWorksheet,
  generateBpcmXml,
  xmlToBase64,
  downloadXmlFile,
  downloadBpcmExcelTemplate,
  sendBpcmToBhxhGateway,
  type ParseExcelResult
} from './services/bpcmService';
import { initialBpcmData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { BpcmStatsCards } from './components/BpcmStatsCards';
import { BpcmDropzone } from './components/BpcmDropzone';
import { BpcmTable } from './components/BpcmTable';
import { BpcmXmlModal } from './components/BpcmXmlModal';
import { BpcmEditModal } from './components/BpcmEditModal';
import { SchemaMappingModal } from '../common/SchemaMappingModal';
import { SchemaMappingCard } from '../common/SchemaMappingCard';

export const DmBpcmTab: React.FC = () => {
  const toast = useToast();
  const [bpcmItems, setBpcmItems] = useState<DmBpcmItem[]>(initialBpcmData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadStats, setFileUploadStats] = useState<ParseExcelResult | null>(null);

  // Modal States
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlExportTab, setXmlExportTab] = useState<'xml' | 'base64' | 'api'>('xml');
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmBpcmItem | null>(null);

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const result = await parseBpcmExcelFile(file, '01929');
      setBpcmItems(result.items);
      setFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} bản ghi từ tệp "${file.name}"\nSheet: "${result.selectedSheet}"`,
        'Nạp File Excel Thành Công'
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel!', 'Lỗi Đọc File');
    } finally {
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };

  const handleSwitchSheet = (sheetName: string) => {
    if (!fileUploadStats?.workbook) return;
    try {
      const result = parseWorksheet(fileUploadStats.workbook, sheetName, fileUploadStats.fileName, '01929');
      setBpcmItems(result.items);
      setFileUploadStats(result);
      toast.info(`Đã chuyển sang Sheet "${sheetName}" (${result.items.length} bản ghi)`, 'Chuyển Sheet Dữ Liệu');
    } catch (err: any) {
      toast.error(`Lỗi khi chuyển sang sheet "${sheetName}": ${err.message}`, 'Lỗi Đọc Sheet');
    }
  };

  const handleLoadSampleData = () => {
    setBpcmItems(initialBpcmData);
    setFileUploadStats(null);
    toast.success('Đã nạp dữ liệu danh mục BPCM mẫu chuẩn', 'Nạp Dữ Liệu Mẫu');
  };

  const handleClearData = () => {
    setBpcmItems([]);
    setFileUploadStats(null);
    toast.info('Đã làm trống bảng dữ liệu BPCM', 'Đã Dọn Dẹp');
  };

  const handleSaveItem = (item: DmBpcmItem) => {
    if (editingItem) {
      setBpcmItems(bpcmItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật khoa phòng: ${item.tenKhoa}`, 'Cập Nhật Thành Công');
    } else {
      const newItem = {
        ...item,
        id: `bpcm-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stt: bpcmItems.length + 1
      };
      setBpcmItems([...bpcmItems, newItem]);
      toast.success(`Đã thêm mới khoa phòng: ${item.tenKhoa}`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (item: DmBpcmItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khoa/bàn khám "${item.tenKhoa}" (${item.maKhoa})?`)) {
      setBpcmItems(bpcmItems.filter((i) => i.id !== item.id));
      toast.info(`Đã xóa: ${item.tenKhoa}`, 'Đã Xóa');
    }
  };

  const handleExportXml = () => {
    if (bpcmItems.length === 0) {
      toast.warning('Chưa có dữ liệu BPCM để xuất XML!', 'Dữ Liệu Trống');
      return;
    }
    const xml = generateBpcmXml(bpcmItems);
    downloadXmlFile(xml, 'DanhMuc01_BPCMKBCB_01929.xml');
    toast.success('Đã tải xuống file XML Mẫu 01/DM chuẩn Loại hồ sơ 70', 'Xuất File Thành Công');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Đã sao chép vào bộ nhớ đệm!', 'Sao Chép');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendBhxhApi = async () => {
    if (bpcmItems.length === 0) {
      toast.warning('Chưa có dữ liệu BPCM để gửi cổng BHXH!', 'Dữ Liệu Trống');
      return;
    }
    setIsSendingApi(true);
    try {
      const res = await sendBpcmToBhxhGateway(bpcmItems, '01929', '01');
      setApiResponse(res);
      toast.success(`[Sandbox] Cổng tiếp nhận thành công! Mã GD: ${res.maGiaoDich}`, 'Gửi API Thành Công (Mô phỏng)');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối Cổng BHXH', 'Gửi Thất Bại');
    } finally {
      setIsSendingApi(false);
    }
  };

  const filteredItems = bpcmItems.filter(
    (i) =>
      i.tenKhoa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.maKhoa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.maCskcb.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentXml = useMemo(() => (bpcmItems.length > 0 ? generateBpcmXml(bpcmItems) : ''), [bpcmItems]);
  const currentBase64 = useMemo(() => (currentXml ? xmlToBase64(currentXml) : ''), [currentXml]);

  return (
    <div className="space-y-6">
      <BpcmStatsCards items={bpcmItems} />

      <BpcmDropzone
        isLoadingFile={isLoadingFile}
        fileUploadStats={fileUploadStats}
        itemsCount={bpcmItems.length}
        onFileUpload={handleFileUpload}
        onSwitchSheet={handleSwitchSheet}
        onDownloadTemplate={downloadBpcmExcelTemplate}
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

      {/* Reusable Inline Schema Mapping & Column Comparison */}
      <SchemaMappingCard
        title="Đối Soát Khớp Cột Chuẩn Mẫu 01/DM (Bộ Phận Chuyên Môn)"
        loaiHsBadge="Loại HS 70 - 11 Trường"
        schemaFields={BPCM_SCHEMA_FIELDS}
        matchedKeys={fileUploadStats?.matchedFields || BPCM_SCHEMA_FIELDS.map((f) => f.key)}
        matchedColumnsMap={fileUploadStats?.matchedColumnsMap || {}}
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
        defaultExpanded={!!fileUploadStats}
      />

      <BpcmTable
        items={filteredItems}
        searchTerm={searchTerm}
        totalCount={bpcmItems.length}
        onSearchChange={setSearchTerm}
        onEdit={(item) => {
          setEditingItem(item);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteItem}
      />

      <BpcmXmlModal
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        items={bpcmItems}
        xmlContent={currentXml}
        base64Content={currentBase64}
        tab={xmlExportTab}
        onTabChange={setXmlExportTab}
        isCopied={isCopied}
        onCopy={handleCopyText}
        onExportXml={handleExportXml}
        onSendApi={handleSendBhxhApi}
        isSendingApi={isSendingApi}
        apiResponse={apiResponse}
      />

      <BpcmEditModal
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
        title="Mẫu 01/DM: Bộ Phận Chuyên Môn (Khoa, Phòng, Bàn Khám & Giường Bệnh)"
        loaiHsBadge="Loại HS 70 - 11 Trường"
        schemaFields={BPCM_SCHEMA_FIELDS}
        matchedKeys={fileUploadStats?.matchedFields || BPCM_SCHEMA_FIELDS.map(f => f.key)}
        matchedColumnsMap={fileUploadStats?.matchedColumnsMap || {}}
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
      />
    </div>
  );
};

