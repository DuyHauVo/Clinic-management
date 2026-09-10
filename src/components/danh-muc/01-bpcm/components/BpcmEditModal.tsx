import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import type { DmBpcmItem } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';

interface BpcmEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmBpcmItem) => void;
  initialData: DmBpcmItem | null;
}

const getDefaultBpcmData = (): DmBpcmItem => ({
  stt: 1,
  maKhoa: '',
  tenKhoa: '',
  banKham: 1,
  giuongPd: 0,
  giuongTk: 0,
  giuongHstc: 0,
  giuongHscc: 0,
  tuNgay: '',
  denNgay: '',
  maCskcb: '01929'
});

export const BpcmEditModal: React.FC<BpcmEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<DmBpcmItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultBpcmData();
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(getDefaultBpcmData());
      }
    }
  }, [isOpen, initialData]);

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
