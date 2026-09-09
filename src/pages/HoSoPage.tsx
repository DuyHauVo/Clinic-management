import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Send,
  Plus,
  Eye,
  Edit3,
  FileSpreadsheet,
  ShieldAlert,
  TrendingDown,
  User,
  CreditCard,
  Info,
  RotateCcw
} from 'lucide-react';
import type {
  HoSoTongHop,
  HoSoXuatToan,
  TrangThaiGiaiTrinh,
  LoaiKcb
} from '../types';
import {
  initialHoSoTongHopData,
  initialHoSoXuatToanData
} from '../mock/mockData';
import { useToast } from '../context/ToastContext';

type HoSoTab = '01_tonghop' | '09_xuattoan';

interface HoSoPageProps {
  activeTab?: HoSoTab;
  onTabChange?: (tab: HoSoTab) => void;
}

export const HoSoPage: React.FC<HoSoPageProps> = ({
  activeTab: externalActiveTab,
  onTabChange
}) => {
  const toast = useToast();
  const [internalActiveTab, setInternalActiveTab] = useState<HoSoTab>('01_tonghop');

  const activeHoSoTab = externalActiveTab || internalActiveTab;
  const setActiveHoSoTab = (tab: HoSoTab) => {
    setInternalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // State Hồ Sơ Tổng Hợp (Mẫu 01/BH)
  const [hoSoTongHopList, setHoSoTongHopList] = useState<HoSoTongHop[]>(initialHoSoTongHopData);
  const [searchTongHop, setSearchTongHop] = useState('');
  const [filterLoaiKcb, setFilterLoaiKcb] = useState<string>('all');
  const [filterTrangThaiTh, setFilterTrangThaiTh] = useState<string>('all');
  const [selectedHoSoDetail, setSelectedHoSoDetail] = useState<HoSoTongHop | null>(null);

  // State Hồ Sơ Xuất Toán (Mẫu 09/BH)
  const [hoSoXuatToanList, setHoSoXuatToanList] = useState<HoSoXuatToan[]>(initialHoSoXuatToanData);
  const [searchXuatToan, setSearchXuatToan] = useState('');
  const [filterNhomLoi, setFilterNhomLoi] = useState<string>('all');
  const [filterTrangThaiXt, setFilterTrangThaiXt] = useState<string>('all');
  const [selectedXuatToanModal, setSelectedXuatToanModal] = useState<HoSoXuatToan | null>(null);

  // New Dossier Modal
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);

  // ==========================================
  // CALCULATED KPIS
  // ==========================================
  const totalHsCount = hoSoTongHopList.length;
  const totalCostTh = hoSoTongHopList.reduce((sum, h) => sum + h.tongChiPhi, 0);
  const totalBhytCoverTh = hoSoTongHopList.reduce((sum, h) => sum + h.tienBhytThanhToan, 0);
  const totalPatientPayTh = hoSoTongHopList.reduce((sum, h) => sum + h.tienNguoiBenhTra, 0);

  const totalXuatToanAmount = hoSoXuatToanList.reduce((sum, x) => sum + x.tienXuatToan, 0);
  const totalRecoveredAmount = hoSoXuatToanList.reduce((sum, x) => sum + (x.tienChapNhanLai || 0), 0);
  const pendingGiaiTrinhCount = hoSoXuatToanList.filter(x => x.trangThai === 'cho_xu_ly').length;
  const recoveryRate = totalXuatToanAmount > 0 
    ? Math.round((totalRecoveredAmount / totalXuatToanAmount) * 100) 
    : 0;

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  const filteredTongHopList = hoSoTongHopList.filter(h => {
    const q = searchTongHop.toLowerCase();
    const matchSearch = 
      h.hoTen.toLowerCase().includes(q) ||
      h.maLk.toLowerCase().includes(q) ||
      h.maBenhNhan.toLowerCase().includes(q) ||
      h.soTheBhyt.toLowerCase().includes(q) ||
      h.maBenhIcd.toLowerCase().includes(q);

    const matchType = filterLoaiKcb === 'all' || h.loaiKcb === filterLoaiKcb;
    const matchStatus = filterTrangThaiTh === 'all' || h.trangThai === filterTrangThaiTh;

    return matchSearch && matchType && matchStatus;
  });

  const filteredXuatToanList = hoSoXuatToanList.filter(x => {
    const q = searchXuatToan.toLowerCase();
    const matchSearch =
      x.hoTen.toLowerCase().includes(q) ||
      x.maLk.toLowerCase().includes(q) ||
      x.maBenhNhan.toLowerCase().includes(q) ||
      x.noiDungLoi.toLowerCase().includes(q) ||
      x.khoaDieuTri.toLowerCase().includes(q);

    const matchNhomLoi = filterNhomLoi === 'all' || x.nhomLoi === filterNhomLoi;
    const matchStatus = filterTrangThaiXt === 'all' || x.trangThai === filterTrangThaiXt;

    return matchSearch && matchNhomLoi && matchStatus;
  });

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSaveGiaiTrinh = (id: string, noiDung: string, taiLieu: string[]) => {
    setHoSoXuatToanList(hoSoXuatToanList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          trangThai: 'da_giai_trinh' as TrangThaiGiaiTrinh,
          noiDungGiaiTrinh: noiDung,
          taiLieuDinhKem: taiLieu,
          ngayGiaiTrinh: new Date().toISOString().slice(0, 10),
          nguoiGiaiTrinh: 'BS. CKII. Nguyễn Văn An'
        };
      }
      return item;
    }));
    setSelectedXuatToanModal(null);
    toast.success('Đã cập nhật và lưu hồ sơ giải trình xuất toán Mẫu 09/BH thành công!', 'Lưu Giải Trình');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner / Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
            <FolderOpen size={13} />
            HỆ THỐNG QUẢN LÝ HỒ SƠ & GIÁM ĐỊNH BHYT
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Hồ Sơ Khám Chữa Bệnh & Xuất Toán BHYT
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl">
            Tích hợp 2 bộ hồ sơ trọng tâm: Bảng tổng hợp chi phí KCB (Mẫu 01/BH - XML 130) và Hồ sơ điều chỉnh xử lý xuất toán (Mẫu 09/BH).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 self-start lg:self-auto">
          <div className="px-3 border-r border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Kỳ Giám Định</span>
            <span className="text-sm font-extrabold font-mono text-slate-900">Tháng 09/2026</span>
          </div>
          <div className="px-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Cảnh Báo Xuất Toán</span>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> {pendingGiaiTrinhCount} Ca Cần Xử Lý
            </span>
          </div>
        </div>
      </div>

      {/* 2 Main Dossier Tabs Navigation (Ant Design Segmented Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveHoSoTab('01_tonghop')}
          className={`p-5 rounded-2xl text-left border-2 transition-all duration-200 flex items-center gap-4 relative ${
            activeHoSoTab === '01_tonghop'
              ? 'bg-white border-[#1677ff] shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
              : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            activeHoSoTab === '01_tonghop' ? 'bg-blue-50 text-[#1677ff]' : 'bg-slate-100 text-slate-600'
          }`}>
            <FileText size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">Bộ 1: Bảng Tổng Hợp KCB (01/BH)</span>
              <span className="text-xs bg-blue-100 text-[#1677ff] font-bold px-2.5 py-0.5 rounded-full">
                {hoSoTongHopList.length} Hồ Sơ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Giám sát tổng thể chi phí theo từng lượt khám chữa bệnh (Định dạng XML 130 BYT).
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveHoSoTab('09_xuattoan')}
          className={`p-5 rounded-2xl text-left border-2 transition-all duration-200 flex items-center gap-4 relative ${
            activeHoSoTab === '09_xuattoan'
              ? 'bg-white border-[#1677ff] shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
              : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            activeHoSoTab === '09_xuattoan' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
          }`}>
            <ShieldAlert size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">Bộ 2: Xử Lý Xuất Toán (09/BH)</span>
              <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full">
                {pendingGiaiTrinhCount} Cần Giải Trình
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Phân loại lỗi từ Cổng BHXH, điều chỉnh số liệu và lập biểu mẫu giải trình thu hồi chi phí.
            </p>
          </div>
        </button>
      </div>

      {/* ============================================================
          TAB 1: HỒ SƠ TỔNG HỢP CHI PHÍ KCB (MẪU 01/BH)
      ============================================================ */}
      {activeHoSoTab === '01_tonghop' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center flex-shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng Số Hồ Sơ KCB</span>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalHsCount} hồ sơ</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <CreditCard size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng Chi Phí KCB</span>
                <div className="text-2xl font-black text-indigo-700 tracking-tight">
                  {totalCostTh.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quỹ BHYT Thanh Toán</span>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">
                  {totalBhytCoverTh.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <User size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Người Bệnh Cùng Trả</span>
                <div className="text-2xl font-black text-amber-700 tracking-tight">
                  {totalPatientPayTh.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Tên bệnh nhân, Mã LK, Số thẻ BHYT, ICD-10..."
                  value={searchTongHop}
                  onChange={(e) => setSearchTongHop(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={filterLoaiKcb}
                  onChange={(e) => setFilterLoaiKcb(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
                >
                  <option value="all">Tất cả loại KCB</option>
                  <option value="Ngoại trú">Ngoại trú</option>
                  <option value="Nội trú">Nội trú</option>
                  <option value="Cấp cứu">Cấp cứu</option>
                </select>

                <select
                  value={filterTrangThaiTh}
                  onChange={(e) => setFilterTrangThaiTh(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="hop_le">Hợp lệ</option>
                  <option value="da_gui_cong">Đã gửi cổng</option>
                  <option value="canh_bao">Cảnh báo lỗi</option>
                  <option value="cho_duyet">Chờ duyệt</option>
                </select>

                <button
                  type="button"
                  onClick={() => toast.info('Đang trích xuất Bảng Tổng Hợp Chi Phí KCB BHYT (Mẫu 01/BH) định dạng Excel...', 'Xuất Mẫu 01/BH')}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  <span>Xuất Mẫu 01/BH</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(true)}
                  className="px-4 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={15} />
                  <span>Thêm Hồ Sơ KCB</span>
                </button>
              </div>
            </div>

            {/* Table (Pro Data Table Design) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[1300px] border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-bold text-slate-600 w-[180px] min-w-[180px] whitespace-nowrap">MÃ LIÊN KẾT (LK)</th>
                    <th className="py-3.5 px-4 font-bold text-slate-600 min-w-[200px] whitespace-nowrap">BỆNH NHÂN</th>
                    <th className="py-3.5 px-4 font-bold text-slate-600 w-[160px] min-w-[160px] whitespace-nowrap">SỐ THẺ BHYT</th>
                    <th className="py-3.5 px-4 text-center font-bold text-slate-600 w-[95px] min-w-[95px] whitespace-nowrap">MỨC HƯỞNG</th>
                    <th className="py-3.5 px-4 text-center font-bold text-slate-600 w-[110px] min-w-[110px] whitespace-nowrap">LOẠI KCB</th>
                    <th className="py-3.5 px-4 font-bold text-slate-600 min-w-[260px]">CHẨN ĐOÁN (ICD-10)</th>
                    <th className="py-3.5 px-4 text-right font-bold text-slate-600 w-[130px] min-w-[130px] whitespace-nowrap">TỔNG CHI</th>
                    <th className="py-3.5 px-4 text-right font-bold text-slate-600 w-[130px] min-w-[130px] whitespace-nowrap">TIỀN BHYT</th>
                    <th className="py-3.5 px-4 text-right font-bold text-slate-600 w-[120px] min-w-[120px] whitespace-nowrap">TIỀN BN TRẢ</th>
                    <th className="py-3.5 px-4 text-center font-bold text-slate-600 w-[130px] min-w-[130px] whitespace-nowrap">TRẠNG THÁI</th>
                    <th className="py-3.5 px-4 text-center font-bold text-slate-600 w-[90px] min-w-[90px] whitespace-nowrap">CHI TIẾT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTongHopList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 font-medium">
                        Không tìm thấy hồ sơ KCB nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredTongHopList.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#1677ff] bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg inline-block">
                            {item.maLk}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-xs font-bold text-slate-900">{item.hoTen}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="font-semibold text-slate-600">{item.gioiTinh}</span>
                            <span className="text-slate-300">•</span>
                            <span>Năm sinh: {item.ngaySinh.slice(0, 4)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 inline-block">
                            {item.soTheBhyt}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center font-black text-[#1677ff] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs">
                            {item.mucHuong}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.loaiKcb === 'Nội trú'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : item.loaiKcb === 'Cấp cứu'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-[#1677ff] border border-blue-200'
                          }`}>
                            {item.loaiKcb}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-1.5">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded text-[11px] flex-shrink-0">
                              [{item.maBenhIcd}]
                            </span>
                            <span className="text-xs text-slate-700 leading-snug font-medium line-clamp-2" title={item.chanDoan}>
                              {item.chanDoan}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-extrabold text-slate-900">
                          {item.tongChiPhi.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-extrabold text-emerald-700">
                          {item.tienBhytThanhToan.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-bold text-amber-700">
                          {item.tienNguoiBenhTra.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          {item.trangThai === 'hop_le' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                              Hợp Lệ
                            </span>
                          )}
                          {item.trangThai === 'da_gui_cong' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-[#1677ff] border border-blue-200 font-bold text-[11px]">
                              Đã Gửi Cổng
                            </span>
                          )}
                          {item.trangThai === 'canh_bao' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                              Cảnh Báo Lỗi
                            </span>
                          )}
                          {item.trangThai === 'cho_duyet' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
                              Chờ Duyệt
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedHoSoDetail(item)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
                            title="Xem chi tiết XML1-3"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị <strong>{filteredTongHopList.length}</strong> / <strong>{hoSoTongHopList.length}</strong> hồ sơ KCB</span>
              <span className="flex items-center gap-1">
                <Info size={14} className="text-slate-400" />
                Chuẩn dữ liệu Giám định BHYT Quyết định 130/QĐ-BYT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: HỒ SƠ ĐIỀU CHỈNH & XỬ LÝ XUẤT TOÁN (MẪU 09/BH)
      ============================================================ */}
      {activeHoSoTab === '09_xuattoan' && (
        <div className="space-y-6">
          {/* Top 4 Xuất Toán KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tiền Bị Xuất Toán</span>
                <div className="text-2xl font-black text-rose-700 tracking-tight">
                  {totalXuatToanAmount.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chờ Giải Trình</span>
                <div className="text-2xl font-black text-amber-700 tracking-tight">
                  {pendingGiaiTrinhCount} / {hoSoXuatToanList.length} ca
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Đã Cứu Toán Thành Công</span>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">
                  {totalRecoveredAmount.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={24} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tỷ Lệ Chấp Nhận Lại</span>
                <div className="text-2xl font-black text-indigo-700 tracking-tight">
                  {recoveryRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã LK, Bệnh nhân, Nội dung lỗi BHXH..."
                  value={searchXuatToan}
                  onChange={(e) => setSearchXuatToan(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={filterNhomLoi}
                  onChange={(e) => setFilterNhomLoi(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
                >
                  <option value="all">Tất cả nhóm lỗi xuất toán</option>
                  <option value="trung_lap_dich_vu">Trùng lặp chỉ định CLS</option>
                  <option value="vuot_dinh_muc_phac_do">Vượt định mức phác đồ</option>
                  <option value="sai_thong_tin_the">Sai thông tin thẻ BHYT</option>
                  <option value="thieu_ket_qua_cls">Thiếu kết quả / chứng từ CLS</option>
                  <option value="vuot_tran_gia_thuoc">Vượt trần giá thuốc BHYT</option>
                </select>

                <select
                  value={filterTrangThaiXt}
                  onChange={(e) => setFilterTrangThaiXt(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="cho_xu_ly">Chờ giải trình</option>
                  <option value="da_giai_trinh">Đã gửi giải trình</option>
                  <option value="chap_nhan_lai">Chấp nhận lại</option>
                  <option value="tu_choi_giai_trinh">Từ chối giải trình</option>
                </select>

                <button
                  type="button"
                  onClick={() => toast.info('Đang trích xuất Báo Cáo Xử Lý Xuất Toán BHYT (Mẫu 09/BH) định dạng Excel...', 'Xuất Mẫu 09/BH')}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  <span>Xuất Báo Cáo Mẫu 09/BH</span>
                </button>
              </div>
            </div>

            {/* Table (Pro Data Table Design for 09/BH) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[1300px] border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-bold text-slate-600 w-[180px] min-w-[180px] whitespace-nowrap">MÃ LIÊN KẾT</th>
                    <th className="py-3.5 px-4 font-bold text-slate-600 min-w-[200px] whitespace-nowrap">BỆNH NHÂN & THẺ</th>
                    <th className="py-3.5 px-4 font-bold text-slate-600 min-w-[180px] whitespace-nowrap">KHOA / BÁC SĨ</th>
                    <th className="py-3.5 px-4 font-bold text-slate-600 min-w-[300px]">NỘI DUNG LỖI XUẤT TOÁN TỪ CỔNG GIÁM ĐỊNH</th>
                    <th className="py-3.5 px-4 text-right font-bold text-slate-600 w-[130px] min-w-[130px] whitespace-nowrap">TIỀN KCB</th>
                    <th className="py-3.5 px-4 text-right font-bold text-rose-600 w-[140px] min-w-[140px] whitespace-nowrap">TIỀN XUẤT TOÁN</th>
                    <th className="py-3.5 px-4 text-center font-bold text-slate-600 w-[130px] min-w-[130px] whitespace-nowrap">TRẠNG THÁI</th>
                    <th className="py-3.5 px-4 text-center font-bold text-slate-600 w-[120px] min-w-[120px] whitespace-nowrap">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredXuatToanList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        Không có hồ sơ xuất toán nào theo tiêu chí lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredXuatToanList.map((item) => (
                      <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#1677ff] bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg inline-block">
                            {item.maLk}
                          </span>
                          <div className="text-[11px] text-slate-400 font-medium mt-1">{item.ngayKcb}</div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-xs font-bold text-slate-900">{item.hoTen}</div>
                          <div className="text-[11px] text-slate-500 font-mono font-semibold mt-0.5">{item.soTheBhyt}</div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-xs font-bold text-slate-800">{item.khoaDieuTri}</div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{item.bacSiDieuTri}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="p-2.5 bg-rose-50/90 rounded-xl border border-rose-200 text-rose-950 text-xs font-medium leading-relaxed">
                            <span className="font-mono text-[10px] font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded mr-1.5 inline-block">
                              {item.maLoiBhxh}
                            </span>
                            {item.noiDungLoi}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 italic">
                            Căn cứ: {item.canCuPhapLy}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-extrabold text-slate-900">
                          {item.tongChiKcb.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-black text-rose-700">
                          - {item.tienXuatToan.toLocaleString('vi-VN')} đ
                          {item.tienChapNhanLai && item.tienChapNhanLai > 0 ? (
                            <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                              + Đã cứu: {item.tienChapNhanLai.toLocaleString('vi-VN')} đ
                            </div>
                          ) : null}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          {item.trangThai === 'cho_xu_ly' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                              Chờ Giải Trình
                            </span>
                          )}
                          {item.trangThai === 'da_giai_trinh' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-[#1677ff] border border-blue-200 font-bold text-[11px]">
                              Đã Gửi Duyệt
                            </span>
                          )}
                          {item.trangThai === 'chap_nhan_lai' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                              Chấp Nhận Lại
                            </span>
                          )}
                          {item.trangThai === 'tu_choi_giai_trinh' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                              Từ Chối
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedXuatToanModal(item)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 mx-auto ${
                              item.trangThai === 'cho_xu_ly'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                                : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <Edit3 size={13} />
                            <span>{item.trangThai === 'cho_xu_ly' ? 'Giải Trình' : 'Xem Hồ Sơ'}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị <strong>{filteredXuatToanList.length}</strong> / <strong>{hoSoXuatToanList.length}</strong> ca xuất toán</span>
              <span className="flex items-center gap-1">
                <ShieldAlert size={14} className="text-amber-500" />
                Biểu mẫu giải trình & điều chỉnh chi phí KCB theo Mẫu 09/BH
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: CHI TIẾT HỒ SƠ TỔNG HỢP (XML1-3)
      ============================================================ */}
      {selectedHoSoDetail && (
        <HoSoDetailModal
          hoSo={selectedHoSoDetail}
          onClose={() => setSelectedHoSoDetail(null)}
        />
      )}

      {/* ============================================================
          MODAL: BIỂU MẪU GIẢI TRÌNH XUẤT TOÁN (MẪU 09/BH)
      ============================================================ */}
      {selectedXuatToanModal && (
        <GiaiTrinhXuatToanModal
          item={selectedXuatToanModal}
          onClose={() => setSelectedXuatToanModal(null)}
          onSave={handleSaveGiaiTrinh}
        />
      )}

      {/* ============================================================
          MODAL: TẠO MỚI HỒ SƠ KCB
      ============================================================ */}
      {isNewRecordModalOpen && (
        <NewHoSoModal
          isOpen={isNewRecordModalOpen}
          onClose={() => setIsNewRecordModalOpen(false)}
          onSave={(newHs) => {
            setHoSoTongHopList([newHs, ...hoSoTongHopList]);
            setIsNewRecordModalOpen(false);
            toast.success(`Đã tạo thành công hồ sơ khám bệnh cho bệnh nhân ${newHs.hoTen} (${newHs.maLk})!`, 'Tạo Hồ Sơ');
          }}
        />
      )}
    </div>
  );
};

// ============================================================
// SUB-MODAL: CHI TIẾT HỒ SƠ KCB BHYT
// ============================================================
interface HoSoDetailModalProps {
  hoSo: HoSoTongHop;
  onClose: () => void;
}

const HoSoDetailModal: React.FC<HoSoDetailModalProps> = ({ hoSo, onClose }) => {
  const toast = useToast();
  const [activeXmlTab, setActiveXmlTab] = useState<'xml1' | 'xml2' | 'xml3'>('xml1');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-[#1677ff]">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Chi Tiết Hồ Sơ KCB BHYT - {hoSo.hoTen}</h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã LK: <strong>{hoSo.maLk}</strong> • Thẻ: <strong>{hoSo.soTheBhyt}</strong> ({hoSo.mucHuong}%)
              </p>
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

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Patient Header Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Họ và tên:</span>
              <span className="font-bold text-slate-900 text-sm">{hoSo.hoTen}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Ngày sinh:</span>
              <span className="font-semibold text-slate-800">{hoSo.ngaySinh} ({hoSo.gioiTinh})</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Mã bệnh (ICD-10):</span>
              <span className="font-mono font-bold text-[#1677ff]">{hoSo.maBenhIcd}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 font-medium block">Chẩn đoán:</span>
              <span className="font-semibold text-slate-800">{hoSo.chanDoan}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Bác sĩ khám:</span>
              <span className="font-semibold text-slate-800">{hoSo.bacSiKcb}</span>
            </div>
          </div>

          {/* Cost Pills */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Tổng Chi Phí KCB</span>
              <span className="text-lg font-black text-slate-900">{hoSo.tongChiPhi.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-600 uppercase block">Quỹ BHYT Chi Trả</span>
              <span className="text-lg font-black text-emerald-700">{hoSo.tienBhytThanhToan.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <span className="text-[11px] font-bold text-amber-600 uppercase block">Người Bệnh Cùng Trả</span>
              <span className="text-lg font-black text-amber-700">{hoSo.tienNguoiBenhTra.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* XML Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-md">
            <button
              type="button"
              onClick={() => setActiveXmlTab('xml1')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeXmlTab === 'xml1' ? 'bg-white text-[#1677ff] shadow-xs' : 'text-slate-600'
              }`}
            >
              XML1: Tổng Hợp
            </button>
            <button
              type="button"
              onClick={() => setActiveXmlTab('xml2')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeXmlTab === 'xml2' ? 'bg-white text-[#1677ff] shadow-xs' : 'text-slate-600'
              }`}
            >
              XML2: Thuốc ({hoSo.chiTiet?.xml2Thuoc?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveXmlTab('xml3')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeXmlTab === 'xml3' ? 'bg-white text-[#1677ff] shadow-xs' : 'text-slate-600'
              }`}
            >
              XML3: DVKT ({hoSo.chiTiet?.xml3Dvkt?.length || 0})
            </button>
          </div>

          {/* Table Details */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {activeXmlTab === 'xml1' && (
              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-3 flex justify-between"><span className="text-slate-400 font-bold">MÃ LIÊN KẾT (MA_LK):</span><span className="font-mono font-bold text-[#1677ff]">{hoSo.maLk}</span></div>
                <div className="p-3 flex justify-between"><span className="text-slate-400 font-bold">THỜI GIAN VÀO VIỆN:</span><span>{hoSo.ngayVao}</span></div>
                <div className="p-3 flex justify-between"><span className="text-slate-400 font-bold">THỜI GIAN RA VIỆN:</span><span>{hoSo.ngayRa}</span></div>
                <div className="p-3 flex justify-between"><span className="text-slate-400 font-bold">MÃ GIAO DỊCH CỔNG BHXH:</span><span className="font-mono">{hoSo.maGiaoDichBhxh || 'Chưa phát sinh'}</span></div>
              </div>
            )}

            {activeXmlTab === 'xml2' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">STT</th>
                    <th className="p-2.5">MÃ THUỐC</th>
                    <th className="p-2.5">TÊN THUỐC</th>
                    <th className="p-2.5 text-center">ĐVT</th>
                    <th className="p-2.5 text-center">SL</th>
                    <th className="p-2.5 text-right">ĐƠN GIÁ</th>
                    <th className="p-2.5 text-right">THÀNH TIỀN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hoSo.chiTiet?.xml2Thuoc?.map(t => (
                    <tr key={t.stt} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-400">{t.stt}</td>
                      <td className="p-2.5 font-mono text-[#1677ff] font-bold">{t.maThuoc}</td>
                      <td className="p-2.5 font-bold text-slate-800">{t.tenThuoc} ({t.hamLuong})</td>
                      <td className="p-2.5 text-center">{t.donViTinh}</td>
                      <td className="p-2.5 text-center font-bold">{t.soLuong}</td>
                      <td className="p-2.5 text-right">{t.donGia.toLocaleString('vi-VN')} đ</td>
                      <td className="p-2.5 text-right font-bold text-blue-700">{t.thanhTien.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeXmlTab === 'xml3' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">STT</th>
                    <th className="p-2.5">MÃ DVKT</th>
                    <th className="p-2.5">TÊN DỊCH VỤ</th>
                    <th className="p-2.5">KHOA THỰC HIỆN</th>
                    <th className="p-2.5 text-center">SL</th>
                    <th className="p-2.5 text-right">ĐƠN GIÁ</th>
                    <th className="p-2.5 text-right">THÀNH TIỀN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hoSo.chiTiet?.xml3Dvkt?.map(d => (
                    <tr key={d.stt} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-400">{d.stt}</td>
                      <td className="p-2.5 font-mono text-[#1677ff] font-bold">{d.maDichVu}</td>
                      <td className="p-2.5 font-bold text-slate-800">{d.tenDichVu}</td>
                      <td className="p-2.5 text-slate-500">{d.khoaThucHien}</td>
                      <td className="p-2.5 text-center font-bold">{d.soLuong}</td>
                      <td className="p-2.5 text-right">{d.donGia.toLocaleString('vi-VN')} đ</td>
                      <td className="p-2.5 text-right font-bold text-blue-700">{d.thanhTien.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            Đóng
          </button>
          <button
            type="button"
            onClick={() => toast.success(`Đã trích xuất gói XML 130 chuẩn của bệnh nhân ${hoSo.hoTen} (${hoSo.maLk})!`, 'Xuất XML 130')}
            className="px-4 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Download size={14} /> Xuất Gói XML 130
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SUB-MODAL: BIỂU MẪU GIẢI TRÌNH XUẤT TOÁN (MẪU 09/BH)
// ============================================================
interface GiaiTrinhModalProps {
  item: HoSoXuatToan;
  onClose: () => void;
  onSave: (id: string, noiDung: string, taiLieu: string[]) => void;
}

const GiaiTrinhXuatToanModal: React.FC<GiaiTrinhModalProps> = ({ item, onClose, onSave }) => {
  const toast = useToast();
  const [noiDung, setNoiDung] = useState(item.noiDungGiaiTrinh || '');
  const [selectedDocs, setSelectedDocs] = useState<string[]>(item.taiLieuDinhKem || []);

  const toggleDoc = (docName: string) => {
    if (selectedDocs.includes(docName)) {
      setSelectedDocs(selectedDocs.filter(d => d !== docName));
    } else {
      setSelectedDocs([...selectedDocs, docName]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noiDung.trim()) {
      toast.warning('Vui lòng nhập nội dung giải trình chuyên môn trước khi gửi!', 'Thiếu Nội Dung');
      return;
    }
    onSave(item.id, noiDung, selectedDocs);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Biểu Mẫu Giải Trình Xuất Toán BHYT (Mẫu 09/BH)</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Mã LK: <strong>{item.maLk}</strong> • Bệnh nhân: <strong>{item.hoTen}</strong>
                </p>
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

          <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            {/* Error Detail Banner */}
            <div className="p-4 bg-rose-50/90 rounded-2xl border border-rose-200 text-rose-900 space-y-1.5">
              <div className="font-extrabold text-sm flex items-center gap-2 text-rose-900">
                <AlertTriangle size={17} /> Lý Do Xuất Toán Từ Cổng Giám Định BHXH:
              </div>
              <div className="font-medium text-rose-800">{item.noiDungLoi}</div>
              <div className="text-[11px] text-rose-600 font-mono">
                <strong>Mã lỗi:</strong> {item.maLoiBhxh} • <strong>Căn cứ:</strong> {item.canCuPhapLy}
              </div>
              <div className="pt-2 border-t border-rose-200 flex items-center justify-between font-extrabold text-sm">
                <span>Số tiền bị xuất toán / giảm trừ:</span>
                <span className="text-rose-700 text-base">- {item.tienXuatToan.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Form Editor */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nội Dung Văn Bản Giải Trình Chuyên Môn *
              </label>
              <textarea
                required
                rows={4}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-blue-500/10"
                placeholder="Nhập lý do chỉ định y khoa, diễn biến cấp cứu, kết quả hội chẩn, hoặc căn cứ phác đồ chuẩn..."
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
              />
            </div>

            {/* Checklist of attachments */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Tài Liệu / Chứng Cứ Bổ Sung Kèm Theo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {[
                  'Biên bản hội chẩn chuyên khoa (Mẫu BYT)',
                  'Phiếu tường trình phẫu thuật / thủ thuật',
                  'Kết quả cận lâm sàng / hình ảnh chẩn đoán',
                  'Trích sao bệnh án nội trú / ngoại trú',
                  'Đơn thuốc và biên bản duyệt thuốc ngoài danh mục'
                ].map(doc => (
                  <label
                    key={doc}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${
                      selectedDocs.includes(doc)
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc)}
                      onChange={() => toggleDoc(doc)}
                    />
                    <span>{doc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Send size={14} /> Gửi Báo Cáo Giải Trình (Mẫu 09)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// SUB-MODAL: TẠO HỒ SƠ KCB MỚI
// ============================================================
interface NewHoSoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: HoSoTongHop) => void;
}

const NewHoSoModal: React.FC<NewHoSoModalProps> = ({ isOpen, onClose, onSave }) => {
  const [hoTen, setHoTen] = useState('');
  const [soTheBhyt, setSoTheBhyt] = useState('DN479');
  const [mucHuong, setMucHuong] = useState<number>(80);
  const [loaiKcb, setLoaiKcb] = useState<LoaiKcb>('Ngoại trú');
  const [maBenhIcd, setMaBenhIcd] = useState('I10');
  const [chanDoan, setChanDoan] = useState('');
  const [tongChiPhi, setTongChiPhi] = useState<number>(500000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tienBhyt = Math.round((tongChiPhi * mucHuong) / 100);
    const tienBn = tongChiPhi - tienBhyt;

    const newRecord: HoSoTongHop = {
      id: `hs-${Date.now()}`,
      maLk: `LK01929${Date.now().toString().slice(-8)}`,
      maBenhNhan: `BN-${Date.now().toString().slice(-6)}`,
      hoTen,
      ngaySinh: '1990-01-01',
      gioiTinh: 'Nam',
      soTheBhyt,
      maDkbd: '01929',
      mucHuong,
      loaiKcb,
      khoaKcb: 'Khoa Khám Bệnh Đa Khoa',
      bacSiKcb: 'BS. CKII. Nguyễn Văn An',
      maBenhIcd,
      chanDoan,
      ngayVao: new Date().toISOString().slice(0, 16).replace('T', ' '),
      ngayRa: new Date().toISOString().slice(0, 16).replace('T', ' '),
      tongChiPhi,
      tienBhytThanhToan: tienBhyt,
      tienNguoiBenhTra: tienBn,
      tienNguonKhac: 0,
      trangThai: 'hop_le',
      chiTiet: {
        xml1TongHop: {
          maLk: `LK01929${Date.now().toString().slice(-8)}`,
          maBn: `BN-${Date.now().toString().slice(-6)}`,
          hoTen,
          ngayVao: '202609090800',
          ngayRa: '202609091000',
          ngayQuyetToan: '202609091030',
          maBenh: maBenhIcd,
          tenBenh: chanDoan,
          maKhoa: 'K01',
          tongChi: tongChiPhi,
          tienBhyt,
          tienBnTra: tienBn,
          tienNguonKhac: 0
        },
        xml2Thuoc: [],
        xml3Dvkt: []
      }
    };

    onSave(newRecord);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 text-[#1677ff]">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Tạo Mới Hồ Sơ Khám Bệnh BHYT</h3>
                <p className="text-xs text-slate-500">Ghi nhận thông tin KCB & Bảng kê chi phí XML1</p>
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
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Họ và Tên Bệnh Nhân *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#1677ff]"
                placeholder="vd: Nguyễn Văn A"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Thẻ BHYT *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1677ff]"
                placeholder="DN479..."
                value={soTheBhyt}
                onChange={(e) => setSoTheBhyt(e.target.value.toUpperCase())}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mức Hưởng BHYT</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#1677ff]"
                value={mucHuong}
                onChange={(e) => setMucHuong(Number(e.target.value))}
              >
                <option value={80}>80% (Đối tượng thường)</option>
                <option value={95}>95% (Hưu trí / Cận nghèo)</option>
                <option value={100}>100% (Trẻ em / Quân nhân)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Loại Hình KCB</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#1677ff]"
                value={loaiKcb}
                onChange={(e) => setLoaiKcb(e.target.value as LoaiKcb)}
              >
                <option value="Ngoại trú">Ngoại trú</option>
                <option value="Nội trú">Nội trú</option>
                <option value="Cấp cứu">Cấp cứu</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã Bệnh ICD-10 *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#1677ff]"
                placeholder="I10, K29..."
                value={maBenhIcd}
                onChange={(e) => setMaBenhIcd(e.target.value.toUpperCase())}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Chẩn Đoán Bệnh *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#1677ff]"
                placeholder="vd: Tăng huyết áp nguyên phát / Viêm dạ dày..."
                value={chanDoan}
                onChange={(e) => setChanDoan(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tổng Chi Phí KCB (VNĐ) *</label>
              <input
                type="number"
                min={0}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#1677ff]"
                value={tongChiPhi}
                onChange={(e) => setTongChiPhi(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Lưu Hồ Sơ KCB
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
