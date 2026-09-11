import React, { useState, useEffect } from 'react';
import { User, FileText, DollarSign, Calendar, ShieldCheck, X } from 'lucide-react';
import type { Hs01TongHopItem } from '../services/hs01TongHopService';
import { LOAI_KCB_OPTIONS } from '../services/hs01TongHopService';
import { useModalBehavior } from '../../../../hooks/useModalBehavior';
import { validateHs01Data } from '../../../../utils/validators';
import { useToast } from '../../../../context/ToastContext';

interface Hs01EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Hs01TongHopItem) => void;
  initialData: Hs01TongHopItem | null;
  totalItemsCount?: number;
}

const getDefaultHs01Data = (count = 0): Hs01TongHopItem => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const ymdHm = `${y}${m}${d}0800`;
  const ymdHmRa = `${y}${m}${d}1100`;

  return {
    id: '',
    stt: count + 1,
    hoTen: '',
    ngaySinh: '199001010000',
    gioiTinh: '1',
    maTheBhyt: 'DN479',
    maBenhChinh: 'I10',
    ngayVao: ymdHm,
    ngayVaoNoiTru: '',
    ngayRa: ymdHmRa,
    soNgayDtri: 1,
    maLoaiKcb: '01',
    tTongchiBv: 0,
    tTongchiBh: 0,
    tBhtt: 0,
    tBncct: 0,
    tBntt: 0,
    tNguonkhac: 0,
    maCskcb: '01929',
    namQt: y,
    thangQt: m,
    trangThai: 'hop_le',
    isValid: true,
    errors: []
  };
};

export const Hs01EditModal: React.FC<Hs01EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalItemsCount = 0
}) => {
  const toast = useToast();
  useModalBehavior(isOpen, onClose);

  const [formData, setFormData] = useState<Hs01TongHopItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultHs01Data(totalItemsCount);
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(getDefaultHs01Data(totalItemsCount));
      }
    }
  }, [isOpen, initialData, totalItemsCount]);

  if (!isOpen) return null;

  const handleCalculateCosts = (field: string, val: number) => {
    const updated = { ...formData, [field]: val };
    // Nếu thay đổi T_TONGCHI_BH, tính gợi ý 80% BHYT
    if (field === 'tTongchiBh') {
      updated.tBhtt = Math.round(val * 0.8);
      updated.tBncct = Math.max(0, val - updated.tBhtt);
      updated.tTongchiBv = updated.tTongchiBh + (updated.tBntt || 0) + (updated.tNguonkhac || 0);
    } else if (field === 'tBhtt') {
      updated.tBncct = Math.max(0, updated.tTongchiBh - val);
    } else if (field === 'tBntt' || field === 'tNguonkhac') {
      updated.tTongchiBv = (updated.tTongchiBh || 0) + (updated.tBntt || 0) + (updated.tNguonkhac || 0);
    }
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateHs01Data(formData);
    if (errors.length > 0) {
      toast.warning(errors[0], 'Dữ Liệu Chưa Hợp Lệ');
      return;
    }

    onSave({
      ...formData,
      hoTen: formData.hoTen.trim(),
      maTheBhyt: formData.maTheBhyt.trim().toUpperCase(),
      isValid: true,
      errors: []
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
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {initialData ? 'Chỉnh Sửa Hồ Sơ Tổng Hợp (Mẫu 01/BH)' : 'Thêm Mới Hồ Sơ Tổng Hợp (Mẫu 01/BH - Loại 5)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đặc tả kỹ thuật 20 trường thông tin chuẩn gửi Cổng giám định BHYT (XML &lt;HSTH01BH&gt;)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Section 1: Thông tin hành chính bệnh nhân */}
          <div>
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={15} />
              <span>1. Thông Tin Người Bệnh & Thẻ BHYT</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
              <div className="lg:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên người bệnh (HO_TEN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: NGUYỄN VĂN A"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mã thẻ BHYT (MA_THE_BHYT) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="vd: DN4791234567890"
                  value={formData.maTheBhyt}
                  onChange={(e) => setFormData({ ...formData, maTheBhyt: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-indigo-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Giới tính (GIOI_TINH) *
                </label>
                <select
                  value={formData.gioiTinh}
                  onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="1">1 - Nam</option>
                  <option value="2">2 - Nữ</option>
                  <option value="3">3 - Chưa xác định</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ngày sinh 12 số (NGAY_SINH) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="YYYYMMDDHHmm"
                  value={formData.ngaySinh}
                  onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  STT trong lần gửi *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.stt}
                  onChange={(e) => setFormData({ ...formData, stt: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mã CSKCB (MA_CSKCB) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={formData.maCskcb}
                  onChange={(e) => setFormData({ ...formData, maCskcb: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kỳ Quyết Toán (THANG_QT / NAM_QT) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="Tháng"
                    value={formData.thangQt}
                    onChange={(e) => setFormData({ ...formData, thangQt: e.target.value })}
                    className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    required
                    placeholder="Năm"
                    value={formData.namQt}
                    onChange={(e) => setFormData({ ...formData, namQt: Number(e.target.value) })}
                    className="w-24 px-2 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin KBCB & Chẩn đoán */}
          <div>
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={15} />
              <span>2. Thông Tin Khám Chữa Bệnh & Thời Gian</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mã Bệnh Chính ICD-10 (MA_BENH_CHINH) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  placeholder="vd: I10, K29.0"
                  value={formData.maBenhChinh}
                  onChange={(e) => setFormData({ ...formData, maBenhChinh: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-rose-700 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hình thức KBCB (MA_LOAI_KCB) *
                </label>
                <select
                  value={formData.maLoaiKcb}
                  onChange={(e) => setFormData({ ...formData, maLoaiKcb: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  {LOAI_KCB_OPTIONS.map((o) => (
                    <option key={o.code} value={o.code}>
                      [{o.code}] {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Thời điểm vào KBCB (NGAY_VAO) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="YYYYMMDDHHmm"
                  value={formData.ngayVao}
                  onChange={(e) => setFormData({ ...formData, ngayVao: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Thời điểm vào nội trú (NGAY_VAO_NOI_TRU)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="YYYYMMDDHHmm (nếu có)"
                  value={formData.ngayVaoNoiTru || ''}
                  onChange={(e) => setFormData({ ...formData, ngayVaoNoiTru: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Thời điểm ra viện / kết thúc (NGAY_RA) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="YYYYMMDDHHmm"
                  value={formData.ngayRa}
                  onChange={(e) => setFormData({ ...formData, ngayRa: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Số ngày điều trị (SO_NGAY_DTRI) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.soNgayDtri}
                  onChange={(e) => setFormData({ ...formData, soNgayDtri: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Chi phí viện phí & BHYT thanh toán */}
          <div>
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign size={15} />
              <span>3. Cơ Cấu Chi Phí KBCB & Đề Nghị Thanh Toán</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tổng chi phí BV (T_TONGCHI_BV) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={formData.tTongchiBv}
                  onChange={(e) => handleCalculateCosts('tTongchiBv', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tổng chi trong phạm vi BHYT (T_TONGCHI_BH) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={formData.tTongchiBh}
                  onChange={(e) => handleCalculateCosts('tTongchiBh', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-blue-700 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-700 mb-1">
                  Tiền BHYT Thanh Toán (T_BHTT) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={formData.tBhtt}
                  onChange={(e) => handleCalculateCosts('tBhtt', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl font-black text-emerald-700 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-700 mb-1">
                  Người bệnh cùng chi trả (T_BNCCT) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={formData.tBncct}
                  onChange={(e) => setFormData({ ...formData, tBncct: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-bold text-amber-800 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Người bệnh tự trả ngoài BH (T_BNTT)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.tBntt}
                  onChange={(e) => handleCalculateCosts('tBntt', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nguồn khác chi trả (T_NGUONKHAC)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.tNguonkhac || 0}
                  onChange={(e) => handleCalculateCosts('tNguonkhac', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>{initialData ? 'Cập Nhật Hồ Sơ 01/BH' : 'Lưu Hồ Sơ Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
