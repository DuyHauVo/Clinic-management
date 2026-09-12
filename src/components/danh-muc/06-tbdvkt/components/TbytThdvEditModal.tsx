import React, { useState } from 'react';
import { Cpu, X, Save, Building2, FileText } from 'lucide-react';
import type { DmTbytThdvItem } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { useModalBehavior } from '../../../../hooks/useModalBehavior';
import { isValidYmdDate, DEFAULT_MA_CSKCB, getTodayYmd } from '../../../../utils/shared/excelXmlShared';

interface TbytThdvEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmTbytThdvItem) => void;
  initialData: DmTbytThdvItem | null;
}

const getDefaultTbytThdvData = (): DmTbytThdvItem => ({
  stt: 1,
  tenTb: '',
  kyHieu: '',
  congTySx: '',
  nuocSx: '',
  namSx: undefined,
  namSd: undefined,
  maMay: '',
  soLuuHanh: '',
  hdTu: '',
  hdDen: '',
  tuNgay: getTodayYmd(),
  denNgay: '',
  maCskcb: DEFAULT_MA_CSKCB
});

export const TbytThdvEditModal: React.FC<TbytThdvEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <TbytThdvEditModalContent
      key={initialData?.id ?? 'new'}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    />
  );
};

interface TbytThdvEditModalContentProps {
  onClose: () => void;
  onSave: (item: DmTbytThdvItem) => void;
  initialData: DmTbytThdvItem | null;
}

const TbytThdvEditModalContent: React.FC<TbytThdvEditModalContentProps> = ({
  onClose,
  onSave,
  initialData
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<DmTbytThdvItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultTbytThdvData();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenTb.trim()) {
      toast.warning('Vui lòng nhập Tên thiết bị y tế (TEN_TB)', 'Thiếu Dữ Liệu');
      return;
    }
    if (!formData.maMay.trim()) {
      toast.warning('Vui lòng nhập Mã máy theo QĐ 3176 (MA_MAY)', 'Thiếu Dữ Liệu');
      return;
    }
    const cleanTuNgay = formData.tuNgay.trim();
    if (!cleanTuNgay || !isValidYmdDate(cleanTuNgay)) {
      toast.warning('Từ ngày áp dụng (TU_NGAY) phải là ngày hợp lệ định dạng YYYYMMDD (8 chữ số)', 'Ngày Không Hợp Lệ');
      return;
    }
    if (formData.denNgay?.trim() && !isValidYmdDate(formData.denNgay.trim())) {
      toast.warning('Đến ngày áp dụng (DEN_NGAY) phải là ngày hợp lệ định dạng YYYYMMDD (8 chữ số)', 'Ngày Không Hợp Lệ');
      return;
    }
    if (formData.hdTu?.trim() && !isValidYmdDate(formData.hdTu.trim())) {
      toast.warning('Hợp đồng thuê từ (HD_TU) phải là ngày hợp lệ định dạng YYYYMMDD (8 chữ số)', 'Ngày Không Hợp Lệ');
      return;
    }
    if (formData.hdDen?.trim() && !isValidYmdDate(formData.hdDen.trim())) {
      toast.warning('Hợp đồng thuê đến (HD_DEN) phải là ngày hợp lệ định dạng YYYYMMDD (8 chữ số)', 'Ngày Không Hợp Lệ');
      return;
    }

    onSave({
      ...formData,
      tenTb: formData.tenTb.trim(),
      maMay: formData.maMay.trim(),
      tuNgay: cleanTuNgay,
      denNgay: formData.denNgay?.trim() || '',
      hdTu: formData.hdTu?.trim() || '',
      hdDen: formData.hdDen?.trim() || '',
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
      aria-labelledby="edit-modal-title"
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Cpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="edit-modal-title" className="text-base font-extrabold text-slate-900">
                  {initialData ? 'Chỉnh Sửa Thiết Bị Y Tế Thực Hiện DVKT' : 'Thêm Mới Thiết Bị Y Tế Thực Hiện DVKT'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Mẫu 06/DM • Loại HS 72
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo 14 trường thông tin chuẩn phục vụ giám định BHYT theo QĐ 3176/QĐ-BYT &amp; NĐ 07/2025/NĐ-CP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Nhóm 1: Thông tin định danh TBYT & Mã máy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={14} />
              <span>1. Tên Thiết Bị & Mã Máy Thực Hiện DVKT</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Tên Thiết Bị Y Tế (TEN_TB) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Máy thở đa năng kèm khí nén..."
                  value={formData.tenTb}
                  onChange={(e) => setFormData({ ...formData, tenTb: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Mã Máy QĐ 3176 (MA_MAY) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="79001.01.001"
                  value={formData.maMay}
                  onChange={(e) => setFormData({ ...formData, maMay: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-purple-700 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Model / Ký Hiệu (KY_HIEU)</label>
                <input
                  type="text"
                  placeholder="Servo-air, FDR Smart X..."
                  value={formData.kyHieu || ''}
                  onChange={(e) => setFormData({ ...formData, kyHieu: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Số Lưu Hành NĐ 07 (SO_LUU_HANH)</label>
                <input
                  type="text"
                  placeholder="2100123/ĐKLH/BYT-TB"
                  value={formData.soLuuHanh || ''}
                  onChange={(e) => setFormData({ ...formData, soLuuHanh: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mã CSKCB (MA_CSKCB) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.maCskcb}
                  onChange={(e) => setFormData({ ...formData, maCskcb: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 2: Nguồn gốc xuất xứ & Năm sản xuất */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={14} />
              <span>2. Nhà Sản Xuất & Niên Hạn Sử Dụng</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Công Ty Sản Xuất (CONGTY_SX)</label>
                <input
                  type="text"
                  placeholder="Siemens, Fujifilm, Maquet..."
                  value={formData.congTySx || ''}
                  onChange={(e) => setFormData({ ...formData, congTySx: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nước Sản Xuất (NUOC_SX)</label>
                <input
                  type="text"
                  placeholder="Đức, Nhật Bản, Mỹ..."
                  value={formData.nuocSx || ''}
                  onChange={(e) => setFormData({ ...formData, nuocSx: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Năm SX</label>
                  <input
                    type="number"
                    min={1990}
                    max={2030}
                    placeholder="2020"
                    value={formData.namSx !== undefined ? formData.namSx : ''}
                    onChange={(e) => setFormData({ ...formData, namSx: e.target.value === '' ? undefined : Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-purple-500 outline-none text-center"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Năm SD</label>
                  <input
                    type="number"
                    min={1990}
                    max={2030}
                    placeholder="2021"
                    value={formData.namSd !== undefined ? formData.namSd : ''}
                    onChange={(e) => setFormData({ ...formData, namSd: e.target.value === '' ? undefined : Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-purple-500 outline-none text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nhóm 3: Hợp đồng thuê mượn & Thời gian áp dụng */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} />
              <span>3. Hợp Đồng Thuê / Mượn & Thời Gian Áp Dụng BHYT</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">HĐ Thuê/Mượn Từ (HD_TU)</label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="YYYYMMDD"
                  value={formData.hdTu || ''}
                  onChange={(e) => setFormData({ ...formData, hdTu: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">HĐ Thuê/Mượn Đến (HD_DEN)</label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="YYYYMMDD"
                  value={formData.hdDen || ''}
                  onChange={(e) => setFormData({ ...formData, hdDen: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Từ Ngày (TU_NGAY) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="YYYYMMDD"
                  value={formData.tuNgay}
                  onChange={(e) => setFormData({ ...formData, tuNgay: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Đến Ngày (DEN_NGAY)</label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Để trống nếu đang áp dụng"
                  value={formData.denNgay || ''}
                  onChange={(e) => setFormData({ ...formData, denNgay: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:border-purple-500 outline-none"
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-colors"
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
