import React, { useState, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
import type { DmDichVuItem } from '../../../../types';

interface DichVuEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmDichVuItem) => void;
  initialData: DmDichVuItem | null;
}

const getDefaultDichVuData = (): DmDichVuItem => ({
  id: '',
  stt: 1,
  maDichVu: '',
  tenDichVu: '',
  loaiDv: 'Khám bệnh',
  giaBhyt: 0,
  giaVienPhi: 0,
  khoaThucHien: 'Khoa Khám Bệnh Đa Khoa',
  maCskcb: '01929'
});

export const DichVuEditModal: React.FC<DichVuEditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<DmDichVuItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultDichVuData();
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(getDefaultDichVuData());
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Stethoscope size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {initialData ? 'Chỉnh Sửa Dịch Vụ Kỹ Thuật' : 'Thêm Mới Dịch Vụ Kỹ Thuật (Mẫu 05/DM)'}
              </h3>
              <p className="text-xs text-slate-500">Quy định Mẫu 05/DM - Loại hồ sơ 12</p>
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
            <label className="block font-bold text-slate-700 mb-1">Mã Dịch Vụ (BYT) *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-teal-500"
              placeholder="vd: 01.0022.0001"
              value={formData.maDichVu}
              onChange={(e) => setFormData({ ...formData, maDichVu: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phân Loại Dịch Vụ</label>
            <select
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
              value={formData.loaiDv}
              onChange={(e) => setFormData({ ...formData, loaiDv: e.target.value as DmDichVuItem['loaiDv'] })}
            >
              <option value="Khám bệnh">Khám bệnh</option>
              <option value="Thăm dò chức năng">Thăm dò chức năng</option>
              <option value="Chẩn đoán hình ảnh">Chẩn đoán hình ảnh</option>
              <option value="Xét nghiệm">Xét nghiệm</option>
              <option value="Phẫu thuật - Thủ thuật">Phẫu thuật - Thủ thuật</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên Dịch Vụ Kỹ Thuật *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
              placeholder="vd: Khám bệnh chuyên khoa Tim mạch"
              value={formData.tenDichVu}
              onChange={(e) => setFormData({ ...formData, tenDichVu: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Giá BHYT (VNĐ) *</label>
            <input
              type="number"
              min={0}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
              value={formData.giaBhyt}
              onChange={(e) => setFormData({ ...formData, giaBhyt: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Giá Viện Phí (VNĐ) *</label>
            <input
              type="number"
              min={0}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
              value={formData.giaVienPhi}
              onChange={(e) => setFormData({ ...formData, giaVienPhi: Number(e.target.value) })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Khoa Thực Hiện</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-teal-500"
              placeholder="vd: Khoa Khám Bệnh Đa Khoa"
              value={formData.khoaThucHien}
              onChange={(e) => setFormData({ ...formData, khoaThucHien: e.target.value })}
            />
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20"
            >
              Lưu Thông Tin Dịch Vụ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
