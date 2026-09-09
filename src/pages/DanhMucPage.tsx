import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  FileCode,
  Upload,
  Download,
  Send,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Search,
  Database,
  Users,
  Pill,
  Cpu,
  Stethoscope,
  Wrench,
  Sparkles,
  Building2,
  ShieldCheck
} from 'lucide-react';
import type {
  DmBpcmItem,
  DmNhanLucItem,
  DmThuocItem,
  DmThietBiItem,
  DmDichVuItem,
  DmTbDvktItem
} from '../types';
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
} from '../utils/bpcmXmlEngine';
import {
  initialBpcmData,
  initialNhanLucData,
  initialThuocData,
  initialThietBiData,
  initialDichVuData,
  initialTbDvktData
} from '../mock/mockData';
import { useToast } from '../context/ToastContext';

type CatalogTab = '01_bpcm' | '02_nhanluc' | '03_thuoc' | '04_thietbi' | '05_dichvu' | '06_tbdvkt';

export const DanhMucPage: React.FC = () => {
  const toast = useToast();
  const [activeCatalogTab, setActiveCatalogTab] = useState<CatalogTab>('01_bpcm');

  // State Mẫu 01/DM (BPCM) - Không fix cứng dữ liệu, hoàn toàn trích xuất từ file Excel người dùng tải lên
  const [bpcmItems, setBpcmItems] = useState<DmBpcmItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileUploadStats, setFileUploadStats] = useState<ParseExcelResult | null>(null);

  // Modal State for Mẫu 01/DM
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlExportTab, setXmlExportTab] = useState<'xml' | 'base64' | 'api'>('xml');
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Edit / Add Modal State for BPCM
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmBpcmItem | null>(null);

  // Other catalogs state
  const [nhanLucItems] = useState<DmNhanLucItem[]>(initialNhanLucData);
  const [thuocItems] = useState<DmThuocItem[]>(initialThuocData);
  const [thietBiItems] = useState<DmThietBiItem[]>(initialThietBiData);
  const [dichVuItems] = useState<DmDichVuItem[]>(initialDichVuData);
  const [tbDvktItems] = useState<DmTbDvktItem[]>(initialTbDvktData);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // HANDLERS: MẪU 01/DM (BPCM)
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const result = await parseBpcmExcelFile(file, '01929');
      setBpcmItems(result.items);
      setFileUploadStats(result);
      toast.success(
        `Đã nạp thành công ${result.items.length} bản ghi từ tệp "${file.name}"\nSheet đang chọn: "${result.selectedSheet}"`,
        'Nạp File Excel Thành Công'
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel!', 'Lỗi Đọc File');
    } finally {
      setIsLoadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleExportXml = () => {
    if (bpcmItems.length === 0) {
      toast.warning('Chưa có dữ liệu danh mục! Vui lòng nạp tệp Excel từ máy tính trước khi xuất file XML.', 'Chưa Có Dữ Liệu');
      return;
    }
    const xml = generateBpcmXml(bpcmItems);
    downloadXmlFile(xml, `DM_BPCM_Loai70_${Date.now()}.xml`);
    toast.success(`Đã xuất file XML Mẫu 01/DM (${bpcmItems.length} bản ghi) về máy tính!`, 'Xuất File XML');
  };

  const handleLoadSampleData = () => {
    setBpcmItems(initialBpcmData);
    setFileUploadStats({
      items: initialBpcmData,
      matchedFields: ['STT', 'MA_KHOA', 'TEN_KHOA', 'BAN_KHAM', 'GIUONG_PD', 'GIUONG_TK', 'GIUONG_HSTC', 'GIUONG_HSCC', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB'],
      missingFields: [],
      totalRows: initialBpcmData.length,
      validRows: initialBpcmData.length,
      invalidRows: 0,
      fileName: 'DuLieuMau_BPCM_01DM.xlsx (Dữ liệu mẫu thử nghiệm)',
      sheets: [{ name: 'DM_BPCM_Loai70', rowCount: initialBpcmData.length, matchedColumnCount: 11, isBestMatch: true }],
      selectedSheet: 'DM_BPCM_Loai70'
    });
    toast.info('Đã nạp 5 bản ghi mẫu danh mục BPCM để thử nghiệm giao diện.', 'Nạp Dữ Liệu Mẫu');
  };

  const handleClearData = () => {
    toast.showConfirm({
      title: 'Xác Nhận Xóa Dữ Liệu',
      content: 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại để nạp file Excel mới?',
      okText: 'Xóa Dữ Liệu',
      cancelText: 'Giữ Lại',
      danger: true,
      onOk: () => {
        setBpcmItems([]);
        setFileUploadStats(null);
        toast.info('Đã xóa dữ liệu danh mục hiện tại. Bạn có thể nạp file Excel mới.', 'Đã Làm Trống Bảng');
      }
    });
  };

  const handleSaveBpcmItem = (item: DmBpcmItem) => {
    if (editingItem && editingItem.id) {
      setBpcmItems(bpcmItems.map(i => i.id === editingItem.id ? item : i));
      toast.success(`Đã cập nhật thông tin khoa "${item.tenKhoa}" (${item.maKhoa})`, 'Lưu Thành Công');
    } else {
      const newItem: DmBpcmItem = {
        ...item,
        id: `bpcm-${Date.now()}`,
        stt: bpcmItems.length + 1,
        isValid: true,
        errors: []
      };
      setBpcmItems([...bpcmItems, newItem]);
      toast.success(`Đã thêm mới bộ phận chuyên môn "${item.tenKhoa}" (${item.maKhoa})`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteBpcmItem = (id?: string) => {
    if (!id) return;
    const target = bpcmItems.find(i => i.id === id);
    toast.showConfirm({
      title: 'Xóa Bộ Phận Chuyên Môn',
      content: `Bạn có chắc chắn muốn xóa khoa "${target?.tenKhoa || id}" khỏi danh mục?`,
      okText: 'Xác Nhận Xóa',
      cancelText: 'Hủy',
      danger: true,
      onOk: () => {
        setBpcmItems(bpcmItems.filter(i => i.id !== id));
        toast.success('Đã xóa bộ phận chuyên môn thành công.', 'Đã Xóa');
      }
    });
  };

  const handleSendBhxhApi = async () => {
    if (bpcmItems.length === 0) {
      toast.warning('Chưa có dữ liệu danh mục để gửi! Vui lòng nạp tệp Excel trước.', 'Chưa Có Dữ Liệu');
      return;
    }
    setIsSendingApi(true);
    try {
      const res = await sendBpcmToBhxhGateway(bpcmItems, '01929');
      setApiResponse(res);
      toast.success(
        `Mã giao dịch: ${res.maGiaoDich}\nThời gian: ${res.thoiGianTiepNhan}\n${res.thongDiep}`,
        'Gửi Cổng BHXH Tiếp Nhận Thành Công'
      );
    } catch (e: any) {
      toast.error('Lỗi gửi API: ' + e.message, 'Lỗi Kết Nối Cổng');
    } finally {
      setIsSendingApi(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Đã sao chép nội dung vào bộ nhớ tạm (Clipboard)!', 'Đã Sao Chép');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filtered items
  const filteredBpcmItems = bpcmItems.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.maKhoa.toLowerCase().includes(q) ||
      item.tenKhoa.toLowerCase().includes(q) ||
      item.maCskcb.toLowerCase().includes(q)
    );
  });

  const totalBedsPd = bpcmItems.reduce((sum, i) => sum + i.giuongPd, 0);
  const totalBedsTk = bpcmItems.reduce((sum, i) => sum + i.giuongTk, 0);
  const totalExamTables = bpcmItems.reduce((sum, i) => sum + i.banKham, 0);
  const validItemsCount = bpcmItems.filter(i => i.isValid !== false).length;

  const currentXml = generateBpcmXml(bpcmItems);
  const currentBase64 = xmlToBase64(currentXml);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner / Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1677ff] text-xs font-bold tracking-wide">
            <Database size={13} />
            HỆ THỐNG DANH MỤC DÙNG CHUNG KCB BHYT
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Danh Mục Khám Chữa Bệnh BHYT
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl">
            Chuẩn hóa 6 bộ biểu mẫu danh mục y tế theo quy định Bộ Y tế & Cổng tiếp nhận Giám định BHYT Việt Nam (Mẫu 01/DM đến 06/DM).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 self-start lg:self-auto">
          <div className="px-3 border-r border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Mã CSKCB</span>
            <span className="text-sm font-extrabold font-mono text-slate-900">01929</span>
          </div>
          <div className="px-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Cổng EGW</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sẵn Sàng
            </span>
          </div>
        </div>
      </div>

      {/* 6 Catalog Tabs Navigation (Ant Design Segmented Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { id: '01_bpcm', label: '01/DM: Bộ Phận Chuyên Môn', sub: 'Loại 70 • ' + bpcmItems.length + ' khoa', icon: Building2, featured: true },
          { id: '02_nhanluc', label: '02/DM: Nhân Lực Y Tế', sub: 'Loại 71 • ' + nhanLucItems.length + ' NV', icon: Users },
          { id: '03_thuoc', label: '03/DM: Thuốc & Chế Phẩm', sub: 'Loại 10 • ' + thuocItems.length + ' thuốc', icon: Pill },
          { id: '04_thietbi', label: '04/DM: Thiết Bị Y Tế', sub: 'Loại 72 • ' + thietBiItems.length + ' TBYT', icon: Cpu },
          { id: '05_dichvu', label: '05/DM: Dịch Vụ Kỹ Thuật', sub: 'Loại 12 • ' + dichVuItems.length + ' DVKT', icon: Stethoscope },
          { id: '06_tbdvkt', label: '06/DM: TBYT Theo DVKT', sub: 'Loại 73 • Định mức', icon: Wrench },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCatalogTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCatalogTab(tab.id as CatalogTab)}
              className={`p-3.5 rounded-xl text-left border transition-all duration-150 relative flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-[#1677ff] shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-50 text-[#1677ff]' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon size={16} />
                </div>
                {tab.featured && (
                  <span className="text-[10px] bg-blue-100 text-[#1677ff] font-bold px-1.5 py-0.5 rounded">
                    Trọng tâm
                  </span>
                )}
              </div>
              <div>
                <div className={`text-xs font-bold leading-snug ${isActive ? 'text-[#1677ff]' : 'text-slate-800'}`}>
                  {tab.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{tab.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ============================================================
          TAB CONTENT: MẪU 01/DM - BỘ PHẬN CHUYÊN MÔN (LOẠI HS 70)
      ============================================================ */}
      {activeCatalogTab === '01_bpcm' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Khoa / Đơn Nguyên</span>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{bpcmItems.length}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
                <Stethoscope size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bàn Khám Ngoại Trú</span>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalExamTables} bàn</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Giường PD / Thực Kê</span>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">{totalBedsPd} / {totalBedsTk}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                <FileCode size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cú Pháp XML Loại 70</span>
                <div className="text-2xl font-black text-indigo-600 tracking-tight">
                  {validItemsCount}/{bpcmItems.length} (100%)
                </div>
              </div>
            </div>
          </div>

          {/* Import / Export & File Dropzone Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            {/* Upload Dropzone */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-[#1677ff] bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1677ff] flex-shrink-0 border border-blue-100">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {isLoadingFile ? 'Đang đọc và phân tích file Excel...' : 'Nạp Tệp Excel Danh Mục BPCM Từ Máy Tính'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kéo thả hoặc nhấp để chọn file <code className="bg-blue-100 text-[#1677ff] px-1.5 py-0.5 rounded font-mono text-[11px]">.xlsx</code>, <code className="bg-blue-100 text-[#1677ff] px-1.5 py-0.5 rounded font-mono text-[11px]">.xls</code>, <code className="bg-blue-100 text-[#1677ff] px-1.5 py-0.5 rounded font-mono text-[11px]">.csv</code>. Tự động đối soát 11 trường dữ liệu chuẩn.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-4 py-2.5 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-colors flex-shrink-0"
                  disabled={isLoadingFile}
                >
                  <Upload size={15} />
                  <span>Chọn Tệp Từ Máy</span>
                </button>
              </div>

              {/* Upload stats feedback & Multi-sheet switcher */}
              {fileUploadStats && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-slate-500">File đã nạp: <strong className="text-slate-900 font-bold">{fileUploadStats.fileName}</strong></span>
                      <span className="text-slate-500">Dòng trích xuất: <strong className="text-emerald-700 font-bold">{fileUploadStats.totalRows} dòng</strong></span>
                      <span className="text-slate-500">Cột khớp chuẩn: <strong className="text-[#1677ff] font-bold">{fileUploadStats.matchedFields.length}/11 trường</strong></span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-[11px]">
                      <CheckCircle2 size={13} />
                      <span>XML sinh động 100% từ dữ liệu Excel vừa nạp</span>
                    </div>
                  </div>

                  {/* Multi-Sheet Selector (if file has multiple sheets) */}
                  {fileUploadStats.sheets && fileUploadStats.sheets.length > 1 && (
                    <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1">
                        <FileSpreadsheet size={14} className="text-[#1677ff]" />
                        Chọn Sheet đọc dữ liệu ({fileUploadStats.sheets.length} sheets):
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {fileUploadStats.sheets.map((sheet) => {
                          const isSelected = fileUploadStats.selectedSheet === sheet.name;
                          return (
                            <button
                              key={sheet.name}
                              type="button"
                              onClick={() => handleSwitchSheet(sheet.name)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                isSelected
                                  ? 'bg-[#1677ff] text-white border-[#1677ff] shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span>{sheet.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {sheet.rowCount} dòng
                              </span>
                              {isSelected && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Action Toolbar Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={downloadBpcmExcelTemplate}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
                title="Tải tệp mẫu Excel có định dạng 11 cột để nhập liệu"
              >
                <FileSpreadsheet size={15} className="text-emerald-600" />
                <span>Tải Mẫu Excel (XLSX)</span>
              </button>

              <button
                type="button"
                onClick={handleExportXml}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
                title="Xuất file XML chuẩn cấu trúc Loại 70"
              >
                <Download size={15} className="text-blue-600" />
                <span>Xuất File XML (Loại 70)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsXmlModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
                title="Xem XML và chuỗi Base64 để ký số"
              >
                <FileCode size={15} className="text-indigo-600" />
                <span>Xem XML & Base64 Ký Số</span>
              </button>

              <button
                type="button"
                onClick={handleSendBhxhApi}
                disabled={isSendingApi}
                className="px-4 py-2 rounded-xl bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-colors ml-auto"
                title="Gửi danh mục lên cổng tiếp nhận BHXH"
              >
                <Send size={15} />
                <span>{isSendingApi ? 'Đang gửi Cổng EGW...' : 'Gửi Cổng BHXH (POST)'}</span>
              </button>
            </div>
          </div>

          {/* 11 Fields Schema Inspection Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sparkles size={16} className="text-amber-500" />
                <span>11 Trường Dữ Liệu Chuẩn BHXH (Mẫu 01/DM - Loại HS 70)</span>
                {fileUploadStats && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    fileUploadStats.matchedFields.length === 11
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {fileUploadStats.matchedFields.length === 11
                      ? '✓ Khớp hoàn hảo 11/11 trường'
                      : `Khớp ${fileUploadStats.matchedFields.length}/11 trường`}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {BPCM_SCHEMA_FIELDS.map(field => {
                const isMatched = fileUploadStats?.matchedFields.includes(field.key);
                const isMaCsAuto = !isMatched && field.key === 'MA_CSKCB' && fileUploadStats;
                const isDenNgayOpt = !isMatched && field.key === 'DEN_NGAY' && fileUploadStats;

                let cardBg = 'bg-slate-50 border-slate-200/70 text-slate-700';
                let statusBadge = <span className="text-[10px] text-slate-400 font-medium">Chờ nạp</span>;

                if (fileUploadStats) {
                  if (isMatched) {
                    cardBg = 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900';
                    statusBadge = (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Check size={10} /> Khớp
                      </span>
                    );
                  } else if (isMaCsAuto) {
                    cardBg = 'bg-blue-50/60 border-blue-200/80 text-blue-900';
                    statusBadge = (
                      <span className="text-[10px] bg-blue-100 text-[#1677ff] font-bold px-1.5 py-0.2 rounded" title="Tự động lấy mã cơ sở mặc định 01929">
                        Mã CS: 01929
                      </span>
                    );
                  } else if (isDenNgayOpt) {
                    cardBg = 'bg-slate-50 border-slate-200 text-slate-600';
                    statusBadge = (
                      <span className="text-[10px] bg-slate-200/80 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                        Tùy chọn
                      </span>
                    );
                  } else {
                    cardBg = 'bg-amber-50/60 border-amber-200/80 text-amber-900';
                    statusBadge = (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <AlertTriangle size={10} /> Chưa có cột
                      </span>
                    );
                  }
                }

                return (
                  <div key={field.key} className={`p-2.5 rounded-xl border transition-colors flex flex-col justify-between ${cardBg}`}>
                    <div className="flex items-center justify-between font-mono text-xs font-extrabold mb-1">
                      <span>{field.key}</span>
                      {statusBadge}
                    </div>
                    <span className="text-[11px] text-slate-500 truncate" title={field.desc}>
                      {field.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã khoa, Tên khoa/bàn khám, Mã CSKCB..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                {bpcmItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearData}
                    className="px-3 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Xóa dữ liệu hiện tại để nạp file Excel mới"
                  >
                    <Trash2 size={14} />
                    <span>Xóa Dữ Liệu</span>
                  </button>
                )}

                {bpcmItems.length === 0 && (
                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Nạp dữ liệu mẫu thử nghiệm để xem trước"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Nạp Dữ Liệu Mẫu (Demo)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={15} />
                  <span>Thêm BPCM</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-center w-12">STT</th>
                    <th className="py-3 px-4 w-28">MÃ KHOA</th>
                    <th className="py-3 px-4">TÊN KHOA / PHÒNG / BÀN KHÁM</th>
                    <th className="py-3 px-4 text-center w-24">BÀN KHÁM</th>
                    <th className="py-3 px-4 text-center w-24">GIƯỜNG PD</th>
                    <th className="py-3 px-4 text-center w-24">GIƯỜNG TK</th>
                    <th className="py-3 px-4 text-center w-20">HSTC</th>
                    <th className="py-3 px-4 text-center w-20">HSCC</th>
                    <th className="py-3 px-4 w-24">TỪ NGÀY</th>
                    <th className="py-3 px-4 w-24">ĐẾN NGÀY</th>
                    <th className="py-3 px-4 w-20">MÃ CS</th>
                    <th className="py-3 px-4 text-center w-24">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBpcmItems.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-16 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1677ff] flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
                            <FileSpreadsheet size={32} />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                              Chưa Có Dữ Liệu Danh Mục BPCM Từ File Excel
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Vui lòng tải lên file Excel <code className="bg-slate-100 text-[#1677ff] px-1 py-0.5 rounded font-mono">.xlsx</code> từ máy tính của bạn. Dữ liệu bảng và file XML sẽ được trích xuất hoàn toàn tự động từ file bạn nạp.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
                            >
                              <Upload size={14} />
                              <span>Nạp File Excel Ngay</span>
                            </button>

                            <button
                              type="button"
                              onClick={downloadBpcmExcelTemplate}
                              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs"
                            >
                              <Download size={14} className="text-emerald-600" />
                              <span>Tải Mẫu Excel 11 Cột</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleLoadSampleData}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                            >
                              <Sparkles size={13} className="text-amber-500" />
                              <span>Xem Thử Dữ Liệu Mẫu</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBpcmItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">{item.stt}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-[#1677ff] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {item.maKhoa}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.tenKhoa}</div>
                          {item.errors && item.errors.length > 0 && (
                            <div className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
                              <AlertTriangle size={12} /> {item.errors.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">{item.banKham}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{item.giuongPd}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{item.giuongTk}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{item.giuongHstc}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{item.giuongHscc}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{item.tuNgay}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{item.denNgay || '-'}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.maCskcb}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBpcmItem(item.id)}
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị <strong>{filteredBpcmItems.length}</strong> / <strong>{bpcmItems.length}</strong> bản ghi danh mục</span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                Cấu trúc chuẩn XML &lt;DANHSACH_DMBOPHANCHUYENMON&gt; kèm chữ ký &lt;CHUKYDONVI&gt;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB CONTENT: MẪU 02/DM - NHÂN LỰC THỰC HIỆN KCB (LOẠI 71)
      ============================================================ */}
      {activeCatalogTab === '02_nhanluc' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-bold text-slate-800">Danh Sách Bác Sĩ / Người Hành Nghề Khám Chữa Bệnh BHYT</span>
            <button type="button" className="px-3 py-1.5 bg-[#1677ff] text-white rounded-lg text-xs font-bold">
              + Thêm Nhân Lực
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">MÃ NV</th>
                  <th className="py-3 px-4">HỌ VÀ TÊN</th>
                  <th className="py-3 px-4">SỐ CCHN</th>
                  <th className="py-3 px-4">PHẠM VI CHUYÊN MÔN</th>
                  <th className="py-3 px-4">KHOA PHÒNG</th>
                  <th className="py-3 px-4">VỊ TRÍ</th>
                  <th className="py-3 px-4">CHẾ ĐỘ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nhanLucItems.map((nl) => (
                  <tr key={nl.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{nl.stt}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1677ff]">{nl.maNhanVien}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{nl.hoTen}</td>
                    <td className="py-3 px-4 font-mono">{nl.soCchn}</td>
                    <td className="py-3 px-4">{nl.phamViChuyenMon}</td>
                    <td className="py-3 px-4 font-medium">{nl.tenKhoa}</td>
                    <td className="py-3 px-4">{nl.viTri}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        {nl.thoiGianLamViec}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB CONTENT: MẪU 03/DM - THUỐC & CHẾ PHẨM (LOẠI 10)
      ============================================================ */}
      {activeCatalogTab === '03_thuoc' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-bold text-slate-800">Danh Mục Thuốc & Chế Phẩm Áp Dụng Thanh Toán BHYT</span>
            <button type="button" className="px-3 py-1.5 bg-[#1677ff] text-white rounded-lg text-xs font-bold">
              + Thêm Thuốc
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">MÃ THUỐC BHYT</th>
                  <th className="py-3 px-4">TÊN HOẠT CHẤT</th>
                  <th className="py-3 px-4">TÊN THƯƠNG MẠI</th>
                  <th className="py-3 px-4">HÀM LƯỢNG</th>
                  <th className="py-3 px-4">ĐƠN VỊ</th>
                  <th className="py-3 px-4 text-right">ĐƠN GIÁ BHYT</th>
                  <th className="py-3 px-4 text-center">TỶ LỆ TT</th>
                  <th className="py-3 px-4">SỐ ĐĂNG KÝ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {thuocItems.map((th) => (
                  <tr key={th.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{th.stt}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1677ff]">{th.maThuocBhyt}</td>
                    <td className="py-3 px-4 font-semibold">{th.tenHoatChat}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{th.tenThuoc}</td>
                    <td className="py-3 px-4">{th.hamLuong}</td>
                    <td className="py-3 px-4">{th.donViTinh}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">{th.donGia.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {th.tyLeThanhToan}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{th.soDangKy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB CONTENT: MẪU 04/DM - THIẾT BỊ Y TẾ (LOẠI 72)
      ============================================================ */}
      {activeCatalogTab === '04_thietbi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-bold text-slate-800">Danh Mục Thiết Bị Y Tế Áp Dụng Trong Thanh Toán BHYT</span>
            <button type="button" className="px-3 py-1.5 bg-[#1677ff] text-white rounded-lg text-xs font-bold">
              + Thêm Thiết Bị
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">MÃ TBYT</th>
                  <th className="py-3 px-4">TÊN THIẾT BỊ Y TẾ</th>
                  <th className="py-3 px-4">HÃNG SX</th>
                  <th className="py-3 px-4">NƯỚC SX</th>
                  <th className="py-3 px-4">NĂM SX</th>
                  <th className="py-3 px-4">SỐ LƯU HÀNH</th>
                  <th className="py-3 px-4">TÌNH TRẠNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {thietBiItems.map((tb) => (
                  <tr key={tb.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{tb.stt}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1677ff]">{tb.maTbyt}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{tb.tenTbyt}</td>
                    <td className="py-3 px-4">{tb.hangSx}</td>
                    <td className="py-3 px-4">{tb.nuocSx}</td>
                    <td className="py-3 px-4">{tb.namSx}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{tb.soLuuHanh}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {tb.tinhTrang}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB CONTENT: MẪU 05/DM - DỊCH VỤ KỸ THUẬT (LOẠI 12)
      ============================================================ */}
      {activeCatalogTab === '05_dichvu' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-bold text-slate-800">Danh Mục Dịch Vụ Khám Bệnh, Chữa Bệnh BHYT</span>
            <button type="button" className="px-3 py-1.5 bg-[#1677ff] text-white rounded-lg text-xs font-bold">
              + Thêm Dịch Vụ
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">MÃ DỊCH VỤ (BYT)</th>
                  <th className="py-3 px-4">TÊN DỊCH VỤ KỸ THUẬT</th>
                  <th className="py-3 px-4">PHÂN LOẠI</th>
                  <th className="py-3 px-4 text-right">GIÁ BHYT</th>
                  <th className="py-3 px-4 text-right">GIÁ VIỆN PHÍ</th>
                  <th className="py-3 px-4">KHOA THỰC HIỆN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dichVuItems.map((dv) => (
                  <tr key={dv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{dv.stt}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1677ff]">{dv.maDichVu}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{dv.tenDichVu}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {dv.loaiDv}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">{dv.giaBhyt.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">{dv.giaVienPhi.toLocaleString('vi-VN')} đ</td>
                    <td className="py-3 px-4 text-slate-600">{dv.khoaThucHien}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB CONTENT: MẪU 06/DM - THIẾT BỊ THEO DVKT (LOẠI 73)
      ============================================================ */}
      {activeCatalogTab === '06_tbdvkt' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-bold text-slate-800">Danh Mục Thiết Bị Y Tế Để Thực Hiện Dịch Vụ Kỹ Thuật</span>
            <button type="button" className="px-3 py-1.5 bg-[#1677ff] text-white rounded-lg text-xs font-bold">
              + Thêm Liên Kết
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">MÃ DVKT</th>
                  <th className="py-3 px-4">TÊN DỊCH VỤ KỸ THUẬT</th>
                  <th className="py-3 px-4">MÃ TBYT</th>
                  <th className="py-3 px-4">TÊN THIẾT BỊ LIÊN KẾT</th>
                  <th className="py-3 px-4">ĐỊNH MỨC TIÊU HAO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tbDvktItems.map((tb) => (
                  <tr key={tb.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{tb.stt}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1677ff]">{tb.maDvkt}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{tb.tenDvkt}</td>
                    <td className="py-3 px-4 font-mono">{tb.maTbyt}</td>
                    <td className="py-3 px-4 font-medium">{tb.tenTbyt}</td>
                    <td className="py-3 px-4 text-slate-600">{tb.dinhMucTieuHao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: XEM CẤU TRÚC XML & BASE64 KÝ SỐ CHO MẪU 01/DM (LOẠI 70)
      ============================================================ */}
      {isXmlModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-[#1677ff]">
                  <FileCode size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Cấu Trúc XML & Chuỗi Base64 Ký Số Trực Tuyến
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Loại HS 70
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fileUploadStats
                      ? `Nguồn: ${fileUploadStats.fileName} (Sheet: "${fileUploadStats.selectedSheet}") • ${bpcmItems.length} bản ghi`
                      : bpcmItems.length > 0
                        ? `Nguồn: Dữ liệu nhập tay/demo • ${bpcmItems.length} bản ghi`
                        : 'Chưa có file Excel nào được nạp'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsXmlModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {bpcmItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertTriangle size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Chưa Có Dữ Liệu Excel Để Sinh File XML</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    File XML và chuỗi Base64 được tạo trực tiếp từ file Excel bạn nạp vào. Hãy chọn file Excel danh mục từ máy tính của bạn trước.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsXmlModalOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-[#1677ff] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
                  >
                    <Upload size={14} />
                    <span>Nạp File Excel Ngay</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Segmented Tab Inside Modal */}
                  <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
                    <button
                      type="button"
                      onClick={() => setXmlExportTab('xml')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        xmlExportTab === 'xml' ? 'bg-white text-[#1677ff] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      XML Cấu Trúc ({bpcmItems.length} thẻ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setXmlExportTab('base64')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        xmlExportTab === 'base64' ? 'bg-white text-[#1677ff] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Chuỗi fileHsBase64
                    </button>
                    <button
                      type="button"
                      onClick={() => setXmlExportTab('api')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        xmlExportTab === 'api' ? 'bg-white text-[#1677ff] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Đặc Tả Gửi API
                    </button>
                  </div>

                  {/* Viewer Content */}
                  {xmlExportTab === 'xml' && (
                    <div className="bg-slate-950 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-auto max-h-96 shadow-inner border border-slate-800">
                      <pre className="whitespace-pre-wrap word-break-all leading-relaxed">
                        <code>{currentXml}</code>
                      </pre>
                    </div>
                  )}

                  {xmlExportTab === 'base64' && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#1677ff] bg-blue-50 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
                        <span>Độ dài: {currentBase64.length} ký tự Base64 (Đã mã hóa chuẩn UTF-8)</span>
                        <span className="text-emerald-700 font-bold">✓ 100% từ {bpcmItems.length} dòng Excel</span>
                      </div>
                      <textarea
                        readOnly
                        value={currentBase64}
                        className="w-full h-72 bg-slate-950 rounded-xl p-4 text-slate-200 font-mono text-xs border border-slate-800 outline-none resize-none"
                      />
                    </div>
                  )}
                </>
              )}

              {xmlExportTab === 'api' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs font-mono">
                  <div className="flex items-center gap-2 p-2 bg-blue-100/70 text-blue-900 rounded-lg font-bold">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">POST</span>
                    <span>https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc01_BPCMKBCB</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Request Body (x-www-form-urlencoded):</div>
                    <div className="space-y-1 text-slate-800">
                      <div><strong className="text-[#1677ff]">username:</strong> 01929_BV</div>
                      <div><strong className="text-[#1677ff]">loaiHs:</strong> 70</div>
                      <div><strong className="text-[#1677ff]">maTinh:</strong> 01</div>
                      <div><strong className="text-[#1677ff]">maCskcb:</strong> 01929</div>
                      <div><strong className="text-[#1677ff]">fileHsBase64:</strong> {currentBase64.slice(0, 45)}...</div>
                    </div>
                  </div>

                  {apiResponse && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <div className="text-emerald-800 font-bold uppercase text-[10px]">Response Body Nhận Được:</div>
                      <pre className="text-emerald-900 text-xs">
                        <code>{JSON.stringify(apiResponse, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const text = xmlExportTab === 'xml' ? currentXml : currentBase64;
                  handleCopyText(text);
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{isCopied ? 'Đã Sao Chép!' : 'Sao Chép Nội Dung'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportXml}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Download size={14} />
                  <span>Tải File .XML</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendBhxhApi}
                  disabled={isSendingApi}
                  className="px-4 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Send size={14} />
                  <span>{isSendingApi ? 'Đang gửi...' : 'Gửi Cổng EGW'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: THÊM / SỬA BỘ PHẬN CHUYÊN MÔN
      ============================================================ */}
      {isEditModalOpen && (
        <EditBpcmModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveBpcmItem}
          initialData={editingItem}
        />
      )}
    </div>
  );
};

// ==========================================
// SUB-MODAL: THÊM/SỬA BPCM
// ==========================================
interface EditBpcmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmBpcmItem) => void;
  initialData: DmBpcmItem | null;
}

const EditBpcmModal: React.FC<EditBpcmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<DmBpcmItem>(() => {
    if (initialData) return { ...initialData };
    return {
      stt: 1,
      maKhoa: '',
      tenKhoa: '',
      banKham: 1,
      giuongPd: 0,
      giuongTk: 0,
      giuongHstc: 0,
      giuongHscc: 0,
      tuNgay: '20260101',
      denNgay: '',
      maCskcb: '01929'
    };
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.maKhoa.trim()) {
      toast.warning('Vui lòng nhập Mã khoa / Bàn khám (MA_KHOA)', 'Thiếu Dữ Liệu');
      return;
    }
    if (!formData.tenKhoa.trim()) {
      toast.warning('Vui lòng nhập Tên khoa / Bàn khám (TEN_KHOA)', 'Thiếu Dữ Liệu');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-[#1677ff]">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {initialData ? 'Chỉnh Sửa Bộ Phận Chuyên Môn' : 'Thêm Mới Bộ Phận Chuyên Môn'}
                </h3>
                <p className="text-xs text-slate-500">Quy định Mẫu 01/DM - Loại hồ sơ 70</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-lg"
            >
              &times;
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã Khoa (MA_KHOA) *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10"
                placeholder="vd: K01, K0809, K02.D35"
                value={formData.maKhoa}
                onChange={(e) => setFormData({ ...formData, maKhoa: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã CSKCB (MA_CSKCB) *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10"
                value={formData.maCskcb}
                onChange={(e) => setFormData({ ...formData, maCskcb: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tên Khoa / Phòng / Bàn Khám (TEN_KHOA) *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10"
                placeholder="vd: Khoa Khám Bệnh Đa Khoa"
                value={formData.tenKhoa}
                onChange={(e) => setFormData({ ...formData, tenKhoa: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Bàn Khám (BAN_KHAM)</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#1677ff]"
                value={formData.banKham}
                onChange={(e) => setFormData({ ...formData, banKham: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giường Phê Duyệt (GIUONG_PD)</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#1677ff]"
                value={formData.giuongPd}
                onChange={(e) => setFormData({ ...formData, giuongPd: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giường Thực Kê (GIUONG_TK)</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#1677ff]"
                value={formData.giuongTk}
                onChange={(e) => setFormData({ ...formData, giuongTk: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giường HSTC (GIUONG_HSTC)</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#1677ff]"
                value={formData.giuongHstc}
                onChange={(e) => setFormData({ ...formData, giuongHstc: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giường HSCC (GIUONG_HSCC)</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#1677ff]"
                value={formData.giuongHscc}
                onChange={(e) => setFormData({ ...formData, giuongHscc: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Từ Ngày (TU_NGAY - YYYYMMDD) *</label>
              <input
                type="text"
                required
                maxLength={8}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1677ff]"
                placeholder="20260101"
                value={formData.tuNgay}
                onChange={(e) => setFormData({ ...formData, tuNgay: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Đến Ngày (DEN_NGAY - Tùy chọn)</label>
              <input
                type="text"
                maxLength={8}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-[#1677ff]"
                placeholder="Để trống nếu đang áp dụng"
                value={formData.denNgay || ''}
                onChange={(e) => setFormData({ ...formData, denNgay: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Lưu Thông Tin BPCM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
