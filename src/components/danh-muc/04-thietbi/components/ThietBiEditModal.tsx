import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import type { DmThietBiItem } from '../../../../types';

interface ThietBiEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmThietBiItem) => void;
  initialData: DmThietBiItem | null;
}

const getDefaultThietBiData = (): DmThietBiItem => ({
  id: '',
  stt: 1,
  maTbyt: '',
  tenTbyt: '',
  hangSx: '',
  nuocSx: '',
  namSx: new Date().getFullYear(),
  soLuuHanh: '',
  khoaSuDung: 'Khoa Khám Bệnh',
  tinhTrang: 'Đang hoạt động',
  maCskcb: '01929'
});

export const ThietBiEditModal: React.FC<ThietBiEditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<DmThietBiItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultThietBiData();
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(getDefaultThietBiData());
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {initialData ? 'Chỉnh Sửa Thiết Bị Y Tế' : 'Thêm Mới Thiết Bị Y Tế (Mẫu 04/DM)'}
              </h3>
              <p className="text-xs text-slate-500">Quy định Mẫu 04/DM - Loại hồ sơ 72</p>
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
            <label className="block font-bold text-slate-700 mb-1">Mã Thiết Bị (MA_TBYT) *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-cyan-500"
              placeholder="vd: TBYT-01929-01"
              value={formData.maTbyt}
              onChange={(e) => setFormData({ ...formData, maTbyt: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Số Lưu Hành / GPNK</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-cyan-500"
              placeholder="vd: 2200192/BYT-TB"
              value={formData.soLuuHanh}
              onChange={(e) => setFormData({ ...formData, soLuuHanh: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên Thiết Bị Y Tế (TEN_TBYT) *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-cyan-500"
              placeholder="vd: Hệ thống Máy chụp X-quang Kỹ thuật số DR"
              value={formData.tenTbyt}
              onChange={(e) => setFormData({ ...formData, tenTbyt: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hãng Sản Xuất</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
              placeholder="vd: Siemens Healthcare, GE"
              value={formData.hangSx}
              onChange={(e) => setFormData({ ...formData, hangSx: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nước Sản Xuất</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
              placeholder="vd: Đức, Mỹ, Nhật Bản"
              value={formData.nuocSx}
              onChange={(e) => setFormData({ ...formData, nuocSx: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Năm Sản Xuất</label>
            <input
              type="number"
              min={1990}
              max={2030}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-cyan-500"
              value={formData.namSx}
              onChange={(e) => setFormData({ ...formData, namSx: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tình Trạng Hoạt Động</label>
            <select
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-cyan-500"
              value={formData.tinhTrang}
              onChange={(e) => setFormData({ ...formData, tinhTrang: e.target.value as DmThietBiItem['tinhTrang'] })}
            >
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Bảo trì">Bảo trì</option>
              <option value="Ngừng sử dụng">Ngừng sử dụng</option>
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
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs shadow-md shadow-cyan-600/20"
            >
              Lưu Thông Tin Thiết Bị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
