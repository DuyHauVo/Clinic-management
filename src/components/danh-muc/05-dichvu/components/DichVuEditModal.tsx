import React, { useState } from 'react';
import { Stethoscope, X, Save, DollarSign, FileText, Calendar, Activity } from 'lucide-react';
import type { DmDichVuItem } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { ThuocPxListEditor } from './ThuocPxListEditor';
import { DEFAULT_MA_CSKCB, getTodayYmd } from '../../../../utils/shared/excelXmlShared';
import { useModalBehavior } from '../../../../hooks/useModalBehavior';

interface DichVuEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmDichVuItem) => void;
  initialData: DmDichVuItem | null;
}

const getDefaultDichVuData = (): DmDichVuItem => ({
  stt: 1,
  maDichVu: '',
  tenDichVu: '',
  tenDvktGia: '',
  donGia: 0,
  quyTrinh: '20240101_01/QĐ-BV',
  soLuongCgkt: undefined,
  cskcbCgkt: '',
  cskcbCls: '',
  qdDvkt: '20240101_01/QĐ-SYT',
  qdPdGia: '20240101_01/QĐ-UBND',
  ghiChu: '',
  giaThanhToan: 0,
  tuNgay: getTodayYmd(),
  denNgay: '',
  maCskcb: DEFAULT_MA_CSKCB,
  dsThuocPx: []
});

export const DichVuEditModal: React.FC<DichVuEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <DichVuEditModalContent
      key={initialData?.id ?? 'new'}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    />
  );
};

interface DichVuEditModalContentProps {
  onClose: () => void;
  onSave: (item: DmDichVuItem) => void;
  initialData: DmDichVuItem | null;
}

const DichVuEditModalContent: React.FC<DichVuEditModalContentProps> = ({
  onClose,
  onSave,
  initialData
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<DmDichVuItem>(() => {
    if (initialData) {
      return {
        ...initialData,
        dsThuocPx: initialData.dsThuocPx ? initialData.dsThuocPx.map(it => ({ ...it })) : []
      };
    }
    return getDefaultDichVuData();
  });

  const [activeTab, setActiveTab] = useState<'info' | 'thuocpx'>('info');

  // Tính lại tổng tiền thanh toán mỗi khi đơn giá hoặc thuốc phóng xạ thay đổi
  const totalThuocPx = (formData.dsThuocPx || []).reduce((acc, cur) => acc + (cur.thanhTienThuoc || 0), 0);
  const calculatedGiaThanhToan = (formData.donGia || 0) + totalThuocPx;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.maDichVu.trim()) {
      toast.warning('Vui lòng nhập Mã dịch vụ (MA_DICH_VU)', 'Thiếu Dữ Liệu');
      return;
    }
    if (!formData.tenDichVu.trim()) {
      toast.warning('Vui lòng nhập Tên dịch vụ (TEN_DICH_VU)', 'Thiếu Dữ Liệu');
      return;
    }
    if (formData.donGia < 0) {
      toast.warning('Đơn giá dịch vụ không được âm', 'Dữ Liệu Chưa Hợp Lệ');
      return;
    }

    // Lọc bỏ các dòng thuốc PX rỗng
    const validThuocPx = (formData.dsThuocPx || []).filter(
      r => r.maThuoc.trim() !== '' || r.tenThuoc.trim() !== ''
    );

    // Nếu có dòng thuốc PX nhập dở dang
    const invalidPx = validThuocPx.find(r => !r.maThuoc.trim() || !r.tenThuoc.trim());
    if (invalidPx) {
      toast.warning('Tất cả thuốc phóng xạ cần có đầy đủ Mã thuốc và Tên thuốc!', 'Thiếu Dữ Liệu Thuốc PX');
      return;
    }

    onSave({
      ...formData,
      dsThuocPx: validThuocPx,
      giaThanhToan: calculatedGiaThanhToan,
      tenDvktGia: formData.tenDvktGia.trim() || formData.tenDichVu.trim()
    });
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Stethoscope size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {initialData ? 'Chỉnh Sửa Dịch Vụ Kỹ Thuật' : 'Thêm Mới Dịch Vụ Kỹ Thuật'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Mẫu 05/DM • Loại HS 12
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo 16 trường thông tin chuẩn QĐ 3176/QĐ-BYT phục vụ giám định BHYT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-3 pb-0 bg-white border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={14} />
            <span>1. Thông Tin Dịch Vụ Kỹ Thuật (16 Trường)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('thuocpx')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'thuocpx'
                ? 'border-amber-600 text-amber-700 bg-amber-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity size={14} />
            <span>2. Thuốc Phóng Xạ & Chất Đánh Dấu</span>
            {formData.dsThuocPx && formData.dsThuocPx.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] font-mono font-bold ml-1">
                {formData.dsThuocPx.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'info' && (
            <>
              {/* Group 1: Mã & Tên DVKT */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope size={14} />
                  <span>1. Mã & Tên Dịch Vụ (Bộ Y tế & Bệnh Viện)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Mã Dịch Vụ (MA_DICH_VU) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01.0001.0001"
                      value={formData.maDichVu}
                      onChange={(e) => setFormData({ ...formData, maDichVu: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-emerald-700 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Tên Dịch Vụ Theo DM Dùng Chung (TEN_DICH_VU) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Khám bệnh chuyên khoa Nội..."
                      value={formData.tenDichVu}
                      onChange={(e) => setFormData({ ...formData, tenDichVu: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tên DVKT Phê Duyệt Giá (TEN_DVKT_GIA) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Tên phê duyệt tại quyết định/nghị quyết..."
                      value={formData.tenDvktGia}
                      onChange={(e) => setFormData({ ...formData, tenDvktGia: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Ghi Chú Giá (GHI_CHU)</label>
                    <input
                      type="text"
                      placeholder="Ghi chú theo văn bản phê duyệt giá..."
                      value={formData.ghiChu || ''}
                      onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Đơn Giá & Thanh Toán */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={14} />
                  <span>2. Đơn Giá Dịch Vụ & Giá Thanh Toán BHYT</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Đơn Giá DVKT (DON_GIA) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.donGia}
                      onChange={(e) => setFormData({ ...formData, donGia: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tiền Thuốc Phóng Xạ Đi Kèm</label>
                    <div className="px-3 py-1.5 bg-slate-100 rounded-lg font-mono font-semibold text-amber-700 border border-slate-200">
                      {totalThuocPx.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">
                      Giá TT BHYT (GIA_THANH_TOAN)
                    </label>
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg font-mono font-bold text-emerald-800 text-sm">
                      {calculatedGiaThanhToan.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Quyết Định & Quy Trình CMKT */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>3. Quyết Định Ban Hành & Quy Trình CMKT</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Quy Trình CMKT (QUY_TRINH) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="YYYYMMDD_Z"
                      value={formData.quyTrinh}
                      onChange={(e) => setFormData({ ...formData, quyTrinh: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      QĐ Phê Duyệt DVKT (QD_DVKT) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="YYYYMMDD_Z"
                      value={formData.qdDvkt}
                      onChange={(e) => setFormData({ ...formData, qdDvkt: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      QĐ Phê Duyệt Giá (QD_PD_GIA) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="YYYYMMDD_Z"
                      value={formData.qdPdGia}
                      onChange={(e) => setFormData({ ...formData, qdPdGia: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Số Lượng CGKT (HĐ)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Số lượng nếu có..."
                      value={formData.soLuongCgkt !== undefined ? formData.soLuongCgkt : ''}
                      onChange={(e) => setFormData({ ...formData, soLuongCgkt: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Mã CSKCB Chuyển Giao (CGKT)</label>
                    <input
                      type="text"
                      placeholder="48001..."
                      value={formData.cskcbCgkt || ''}
                      onChange={(e) => setFormData({ ...formData, cskcbCgkt: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Mã CSKCB Làm Cận Lâm Sàng</label>
                    <input
                      type="text"
                      placeholder="48001..."
                      value={formData.cskcbCls || ''}
                      onChange={(e) => setFormData({ ...formData, cskcbCls: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Cơ Sở & Thời Gian Áp Dụng */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>4. Cơ Sở KCB & Thời Gian Hiệu Lực</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Mã CSKCB (MA_CSKCB) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.maCskcb}
                      onChange={(e) => setFormData({ ...formData, maCskcb: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Từ Ngày (YYYYMMDD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={formData.tuNgay}
                      onChange={(e) => setFormData({ ...formData, tuNgay: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Đến Ngày (YYYYMMDD)</label>
                    <input
                      type="text"
                      maxLength={8}
                      placeholder="Để trống nếu đang áp dụng"
                      value={formData.denNgay || ''}
                      onChange={(e) => setFormData({ ...formData, denNgay: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'thuocpx' && (
            <ThuocPxListEditor
              items={formData.dsThuocPx || []}
              onChange={(nextList) => setFormData({ ...formData, dsThuocPx: nextList })}
              serviceName={formData.tenDichVu}
              serviceCode={formData.maDichVu}
            />
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
            >
              <Save size={15} />
              <span>{initialData ? 'Lưu Thay Đổi' : 'Thêm Vào Danh Mục'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
