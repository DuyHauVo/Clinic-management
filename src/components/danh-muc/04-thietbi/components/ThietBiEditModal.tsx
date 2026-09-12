import React, { useState } from 'react';
import { Cpu, X, Save, ShieldCheck, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import type { DmThietBiItem } from '../../../../types';
import { LOAI_THAU_OPTIONS, HT_THAU_OPTIONS } from '../services/thietBiService';
import { DEFAULT_MA_CSKCB } from '../../../../utils/shared/excelXmlShared';
import { useModalBehavior } from '../../../../hooks/useModalBehavior';

interface ThietBiEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmThietBiItem) => void;
  initialData: DmThietBiItem | null;
}

const getDefaultThietBiData = (): DmThietBiItem => ({
  stt: 1,
  maVatTu: '',
  nhomVatTu: '',
  tenVatTu: '',
  maHieu: '',
  soLuuHanh: '',
  tinhnangKt: '',
  quyCach: '',
  hangSx: '',
  nuocSx: '',
  donViTinh: 'Cái',
  donGia: 0,
  donGiaBh: 0,
  tyleTtBh: 100,
  soLuong: 1,
  dinhMuc: 1,
  nhaThau: '',
  ttThau: '',
  tuNgayHd: '',
  denNgayHd: '',
  maCskcb: DEFAULT_MA_CSKCB,
  loaiThau: 1,
  htThau: 1,
  maCskcbTbyt: '',
  tuNgay: '20250101',
  denNgay: ''
});

const getInitialFormData = (data: DmThietBiItem | null): DmThietBiItem => {
  if (data) {
    return {
      ...data,
      tyleTtBh: data.tyleTtBh ?? 100,
      loaiThau: data.loaiThau ?? 1,
      donViTinh: data.donViTinh || 'Cái',
      maCskcb: data.maCskcb || DEFAULT_MA_CSKCB
    };
  }
  return getDefaultThietBiData();
};

export const ThietBiEditModal: React.FC<ThietBiEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <ThietBiEditModalForm
      key={initialData?.id ?? 'new'}
      initialData={initialData}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

const ThietBiEditModalForm: React.FC<Omit<ThietBiEditModalProps, 'isOpen'>> = ({
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<DmThietBiItem>(() => getInitialFormData(initialData));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isHtThauDisabled = [3, 4, 5, 7].includes(formData.loaiThau);

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
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <Cpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {initialData ? 'Chỉnh Sửa Thiết Bị / Vật Tư Y Tế' : 'Thêm Mới Thiết Bị / Vật Tư Y Tế'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Mẫu 04/DM • Loại HS 11
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo 26 trường thông tin phục vụ giám định và thanh toán BHYT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Section 1: Định Danh & Phân Loại */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-cyan-700">
              <Tag size={14} />
              <span>1. Thông Tin Định Danh & Phân Loại</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  STT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.stt}
                  onChange={(e) => setFormData({ ...formData, stt: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mã Vật Tư / TBYT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: N04.01.001"
                  value={formData.maVatTu}
                  onChange={(e) => setFormData({ ...formData, maVatTu: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên Nhóm Thiết Bị Y Tế <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Kim tiêm, Dây truyền dịch..."
                  value={formData.nhomVatTu}
                  onChange={(e) => setFormData({ ...formData, nhomVatTu: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên Thương Mại Vật Tư / TBYT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tên thương mại theo kết quả trúng thầu..."
                  value={formData.tenVatTu}
                  onChange={(e) => setFormData({ ...formData, tenVatTu: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mã Hiệu (Model)
                </label>
                <input
                  type="text"
                  placeholder="Vd: MH-KT-2024"
                  value={formData.maHieu || ''}
                  onChange={(e) => setFormData({ ...formData, maHieu: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Số Lưu Hành (NĐ 07/2025)
                </label>
                <input
                  type="text"
                  placeholder="Vd: 2400012/ĐKLH/BYT"
                  value={formData.soLuuHanh || ''}
                  onChange={(e) => setFormData({ ...formData, soLuuHanh: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Quy Cách, Tính Năng & Nhà Sản Xuất */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-cyan-700">
              <FileText size={14} />
              <span>2. Quy Cách, Tính Năng Kỹ Thuật & Sản Xuất</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cấu Hình, Tính Năng Kỹ Thuật Cơ Bản
                </label>
                <input
                  type="text"
                  placeholder="Kích thước, cấu tạo, vật liệu..."
                  value={formData.tinhnangKt || ''}
                  onChange={(e) => setFormData({ ...formData, tinhnangKt: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quy Cách Đóng Gói
                </label>
                <input
                  type="text"
                  placeholder="Vd: 1 bộ/túi (Hộp 50 túi)"
                  value={formData.quyCach || ''}
                  onChange={(e) => setFormData({ ...formData, quyCach: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hãng Sản Xuất
                </label>
                <input
                  type="text"
                  placeholder="Vd: B. Braun Medical AG"
                  value={formData.hangSx || ''}
                  onChange={(e) => setFormData({ ...formData, hangSx: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nước Sản Xuất
                </label>
                <input
                  type="text"
                  placeholder="Vd: Đức, Nhật Bản, Mỹ..."
                  value={formData.nuocSx || ''}
                  onChange={(e) => setFormData({ ...formData, nuocSx: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Giá Cả & Thanh Toán BHYT */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-cyan-700">
              <DollarSign size={14} />
              <span>3. Giá Cả & Tỷ Lệ Thanh Toán BHYT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Đơn Vị Tính <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cái, Bộ, Chiếc..."
                  value={formData.donViTinh}
                  onChange={(e) => setFormData({ ...formData, donViTinh: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Đơn Giá Mua / Thầu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.donGia}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      donGia: val,
                      donGiaBh: formData.donGiaBh === 0 ? val : formData.donGiaBh
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Đơn Giá BHYT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.donGiaBh}
                  onChange={(e) => setFormData({ ...formData, donGiaBh: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-cyan-700 font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tỷ Lệ BHYT (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={formData.tyleTtBh}
                  onChange={(e) => setFormData({ ...formData, tyleTtBh: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Số Lượng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.soLuong}
                  onChange={(e) => setFormData({ ...formData, soLuong: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Định Mức Tái SD (Lần)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="1 (hoặc số lần)"
                  value={formData.dinhMuc || ''}
                  onChange={(e) => setFormData({ ...formData, dinhMuc: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Thông Tin Thầu & Mua Sắm */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-cyan-700">
              <ShieldCheck size={14} />
              <span>4. Thông Tin Thầu & Hình Thức Mua Sắm</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nhà Thầu / Đơn Vị Cung Ứng
                </label>
                <input
                  type="text"
                  placeholder="Vd: Công ty CP Dược & TBYT..."
                  value={formData.nhaThau || ''}
                  onChange={(e) => setFormData({ ...formData, nhaThau: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Thông Tin Thầu (QĐ 3176)
                </label>
                <input
                  type="text"
                  placeholder="Vd: 456/QĐ-BV;G1;N1;2024"
                  value={formData.ttThau || ''}
                  onChange={(e) => setFormData({ ...formData, ttThau: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Loại Thầu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.loaiThau}
                  onChange={(e) => {
                    const lThau = Number(e.target.value);
                    setFormData({
                      ...formData,
                      loaiThau: lThau,
                      htThau: [3, 4, 5, 7].includes(lThau) ? undefined : (formData.htThau || 1)
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  {LOAI_THAU_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hình Thức Đấu Thầu
                </label>
                <select
                  disabled={isHtThauDisabled}
                  value={formData.htThau || 1}
                  onChange={(e) => setFormData({ ...formData, htThau: Number(e.target.value) })}
                  className={`w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 ${
                    isHtThauDisabled ? 'opacity-50 bg-slate-100 cursor-not-allowed' : ''
                  }`}
                >
                  {HT_THAU_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {isHtThauDisabled && (
                  <span className="text-[10px] text-slate-400">Không áp dụng cho loại thầu {formData.loaiThau}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Từ Ngày Hợp Đồng (YYYYMMDD)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="20250101"
                  value={formData.tuNgayHd || ''}
                  onChange={(e) => setFormData({ ...formData, tuNgayHd: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Đến Ngày Hợp Đồng (YYYYMMDD)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="20261231"
                  value={formData.denNgayHd || ''}
                  onChange={(e) => setFormData({ ...formData, denNgayHd: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Hiệu Lực & Cơ Sở KCB */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-cyan-700">
              <Calendar size={14} />
              <span>5. Hiệu Lực Áp Dụng & Cơ Sở KCB</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mã Cơ Sở KCB <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="48001"
                  value={formData.maCskcb}
                  onChange={(e) => setFormData({ ...formData, maCskcb: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mã CSKCB Chuyển Đi (Nếu điều chuyển)
                </label>
                <input
                  type="text"
                  placeholder="C.48001"
                  value={formData.maCskcbTbyt || ''}
                  onChange={(e) => setFormData({ ...formData, maCskcbTbyt: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Từ Ngày Áp Dụng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="20250101"
                  value={formData.tuNgay}
                  onChange={(e) => setFormData({ ...formData, tuNgay: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Đến Ngày Áp Dụng
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Để trống nếu đang áp dụng"
                  value={formData.denNgay || ''}
                  onChange={(e) => setFormData({ ...formData, denNgay: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

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
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-colors"
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
