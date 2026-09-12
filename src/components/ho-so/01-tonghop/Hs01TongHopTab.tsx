import React, { useState, useMemo } from "react";
import type { Hs01TongHopItem } from "./services/hs01TongHopService";
import {
  HS01_SCHEMA_FIELDS,
  parseHs01ExcelFile,
  parseHs01Worksheet,
  downloadHs01ExcelTemplate,
  type ParseHs01ExcelResult,
  type SendHs01GatewayResult,
} from "./services/hs01TongHopService";
import { initialHs01TongHopData } from "../../../mock/mockData";
import { useToast } from "../../../context/ToastContext";
import {
  Hs01StatsCards,
  Hs01Dropzone,
  Hs01Table,
  Hs01EditModal,
  Hs01XmlModal,
  Hs01DetailModal,
} from "./components";
import { SchemaMappingModal } from "../../danh-muc/common/SchemaMappingModal";
import { SchemaMappingCard } from "../../danh-muc/common/SchemaMappingCard";
import { getTodayIsoDate } from "../../../utils/shared/excelXmlShared";

export const Hs01TongHopTab: React.FC = () => {
  const toast = useToast();
  const [items, setItems] = useState<Hs01TongHopItem[]>(initialHs01TongHopData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoaiKcb, setFilterLoaiKcb] = useState("all");
  const [filterTrangThai, setFilterTrangThai] = useState("all");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadStats, setFileUploadStats] =
    useState<ParseHs01ExcelResult | null>(null);

  // Modals
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlExportTab, setXmlExportTab] = useState<"xml" | "base64" | "api">(
    "xml",
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Hs01TongHopItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Hs01TongHopItem | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const result = await parseHs01ExcelFile(file);
      setItems(result.items);
      setFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} hồ sơ tổng hợp từ tệp "${file.name}"\nSheet: "${result.selectedSheet}"`,
        "Nạp File Excel Mẫu 01/BH Thành Công",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Lỗi đọc tệp Excel Hồ sơ tổng hợp!";
      toast.error(msg, "Lỗi Đọc File");
    } finally {
      setIsLoadingFile(false);
      e.target.value = "";
    }
  };

  const handleSwitchSheet = (sheetName: string) => {
    if (!fileUploadStats?.workbook) return;
    try {
      const ws = fileUploadStats.workbook.Sheets[sheetName];
      const result = parseHs01Worksheet(
        ws,
        sheetName,
        fileUploadStats.availableSheets,
        fileUploadStats.fileName,
        fileUploadStats.workbook,
      );
      setItems(result.items);
      setFileUploadStats(result);
      toast.info(
        `Đã chuyển sang Sheet "${sheetName}" (${result.items.length} hồ sơ)`,
        "Chuyển Sheet Dữ Liệu",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi chuyển sheet";
      toast.error(msg, "Lỗi Đọc Sheet");
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadHs01ExcelTemplate();
      toast.success(
        "Đã tải tệp Excel mẫu chuẩn 20 cột (Mẫu 01/BH) thành công!",
        "Tải File Mẫu",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tải tệp mẫu";
      toast.error(msg, "Lỗi");
    }
  };

  const handleLoadSample = () => {
    setItems(initialHs01TongHopData);
    setFileUploadStats(null);
    toast.info("Đã tải lại 5 hồ sơ tổng hợp mẫu chuẩn BHXH", "Nạp Dữ Liệu Mẫu");
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ danh sách hồ sơ 01/BH hiện tại?",
      )
    ) {
      setItems([]);
      setFileUploadStats(null);
      toast.warning(
        "Đã xóa toàn bộ dữ liệu bảng hồ sơ tổng hợp",
        "Xóa Dữ Liệu",
      );
    }
  };

  // CRUD
  const handleAddNew = () => {
    setEditingItem(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (item: Hs01TongHopItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: Hs01TongHopItem) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa hồ sơ của bệnh nhân "${item.hoTen}"?`,
      )
    ) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`Đã xóa hồ sơ bệnh nhân "${item.hoTen}"`, "Xóa Hồ Sơ");
    }
  };

  const handleSaveItem = (savedItem: Hs01TongHopItem) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id ? { ...savedItem, id: editingItem.id } : i,
        ),
      );
      toast.success(
        `Đã cập nhật hồ sơ bệnh nhân "${savedItem.hoTen}"`,
        "Cập Nhật Thành Công",
      );
    } else {
      const newItem: Hs01TongHopItem = {
        ...savedItem,
        id: `hs01-${Date.now()}`,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success(
        `Đã thêm mới hồ sơ bệnh nhân "${savedItem.hoTen}"`,
        "Thêm Mới Thành Công",
      );
    }
    setIsEditModalOpen(false);
  };

  const handleViewDetail = (item: Hs01TongHopItem) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

  const handleSendSuccess = (result: SendHs01GatewayResult) => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        trangThai: "da_gui_cong",
        ngayGuiCong: getTodayIsoDate(),
        maGiaoDichBhxh: result.maGiaoDich,
      })),
    );
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.hoTen.toLowerCase().includes(q) ||
        item.maTheBhyt.toLowerCase().includes(q) ||
        item.maBenhChinh.toLowerCase().includes(q) ||
        item.maCskcb.toLowerCase().includes(q);

      const matchType =
        filterLoaiKcb === "all" || item.maLoaiKcb === filterLoaiKcb;
      const matchStatus =
        filterTrangThai === "all" ||
        (filterTrangThai === "hop_le" &&
          item.isValid !== false &&
          item.trangThai !== "da_gui_cong") ||
        (filterTrangThai === "canh_bao" && item.isValid === false) ||
        (filterTrangThai === "da_gui_cong" && item.trangThai === "da_gui_cong");

      return matchSearch && matchType && matchStatus;
    });
  }, [items, searchTerm, filterLoaiKcb, filterTrangThai]);

  // Memoize matched headers for schema inspection
  const { matchedKeys, matchedColumnsMap } = useMemo(() => {
    if (!fileUploadStats) {
      return {
        matchedKeys: HS01_SCHEMA_FIELDS.map((f) => f.key),
        matchedColumnsMap: {} as Record<string, string>,
      };
    }
    return {
      matchedKeys: Object.values(fileUploadStats.detectedHeaders),
      matchedColumnsMap: Object.fromEntries(
        Object.entries(fileUploadStats.detectedHeaders).map(([colIdx, key]) => [
          key,
          `Cột ${Number(colIdx) + 1} (${key})`,
        ]),
      ),
    };
  }, [fileUploadStats]);

  return (
    <div className="space-y-6">
      {/* 1. Header KPIs */}
      <Hs01StatsCards items={items} />

      {/* 2. Dropzone & Action Toolbar */}
      <Hs01Dropzone
        isLoadingFile={isLoadingFile}
        fileUploadStats={fileUploadStats}
        itemsCount={items.length}
        onFileUpload={handleFileUpload}
        onSwitchSheet={handleSwitchSheet}
        onDownloadTemplate={handleDownloadTemplate}
        onLoadSample={handleLoadSample}
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
        onAddNew={handleAddNew}
      />

      {/* 3. Schema Mapping Card / Inspector */}
      <SchemaMappingCard
        schemaFields={HS01_SCHEMA_FIELDS}
        matchedKeys={matchedKeys}
        matchedColumnsMap={matchedColumnsMap}
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
        loaiHsBadge="Loại HS 5 - 20 Trường"
        title="Đặc Tả Cấu Trúc 20 Trường Hồ Sơ Tổng Hợp Chi Phí KCB (Mẫu 01/BH - XML <HSTH01BH> - Loại HS 5)"
        defaultExpanded={!!fileUploadStats}
      />
      {/* 4. Main Data Table */}
      <Hs01Table
        items={filteredItems}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterLoaiKcb={filterLoaiKcb}
        onFilterLoaiKcbChange={setFilterLoaiKcb}
        filterTrangThai={filterTrangThai}
        onFilterTrangThaiChange={setFilterTrangThai}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetail={handleViewDetail}
      />
      {/* MODALS */}
      {/* Edit / Add Modal */}
      <Hs01EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        totalItemsCount={items.length}
      />

      {/* Detail Modal */}
      <Hs01DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={detailItem}
      />

      {/* XML / Base64 / API Modal */}
      <Hs01XmlModal
        isOpen={isXmlModalOpen}
        onClose={() => setIsXmlModalOpen(false)}
        items={items}
        activeTab={xmlExportTab}
        onSendSuccess={handleSendSuccess}
      />

      {/* Schema Mapping Modal */}
      <SchemaMappingModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        schemaFields={HS01_SCHEMA_FIELDS}
        matchedKeys={matchedKeys}
        matchedColumnsMap={matchedColumnsMap}
        sheetName={fileUploadStats?.selectedSheet}
        fileName={fileUploadStats?.fileName}
        totalRows={fileUploadStats?.totalRows}
        loaiHsBadge="Loại HS 5 - 20 Trường"
        title="Đặc Tả Kỹ Thuật 20 Cột Chuẩn Mẫu 01/BH (XML <HSTH01BH> - Loại HS 5)"
      />
    </div>
  );
};
