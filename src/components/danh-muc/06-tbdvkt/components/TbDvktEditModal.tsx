import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import type { DmTbDvktItem } from '../../../../types';

interface TbDvktEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmTbDvktItem) => void;
  initialData: DmTbDvktItem | null;
}

const getDefaultTbDvktData = (): DmTbDvktItem => ({
  id: '',
  stt: 1,
  maDvkt: '',
  tenDvkt: '',
  maTbyt: '',
  tenTbyt: '',
  dinhMucTieuHao: '1 lượt',
  maCskcb: '01929'
});

export const TbDvktEditModal: React.FC<TbDvktEditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<DmTbDvktItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultTbDvktData();
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(getDefaultTbDvktData());
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Wrench size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {initialData ? 'Chỉnh Sửa Liên Kết Thiết Bị - DVKT' : 'Thêm Mới Liên Kết Thiết Bị - DVKT (Mẫu 06/DM)'}
              </h3>
              <p className="text-xs text-slate-500">Quy định Mẫu 06/DM - Loại hồ sơ 73</p>
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
            <label className="block font-bold text-slate-700 mb-1">Mã DVKT (MA_DVKT) *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-amber-500"
              placeholder="vd: 03.0015.0112"
              value={formData.maDvkt}
              onChange={(e) => setFormData({ ...formData, maDvkt: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mã TBYT (MA_TBYT) *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-amber-500"
              placeholder="vd: TBYT-01929-03"
              value={formData.maTbyt}
              onChange={(e) => setFormData({ ...formData, maTbyt: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên Dịch Vụ Kỹ Thuật *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
              placeholder="vd: Điện tâm đồ (ECG 12 chuyển đạo tiêu chuẩn)"
              value={formData.tenDvkt}
              onChange={(e) => setFormData({ ...formData, tenDvkt: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên Thiết Bị Y Tế Liên Kết *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
              placeholder="vd: Máy đo điện tim 12 cần Nihon Kohden Cardimax"
              value={formData.tenTbyt}
              onChange={(e) => setFormData({ ...formData, tenTbyt: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Định Mức Tiêu Hao / Sử Dụng</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500"
              placeholder="vd: 1 cuộn giấy / 100 lượt"
              value={formData.dinhMucTieuHao}
              onChange={(e) => setFormData({ ...formData, dinhMucTieuHao: e.target.value })}
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-600/20"
            >
              Lưu Thông Tin Liên Kết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
