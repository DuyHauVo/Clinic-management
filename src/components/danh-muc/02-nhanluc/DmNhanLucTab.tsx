import React, { useState, useMemo } from 'react';
import type { DmNhanLucItem } from '../../../types';
import {
  NHANLUC_SCHEMA_FIELDS,
  parseNhanLucExcelFile,
  parseNhanLucWorksheet,
  generateNhanLucXml,
  xmlToBase64,
  downloadNhanLucXmlFile,
  downloadNhanLucExcelTemplate,
  sendNhanLucToBhxhGateway,
  type ParseNhanLucExcelResult
} from './services/nhanLucService';
import { initialNhanLucData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { NhanLucStatsCards } from './components/NhanLucStatsCards';
import { NhanLucDropzone } from './components/NhanLucDropzone';
import { NhanLucTable } from './components/NhanLucTable';
import { NhanLucXmlModal } from './components/NhanLucXmlModal';
import { NhanLucEditModal } from './components/NhanLucEditModal';
import { SchemaMappingModal } from '../common/SchemaMappingModal';
import { SchemaMappingCard } from '../common/SchemaMappingCard';

import { useClipboard } from '../../../hooks';

export const DmNhanLucTab: React.FC = () => {
  const toast = useToast();
  const { isKeyCopied: isNhanLucKeyCopied, copy: handleNhanLucCopyText } = useClipboard();
  const [nhanLucItems, setNhanLucItems] = useState<DmNhanLucItem[]>(initialNhanLucData);
  const [searchNhanLuc, setSearchNhanLuc] = useState('');
  const [isLoadingNhanLucFile, setIsLoadingNhanLucFile] = useState(false);
  const [nhanLucFileUploadStats, setNhanLucFileUploadStats] = useState<ParseNhanLucExcelResult | null>(null);

  // Modal State for Mẫu 02/DM
  const [isNhanLucXmlModalOpen, setIsNhanLucXmlModalOpen] = useState(false);
  const [nhanLucXmlExportTab, setNhanLucXmlExportTab] = useState<'xml' | 'base64' | 'api'>('xml');
  const [isNhanLucSendingApi, setIsNhanLucSendingApi] = useState(false);
  const [nhanLucApiResponse, setNhanLucApiResponse] = useState<any>(null);

  // Edit / Add Modal State for Mẫu 02/DM
  const [isNhanLucEditModalOpen, setIsNhanLucEditModalOpen] = useState(false);
  const [editingNhanLucItem, setEditingNhanLucItem] = useState<DmNhanLucItem | null>(null);

  // Schema Mapping Inspector Modal State
  const [isNhanLucSchemaModalOpen, setIsNhanLucSchemaModalOpen] = useState(false);

  // File Upload Handler
  const handleNhanLucFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingNhanLucFile(true);
    try {
      const result = await parseNhanLucExcelFile(file);
      setNhanLucItems(result.items);
      setNhanLucFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} nhân sự từ file "${file.name}"\nSheet: "${result.selectedSheet}"`,
        'Nạp File Excel Nhân Lực Thành Công'
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel Nhân Lực!', 'Lỗi Đọc File');
    } finally {
      setIsLoadingNhanLucFile(false);
      e.target.value = '';
    }
  };

  const handleNhanLucSwitchSheet = (sheetName: string) => {
    if (!nhanLucFileUploadStats?.workbook) return;
    try {
      const ws = nhanLucFileUploadStats.workbook.Sheets[sheetName];
      const result = parseNhanLucWorksheet(
        ws,
        sheetName,
        nhanLucFileUploadStats.availableSheets,
        nhanLucFileUploadStats.fileName,
        nhanLucFileUploadStats.workbook
      );
      setNhanLucItems(result.items);
      setNhanLucFileUploadStats(result);
      toast.info(`Đã chuyển sang Sheet "${sheetName}" (${result.items.length} nhân sự)`, 'Chuyển Sheet Dữ Liệu');
    } catch (err: any) {
      toast.error(`Lỗi khi chuyển sang sheet "${sheetName}": ${err.message}`, 'Lỗi Đọc Sheet');
    }
  };

  const handleNhanLucLoadSampleData = () => {
    setNhanLucItems(initialNhanLucData);
    setNhanLucFileUploadStats(null);
    toast.success('Đã nạp dữ liệu danh mục nhân lực mẫu gồm các nhân sự chuẩn', 'Nạp Dữ Liệu Mẫu');
  };

  const handleNhanLucClearData = () => {
    setNhanLucItems([]);
    setNhanLucFileUploadStats(null);
    toast.info('Đã làm trống danh mục nhân lực', 'Đã Dọn Dẹp');
  };

  const handleSaveNhanLucItem = (item: DmNhanLucItem) => {
    if (editingNhanLucItem) {
      setNhanLucItems(nhanLucItems.map((i) => (i.id === editingNhanLucItem.id ? item : i)));
      toast.success(`Đã cập nhật nhân sự: ${item.hoTen}`, 'Cập Nhật Thành Công');
    } else {
      const newItem = {
        ...item,
        id: `nl-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stt: nhanLucItems.length + 1
      };
      setNhanLucItems([...nhanLucItems, newItem]);
      toast.success(`Đã thêm nhân sự: ${item.hoTen}`, 'Thêm Thành Công');
    }
    setIsNhanLucEditModalOpen(false);
    setEditingNhanLucItem(null);
  };

  const handleDeleteNhanLucItem = (item: DmNhanLucItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân sự "${item.hoTen}" (${item.soDinhDanh})?`)) {
      setNhanLucItems(nhanLucItems.filter((i) => i.id !== item.id));
      toast.info(`Đã xóa nhân sự: ${item.hoTen}`, 'Đã Xóa');
    }
  };

  const handleNhanLucExportXml = () => {
    if (nhanLucItems.length === 0) {
      toast.warning('Chưa có dữ liệu nhân lực để xuất XML!', 'Dữ Liệu Trống');
      return;
    }
    const xml = generateNhanLucXml(nhanLucItems);
    downloadNhanLucXmlFile(xml);
    toast.success('Đã tải xuống file XML Mẫu 02/DM chuẩn Loại hồ sơ 71', 'Xuất File Thành Công');
  };

  const handleNhanLucSendBhxhApi = async () => {
    if (nhanLucItems.length === 0) {
      toast.warning('Chưa có dữ liệu để gửi cổng BHXH!', 'Dữ Liệu Trống');
      return;
    }
    setIsNhanLucSendingApi(true);
    try {
      const res = await sendNhanLucToBhxhGateway(nhanLucItems);
      setNhanLucApiResponse(res);
      toast.success(`[Sandbox] Cổng tiếp nhận thành công! Mã GD: ${res.maGiaoDich}`, 'Gửi API Thành Công (Mô phỏng)');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối Cổng BHXH', 'Gửi Thất Bại');
    } finally {
      setIsNhanLucSendingApi(false);
    }
  };

  const filteredNhanLucItems = nhanLucItems.filter((i) => {
    const q = searchNhanLuc.toLowerCase();
    return (
      i.hoTen.toLowerCase().includes(q) ||
      i.soDinhDanh.toLowerCase().includes(q) ||
      i.maKhoa.toLowerCase().includes(q) ||
      (i.macchn && i.macchn.toLowerCase().includes(q)) ||
      (i.phamviCm && i.phamviCm.toLowerCase().includes(q))
    );
  });

  const currentNhanLucXml = useMemo(() => (nhanLucItems.length > 0 ? generateNhanLucXml(nhanLucItems) : ''), [nhanLucItems]);
  const currentNhanLucBase64 = useMemo(() => (currentNhanLucXml ? xmlToBase64(currentNhanLucXml) : ''), [currentNhanLucXml]);

  return (
    <div className="space-y-6">
      <NhanLucStatsCards items={nhanLucItems} />

      <NhanLucDropzone
        isLoadingFile={isLoadingNhanLucFile}
        fileUploadStats={nhanLucFileUploadStats}
        itemsCount={nhanLucItems.length}
        onFileUpload={handleNhanLucFileUpload}
        onSwitchSheet={handleNhanLucSwitchSheet}
        onDownloadTemplate={downloadNhanLucExcelTemplate}
        onLoadSample={handleNhanLucLoadSampleData}
        onClearData={handleNhanLucClearData}
        onOpenXmlModal={() => setIsNhanLucXmlModalOpen(true)}
        onOpenApiTab={() => {
          setIsNhanLucXmlModalOpen(true);
          setNhanLucXmlExportTab('api');
        }}
        onOpenSchemaModal={() => setIsNhanLucSchemaModalOpen(true)}
        onAddNew={() => {
          setEditingNhanLucItem(null);
          setIsNhanLucEditModalOpen(true);
        }}
      />

      {/* Reusable Inline Schema Mapping & Column Comparison for Nhân Lực */}
      <SchemaMappingCard
        title="Đối Soát Khớp Cột Chuẩn Mẫu 02/DM (Nhân Lực KCB BHYT)"
        loaiHsBadge="Loại HS 71 - 24 Trường"
        schemaFields={NHANLUC_SCHEMA_FIELDS}
        matchedKeys={
          nhanLucFileUploadStats
            ? nhanLucFileUploadStats.recognizedColumns.map((c) => c.key)
            : NHANLUC_SCHEMA_FIELDS.map((f) => f.key)
        }
        matchedColumnsMap={
          nhanLucFileUploadStats
            ? Object.fromEntries(nhanLucFileUploadStats.recognizedColumns.map((c) => [c.key, c.colName]))
            : {}
        }
        sheetName={nhanLucFileUploadStats?.selectedSheet || nhanLucFileUploadStats?.sheetName}
        fileName={nhanLucFileUploadStats?.fileName}
        totalRows={nhanLucFileUploadStats?.totalRows}
        defaultExpanded={!!nhanLucFileUploadStats}
      />

      <NhanLucTable
        items={filteredNhanLucItems}
        searchTerm={searchNhanLuc}
        totalCount={nhanLucItems.length}
        onSearchChange={setSearchNhanLuc}
        onEdit={(item) => {
          setEditingNhanLucItem(item);
          setIsNhanLucEditModalOpen(true);
        }}
        onDelete={handleDeleteNhanLucItem}
      />

      <NhanLucXmlModal
        isOpen={isNhanLucXmlModalOpen}
        onClose={() => setIsNhanLucXmlModalOpen(false)}
        items={nhanLucItems}
        xmlContent={currentNhanLucXml}
        base64Content={currentNhanLucBase64}
        tab={nhanLucXmlExportTab}
        onTabChange={setNhanLucXmlExportTab}
        isKeyCopied={isNhanLucKeyCopied}
        onCopy={handleNhanLucCopyText}
        onExportXml={handleNhanLucExportXml}
        onSendApi={handleNhanLucSendBhxhApi}
        isSendingApi={isNhanLucSendingApi}
        apiResponse={nhanLucApiResponse}
      />

      <NhanLucEditModal
        isOpen={isNhanLucEditModalOpen}
        onClose={() => {
          setIsNhanLucEditModalOpen(false);
          setEditingNhanLucItem(null);
        }}
        onSave={handleSaveNhanLucItem}
        initialData={editingNhanLucItem}
      />

      {/* Reusable Schema Inspector Modal for Mẫu 02/DM */}
      <SchemaMappingModal
        isOpen={isNhanLucSchemaModalOpen}
        onClose={() => setIsNhanLucSchemaModalOpen(false)}
        title="Mẫu 02/DM: Danh Mục Nhân Lực KCB BHYT (Cán Bộ & Bác Sỹ)"
        loaiHsBadge="Loại HS 71 - 24 Trường"
        schemaFields={NHANLUC_SCHEMA_FIELDS}
        matchedKeys={
          nhanLucFileUploadStats
            ? nhanLucFileUploadStats.recognizedColumns.map((c) => c.key)
            : NHANLUC_SCHEMA_FIELDS.map((f) => f.key)
        }
        matchedColumnsMap={
          nhanLucFileUploadStats
            ? Object.fromEntries(nhanLucFileUploadStats.recognizedColumns.map((c) => [c.key, c.colName]))
            : {}
        }
        sheetName={nhanLucFileUploadStats?.selectedSheet || nhanLucFileUploadStats?.sheetName}
        fileName={nhanLucFileUploadStats?.fileName}
        totalRows={nhanLucFileUploadStats?.totalRows}
      />
    </div>
  );
};
