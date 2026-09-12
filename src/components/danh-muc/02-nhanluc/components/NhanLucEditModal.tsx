import React, { useState } from 'react';
import { Users } from 'lucide-react';
import type { DmNhanLucItem } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { DEFAULT_MA_CSKCB } from '../../../../utils/shared/excelXmlShared';
import { useModalBehavior } from '../../../../hooks/useModalBehavior';

interface NhanLucEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DmNhanLucItem) => void;
  initialData: DmNhanLucItem | null;
}

const getDefaultNhanLucData = (): DmNhanLucItem => ({
  stt: 1,
  maKhoa: '',
  tenKhoa: '',
  hoTen: '',
  gioiTinh: 1,
  soDinhDanh: '',
  chucDanhNn: '1',
  viTri: '',
  macchn: '',
  ngaycapCchn: '',
  noicapCchn: '',
  phamviCm: '',
  phamviCmbs: '',
  dvktKhac: '',
  vbPhancong: '',
  thoigianDk: 1,
  thoigianNgay: '0730-1630',
  thoigianTuan: 'T2T3T4T5T6',
  cskcbKhac: '',
  cskcbCgkt: '',
  qdCgkt: '',
  tuNgay: '',
  denNgay: '',
  maCskcb: DEFAULT_MA_CSKCB
});

export const NhanLucEditModal: React.FC<NhanLucEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <NhanLucEditModalContent
      key={initialData?.id ?? 'new'}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    />
  );
};

interface NhanLucEditModalContentProps {
  onClose: () => void;
  onSave: (item: DmNhanLucItem) => void;
  initialData: DmNhanLucItem | null;
}

const NhanLucEditModalContent: React.FC<NhanLucEditModalContentProps> = ({
  onClose,
  onSave,
  initialData
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<DmNhanLucItem>(() => {
    if (initialData) return { ...initialData };
    return getDefaultNhanLucData();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen.trim()) {
      toast.warning('Vui lòng nhập Họ và tên nhân lực (HO_TEN)', 'Thiếu Dữ Liệu');
      return;
    }
    if (!formData.soDinhDanh.trim()) {
      toast.warning('Vui lòng nhập Số định danh / CCCD (SO_DINH_DANH)', 'Thiếu Dữ Liệu');
      return;
    }
    if (!formData.maKhoa.trim()) {
      toast.warning('Vui lòng nhập Mã khoa / Bàn khám (MA_KHOA)', 'Thiếu Dữ Liệu');
      return;
    }
    if (!formData.tuNgay.trim() || formData.tuNgay.length !== 8) {
      toast.warning('Vui lòng nhập Từ ngày đúng định dạng 8 ký tự YYYYMMDD (TU_NGAY)', 'Sai Định Dạng');
      return;
    }
    onSave(formData);
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
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {initialData ? 'Chỉnh Sửa Nhân Lực KCB (Mẫu 02/DM)' : 'Thêm Mới Nhân Lực KCB (Mẫu 02/DM)'}
                </h3>
                <p className="text-xs text-slate-500">Đặc tả chuẩn BHXH Việt Nam - Loại hồ sơ 71</p>
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

          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* 1. Thông tin chung */}
            <div className="md:col-span-3 pb-1 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
              1. Thông Tin Cá Nhân & Chức Danh
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Họ Và Tên (HO_TEN) *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                placeholder="vd: BS. CKII. Nguyễn Văn An"
                value={formData.hoTen}
                onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giới Tính (GIOI_TINH) *</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                value={formData.gioiTinh}
                onChange={(e) => setFormData({ ...formData, gioiTinh: Number(e.target.value) })}
              >
                <option value={1}>1: Nam</option>
                <option value={2}>2: Nữ</option>
                <option value={3}>3: Chưa xác định</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Định Danh / CCCD (SO_DINH_DANH) *</label>
              <input
                type="text"
                required
                maxLength={15}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                placeholder="12 chữ số CCCD"
                value={formData.soDinhDanh}
                onChange={(e) => setFormData({ ...formData, soDinhDanh: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chức Danh Nghề Nghiệp (CHUCDANH_NN) *</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                value={formData.chucDanhNn}
                onChange={(e) => setFormData({ ...formData, chucDanhNn: e.target.value })}
              >
                <option value="1">1: Bác sỹ</option>
                <option value="2">2: Y sỹ</option>
                <option value="3">3: Điều dưỡng</option>
                <option value="4">4: Hộ sinh</option>
                <option value="5">5: Kỹ thuật y</option>
                <option value="6">6: Cử nhân tâm lý LS</option>
                <option value="7">7: Lương y</option>
                <option value="8">8: Dược sỹ</option>
                <option value="9">9: Khác (không cần CCHN)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Vị Trí Chuyên Môn (VI_TRI)</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-500"
                value={formData.viTri || ''}
                onChange={(e) => setFormData({ ...formData, viTri: e.target.value || undefined })}
              >
                <option value="">-- Không có chức vụ quản lý --</option>
                <option value="1">1: Người chịu TN chuyên môn</option>
                <option value="2">2: Trưởng khoa / Trưởng ĐN</option>
                <option value="3">3: Người chịu TNCM kiêm Trưởng khoa</option>
                <option value="4">4: Người đứng đầu / Ủy quyền ký giấy</option>
                <option value="5">5: Phụ trách khoa</option>
                <option value="6">6: Người được ủy quyền theo NĐ 96</option>
              </select>
            </div>

            {/* 2. Khoa phòng & Nơi làm việc */}
            <div className="md:col-span-3 pt-2 pb-1 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
              2. Phân Công Khoa Phòng & Địa Bàn Làm Việc
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã Khoa / Bàn Khám (MA_KHOA) *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                placeholder="vd: K01 hoặc K01;K02"
                value={formData.maKhoa}
                onChange={(e) => setFormData({ ...formData, maKhoa: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tên Khoa / Phòng (TEN_KHOA) *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                placeholder="vd: Khoa Khám Bệnh;Khoa Hồi Sức Cấp Cứu"
                value={formData.tenKhoa}
                onChange={(e) => setFormData({ ...formData, tenKhoa: e.target.value })}
              />
            </div>

            {/* 3. Chứng chỉ hành nghề & Chuyên môn */}
            <div className="md:col-span-3 pt-2 pb-1 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
              3. Giấy Phép / Chứng Chỉ Hành Nghề (CCHN)
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số CCHN / GPHN (MACCHN)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                placeholder="vd: 001234/BYT-CCHN"
                value={formData.macchn || ''}
                onChange={(e) => setFormData({ ...formData, macchn: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày Cấp CCHN (NGAYCAP_CCHN)</label>
              <input
                type="text"
                maxLength={8}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                placeholder="YYYYMMDD (vd: 20180515)"
                value={formData.ngaycapCchn || ''}
                onChange={(e) => setFormData({ ...formData, ngaycapCchn: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nơi Cấp CCHN (NOICAP_CCHN)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-500"
                placeholder="Bộ Y Tế / Sở Y Tế..."
                value={formData.noicapCchn || ''}
                onChange={(e) => setFormData({ ...formData, noicapCchn: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Phạm Vi Chuyên Môn (PHAMVI_CM)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-500"
                placeholder="Nội khoa, Cấp cứu Hồi sức..."
                value={formData.phamviCm || ''}
                onChange={(e) => setFormData({ ...formData, phamviCm: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bổ Sung Phạm Vi (PHAMVI_CMBS)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                placeholder="YYYYMMDD_Z"
                value={formData.phamviCmbs || ''}
                onChange={(e) => setFormData({ ...formData, phamviCmbs: e.target.value })}
              />
            </div>

            {/* 4. Thời gian làm việc */}
            <div className="md:col-span-3 pt-2 pb-1 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
              4. Chế Độ & Thời Gian Làm Việc
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Thời Gian Đăng Ký (THOIGIAN_DK) *</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                value={formData.thoigianDk}
                onChange={(e) => setFormData({ ...formData, thoigianDk: Number(e.target.value) })}
              >
                <option value={1}>1: Toàn thời gian</option>
                <option value={2}>2: Không toàn thời gian (Bán thời gian)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giờ Làm Việc Trong Ngày (THOIGIAN_NGAY)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                placeholder="0730-1630 hoặc T20800-1500;..."
                value={formData.thoigianNgay || ''}
                onChange={(e) => setFormData({ ...formData, thoigianNgay: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày Trong Tuần (THOIGIAN_TUAN)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                placeholder="T2T3T4T5T6, CN..."
                value={formData.thoigianTuan || ''}
                onChange={(e) => setFormData({ ...formData, thoigianTuan: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Từ Ngày Hiệu Lực (TU_NGAY) *</label>
              <input
                type="text"
                required
                maxLength={8}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                placeholder="20260101"
                value={formData.tuNgay}
                onChange={(e) => setFormData({ ...formData, tuNgay: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Đến Ngày (DEN_NGAY - Tùy chọn)</label>
              <input
                type="text"
                maxLength={8}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-indigo-500"
                placeholder="Để trống nếu đang áp dụng"
                value={formData.denNgay || ''}
                onChange={(e) => setFormData({ ...formData, denNgay: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã Cơ Sở KCB (MA_CSKCB) *</label>
              <input
                type="text"
                required
                maxLength={5}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                value={formData.maCskcb}
                onChange={(e) => setFormData({ ...formData, maCskcb: e.target.value })}
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              Lưu Thông Tin Nhân Lực (02/DM)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
