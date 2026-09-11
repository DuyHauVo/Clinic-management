import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  CheckCircle2,
  Clock,
  TrendingDown,
  RotateCcw,
  FileSpreadsheet,
  ShieldAlert,
  Edit3,
  Send,
  AlertTriangle
} from 'lucide-react';
import type {
  HoSoXuatToan,
  TrangThaiGiaiTrinh
} from '../types';
import { initialHoSoXuatToanData } from '../mock/mockData';
import { useToast } from '../context/ToastContext';
import { Hs01TongHopTab } from '../components/ho-so/01-tonghop';

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

  // State Hồ Sơ Xuất Toán (Mẫu 09/BH)
  const [hoSoXuatToanList, setHoSoXuatToanList] = useState<HoSoXuatToan[]>(initialHoSoXuatToanData);
  const [searchXuatToan, setSearchXuatToan] = useState('');
  const [filterNhomLoi, setFilterNhomLoi] = useState<string>('all');
  const [filterTrangThaiXt, setFilterTrangThaiXt] = useState<string>('all');
  const [selectedXuatToanModal, setSelectedXuatToanModal] = useState<HoSoXuatToan | null>(null);

  // ==========================================
  // CALCULATED KPIS (09/BH)
  // ==========================================
  const totalXuatToanAmount = hoSoXuatToanList.reduce((sum, x) => sum + x.tienXuatToan, 0);
  const totalRecoveredAmount = hoSoXuatToanList.reduce((sum, x) => sum + (x.tienChapNhanLai || 0), 0);
  const pendingGiaiTrinhCount = hoSoXuatToanList.filter(x => x.trangThai === 'cho_xu_ly').length;
  const recoveryRate = totalXuatToanAmount > 0 
    ? Math.round((totalRecoveredAmount / totalXuatToanAmount) * 100) 
    : 0;

  // ==========================================
  // FILTERING LOGIC (09/BH)
  // ==========================================
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
            Tích hợp 2 bộ hồ sơ trọng tâm: Bảng tổng hợp chi phí KCB (Mẫu 01/BH - XML &lt;HSTH01BH&gt; Loại HS 5) và Hồ sơ điều chỉnh xử lý xuất toán (Mẫu 09/BH).
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

      {/* Main Switcher: 2 Major Clinical BHYT Dossier Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveHoSoTab('01_tonghop')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
            activeHoSoTab === '01_tonghop'
              ? 'bg-blue-50/70 border-[#1677ff] shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
              activeHoSoTab === '01_tonghop'
                ? 'bg-[#1677ff] text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            01
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">Bộ 1: Bảng Tổng Hợp Chi Phí KCB (01/BH)</span>
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
                Loại HS 5 • XML
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hồ sơ tổng hợp chi phí KCB Mẫu 01/BH (20 trường XML &lt;HSTH01BH&gt;), gửi Cổng BHXH Gateway (API GuiHoSoTongHop01BH).
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveHoSoTab('09_xuattoan')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
            activeHoSoTab === '09_xuattoan'
              ? 'bg-rose-50/70 border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
              activeHoSoTab === '09_xuattoan'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            09
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
          TAB 1: HỒ SƠ TỔNG HỢP CHI PHÍ KCB (MẪU 01/BH - XML <HSTH01BH> - LOẠI HS 5)
      ============================================================ */}
      {activeHoSoTab === '01_tonghop' && <Hs01TongHopTab />}

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
          MODAL: BIỂU MẪU GIẢI TRÌNH XUẤT TOÁN (MẪU 09/BH)
      ============================================================ */}
      {selectedXuatToanModal && (
        <GiaiTrinhXuatToanModal
          item={selectedXuatToanModal}
          onClose={() => setSelectedXuatToanModal(null)}
          onSave={handleSaveGiaiTrinh}
        />
      )}
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
            <div className="p-4 bg-rose-50/90 rounded-2xl border border-rose-200 text-rose-950 space-y-1.5">
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
