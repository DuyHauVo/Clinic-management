import React, { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import type { DmThuocItem } from '../../../../types';

interface ThuocEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmThuocItem) => void;
  initialData: DmThuocItem | null;
}

const getDefaultThuocData = (): DmThuocItem => ({
  id: '',
  stt: 1,
  maThuocBhyt: '',
  tenHoatChat: '',
  tenThuoc: '',
  hamLuong: '',
  duongDung: 'Uống',
  dangBaoChe: 'Viên nén',
  donViTinh: 'Viên',
  donGia: 0,
  tyLeThanhToan: 100,
  soDangKy: '',
  maCskcb: '01929'
});

export const ThuocEditModal: React.FC<ThuocEditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<DmThuocItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultThuocData();
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(getDefaultThuocData());
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Pill size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {initialData ? 'Chỉnh Sửa Thuốc' : 'Thêm Mới Thuốc (Mẫu 03/DM)'}
              </h3>
              <p className="text-xs text-slate-500">Quy định Mẫu 03/DM - Loại hồ sơ 10</p>
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mã Thuốc BHYT *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
              placeholder="vd: 40.123"
              value={formData.maThuocBhyt}
              onChange={(e) => setFormData({ ...formData, maThuocBhyt: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Số Đăng Ký / GPNK</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-emerald-500"
              placeholder="vd: VD-24512-16"
              value={formData.soDangKy}
              onChange={(e) => setFormData({ ...formData, soDangKy: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên Thương Mại (Biệt Dược) *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              placeholder="vd: Amlodipine 5mg Hasan"
              value={formData.tenThuoc}
              onChange={(e) => setFormData({ ...formData, tenThuoc: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên Hoạt Chất *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
              placeholder="vd: Amlodipine"
              value={formData.tenHoatChat}
              onChange={(e) => setFormData({ ...formData, tenHoatChat: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hàm Lượng</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
              placeholder="vd: 5mg, 500mg/5ml"
              value={formData.hamLuong}
              onChange={(e) => setFormData({ ...formData, hamLuong: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Đơn Vị Tính</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
              placeholder="vd: Viên, Chai, Gói"
              value={formData.donViTinh}
              onChange={(e) => setFormData({ ...formData, donViTinh: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Đơn Giá BHYT (VNĐ) *</label>
            <input
              type="number"
              min={0}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              value={formData.donGia}
              onChange={(e) => setFormData({ ...formData, donGia: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tỷ Lệ Thanh Toán (%) *</label>
            <select
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              value={formData.tyLeThanhToan}
              onChange={(e) => setFormData({ ...formData, tyLeThanhToan: Number(e.target.value) })}
            >
              <option value={100}>100%</option>
              <option value={80}>80%</option>
              <option value={50}>50%</option>
              <option value={30}>30%</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              Lưu Thông Tin Thuốc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
