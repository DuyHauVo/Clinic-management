import React, { useState, useMemo } from "react";
import type { DmTbytThdvItem } from "../../../types";
import {
  TBYTTHDV_SCHEMA_FIELDS,
  parseTbytThdvExcelFile,
  parseTbytThdvWorksheet,
  generateTbytThdvXml,
  xmlToBase64,
  downloadTbytThdvXmlFile,
  downloadTbytThdvExcelTemplate,
  sendTbytThdvToBhxhGateway,
  type ParseTbytThdvExcelResult,
  type SendTbytThdvGatewayResult,
} from "./services/tbyttHdvService";
import { initialTbytThdvData } from "../../../mock/mockData";
import { useToast } from "../../../context/ToastContext";
import { TbytThdvStatsCards } from "./components/TbytThdvStatsCards";
import { TbytThdvDropzone } from "./components/TbytThdvDropzone";
import { TbytThdvTable } from "./components/TbytThdvTable";
import { TbytThdvXmlModal } from "./components/TbytThdvXmlModal";
import { TbytThdvEditModal } from "./components/TbytThdvEditModal";
import { SchemaMappingModal } from "../common/SchemaMappingModal";
import { SchemaMappingCard } from "../common/SchemaMappingCard";
import { useClipboard } from "../../../hooks";

export const DmTbDvktTab: React.FC = () => {
  const toast = useToast();
  const { isCopied, copy: handleCopyText } = useClipboard();
  const [tbytItems, setTbytItems] =
    useState<DmTbytThdvItem[]>(initialTbytThdvData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadStats, setFileUploadStats] =
    useState<ParseTbytThdvExcelResult | null>(null);

  // Modal State for Mẫu 06/DM
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlExportTab, setXmlExportTab] = useState<"xml" | "base64" | "api">(
    "xml",
  );
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiResponse, setApiResponse] =
    useState<SendTbytThdvGatewayResult | null>(null);

  // Edit / Add Modal State for Mẫu 06/DM
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmTbytThdvItem | null>(null);

  // Schema Mapping Inspector Modal State
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const result = await parseTbytThdvExcelFile(file);
      console.log("result1", result);
      setTbytItems(result.items);
      setFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} thiết bị thực hiện DVKT từ file "${file.name}"\nSheet: "${result.selectedSheet}"`,
        "Nạp File Excel Mẫu 06 Thành Công",
      );
    } catch (err: any) {
      toast.error(
        err.message || "Lỗi đọc tệp Excel Thiết bị thực hiện DVKT!",
        "Lỗi Đọc File",
      );
    } finally {
      setIsLoadingFile(false);
      e.target.value = "";
    }
  };

  const handleSwitchSheet = (sheetName: string) => {
    if (!fileUploadStats?.workbook) return;
    try {
      const ws = fileUploadStats.workbook.Sheets[sheetName];
      const result = parseTbytThdvWorksheet(
        ws,
        sheetName,
        fileUploadStats.availableSheets,
        fileUploadStats.fileName,
        fileUploadStats.workbook,
      );
      setTbytItems(result.items);
      setFileUploadStats(result);
      toast.info(
        `Đã chuyển sang Sheet "${sheetName}" (${result.items.length} thiết bị)`,
        "Chuyển Sheet Dữ Liệu",
      );
    } catch (err: any) {
      toast.error(
        `Lỗi khi chuyển sang sheet "${sheetName}": ${err.message}`,
        "Lỗi Đọc Sheet",
      );
    }
  };

  const handleLoadSampleData = () => {
    setTbytItems(initialTbytThdvData);
    setFileUploadStats(null);
    toast.success(
      "Đã nạp dữ liệu danh mục TBYT thực hiện DVKT mẫu theo QĐ 3176/QĐ-BYT",
      "Nạp Dữ Liệu Mẫu",
    );
  };

  const handleClearData = () => {
    setTbytItems([]);
    setFileUploadStats(null);
    toast.info("Đã làm trống danh mục thiết bị thực hiện DVKT", "Đã Dọn Dẹp");
  };

  const handleSaveItem = (item: DmTbytThdvItem) => {
    if (editingItem) {
      setTbytItems(tbytItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(
        `Đã cập nhật thiết bị: ${item.tenTb}`,
        "Cập Nhật Thành Công",
      );
    } else {
      const newItem: DmTbytThdvItem = {
        ...item,
        id: `tbdv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stt: tbytItems.length + 1,
      };
      setTbytItems([...tbytItems, newItem]);
      toast.success(`Đã thêm thiết bị: ${item.tenTb}`, "Thêm Thành Công");
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (item: DmTbytThdvItem) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa thiết bị "${item.tenTb}" (Mã máy: ${item.maMay})?`,
      )
    ) {
      setTbytItems((prev) =>
        prev
          .filter((i) => i.id !== item.id)
          .map((i, idx) => ({ ...i, stt: idx + 1 })),
      );
      toast.info(`Đã xóa thiết bị: ${item.tenTb}`, "Đã Xóa");
    }
  };

  // XML & Base64 Generation
  const xmlContent = useMemo(() => {
    return generateTbytThdvXml(tbytItems);
  }, [tbytItems]);

  const base64Content = useMemo(() => {
    return xmlToBase64(xmlContent);
  }, [xmlContent]);

  const handleExportXml = () => {
    downloadTbytThdvXmlFile(xmlContent, `DanhMuc06_DMTBYT_${Date.now()}.xml`);
    toast.success(
      "Đã tải xuống tệp XML Mẫu 06/DM chuẩn Bộ Y tế & BHXH Việt Nam",
      "Xuất File Thành Công",
    );
  };

  const handleSendBhxhApi = async () => {
    setIsSendingApi(true);
    try {
      const res = await sendTbytThdvToBhxhGateway(tbytItems);
      setApiResponse(res);
      toast.success(
        `Đã gửi thành công ${res.totalRecords} thiết bị lên Cổng BHXH (Sandbox)\nMã GD: ${res.maGiaoDich}`,
        "Gửi Cổng Tiếp Nhận Thành Công",
      );
    } catch (err: any) {
      toast.error(`Lỗi gửi cổng BHXH: ${err.message}`, "Lỗi Giao Dịch");
    } finally {
      setIsSendingApi(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return tbytItems;
    return tbytItems.filter(
      (i) =>
        i.tenTb.toLowerCase().includes(q) ||
        i.maMay.toLowerCase().includes(q) ||
        (i.kyHieu && i.kyHieu.toLowerCase().includes(q)) ||
        (i.congTySx && i.congTySx.toLowerCase().includes(q)) ||
        (i.nuocSx && i.nuocSx.toLowerCase().includes(q)) ||
        (i.soLuuHanh && i.soLuuHanh.toLowerCase().includes(q)) ||
        (i.maCskcb && i.maCskcb.toLowerCase().includes(q)),
    );
  }, [tbytItems, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 1. Top 4 Metric KPI Cards */}
      <TbytThdvStatsCards items={tbytItems} />

      {/* 2. Excel Upload Dropzone & Action Toolbar */}
      <TbytThdvDropzone
        isLoadingFile={isLoadingFile}
        fileUploadStats={fileUploadStats}
        itemsCount={tbytItems.length}
        onFileUpload={handleFileUpload}
        onSwitchSheet={handleSwitchSheet}
        onDownloadTemplate={downloadTbytThdvExcelTemplate}
        onLoadSample={handleLoadSampleData}
        onClearData={handleClearData}
        onOpenXmlModal={() => {
          setXmlExportTab("xml");
          setIsXmlModalOpen(true);
        }}
        onOpenApiTab={() => {
          setXmlExportTab("api");
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
        schemaFields={TBYTTHDV_SCHEMA_FIELDS}
        matchedKeys={
          fileUploadStats
            ? Object.values(fileUploadStats.detectedHeaders)
            : TBYTTHDV_SCHEMA_FIELDS.map((f) => f.key)
        }
        matchedColumnsMap={
          fileUploadStats
            ? Object.fromEntries(
                Object.entries(fileUploadStats.detectedHeaders).map(
                  ([colIdx, key]) => [
                    key,
                    `Cột ${Number(colIdx) + 1} (${key})`,
                  ],
                ),
              )
            : {}
        }
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
        loaiHsBadge="Loại HS 72 - 14 Trường"
        title="Đặc Tả Cấu Trúc 14 Trường Danh Mục Thiết Bị Y Tế Thực Hiện DVKT (Mẫu 06/DM - Loại HS 72)"
        defaultExpanded={!!fileUploadStats}
      />

      {/* 4. Table of Medical Equipment */}
      <TbytThdvTable
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
      <TbytThdvEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      {/* 6. XML & Base64 Modal */}
      <TbytThdvXmlModal
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        items={tbytItems}
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
        title="Mẫu 06/DM: Danh Mục Thiết Bị Y Tế Thực Hiện Dịch Vụ Kỹ Thuật"
        loaiHsBadge="Loại HS 72 - 14 Trường"
        schemaFields={TBYTTHDV_SCHEMA_FIELDS}
        matchedKeys={
          fileUploadStats
            ? Object.values(fileUploadStats.detectedHeaders)
            : TBYTTHDV_SCHEMA_FIELDS.map((f) => f.key)
        }
        matchedColumnsMap={
          fileUploadStats
            ? Object.fromEntries(
                Object.entries(fileUploadStats.detectedHeaders).map(
                  ([colIdx, key]) => [
                    key,
                    `Cột ${Number(colIdx) + 1} (${key})`,
                  ],
                ),
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
