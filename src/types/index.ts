export type AppointmentStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

// ==========================================
// 1. DANH MỤC 01/DM: BỘ PHẬN CHUYÊN MÔN (LOẠI 70)
// ==========================================
export interface DmBpcmItem {
  id?: string;
  stt: number;
  maKhoa: string;
  tenKhoa: string;
  banKham: number;
  giuongPd: number;
  giuongTk: number;
  giuongHstc: number;
  giuongHscc: number;
  tuNgay: string; // YYYYMMDD
  denNgay?: string; // YYYYMMDD hoặc để trống
  maCskcb: string; // 5 ký tự (vd: 01929, 79012)
  isValid?: boolean;
  errors?: string[];
}

// ==========================================
// 2. DANH MỤC 02/DM: NHÂN LỰC KCB BHYT (LOẠI 71 - GuiDanhMuc02_NLKCB)
// ==========================================
export interface DmNhanLucItem {
  id?: string;
  stt: number;
  maKhoa: string; // 100
  tenKhoa: string; // n
  hoTen: string; // 250
  gioiTinh: number; // 1: Nam, 2: Nữ, 3: Chưa xác định
  soDinhDanh: string; // CCCD / Định danh (15)
  chucDanhNn: string; // "1": Bác sỹ, "2": Y sỹ, "3": Điều dưỡng, "4": Hộ sinh, "5": Kỹ thuật y, "6": CN tâm lý LS, "7": Lương y, "8": Dược sỹ, "9": Khác
  viTri?: string; // "1": PTCM, "2": Trưởng khoa, "3": PTCM kiêm TK, "4": Đứng đầu/ký giấy tờ, "5": Phụ trách khoa, "6": NĐ 96
  macchn?: string; // Số CCHN (250)
  ngaycapCchn?: string; // YYYYMMDD
  noicapCchn?: string; // 250
  phamviCm?: string; // 15
  phamviCmbs?: string; // YYYYMMDD_Z (50)
  dvktKhac?: string; // Mã DVKT ngoài phạm vi
  vbPhancong?: string; // YYYYMMDD_Z (50)
  thoigianDk: number; // 1: Toàn thời gian, 2: Bán thời gian
  thoigianNgay?: string; // Giờ làm việc (ví dụ 0800-1200 hoặc T20800-1500;...)
  thoigianTuan?: string; // Ngày trong tuần (ví dụ T2T3T5, CN)
  cskcbKhac?: string; // 30
  cskcbCgkt?: string; // 5
  qdCgkt?: string; // YYYYMMDDZ (50)
  tuNgay: string; // YYYYMMDD
  denNgay?: string; // YYYYMMDD
  maCskcb: string; // 5
  isValid?: boolean;
  errors?: string[];
}


// 03/DM: Thuốc & Chế phẩm máu (Loại 10)
export interface DmThuocItem {
  id: string;
  stt: number;
  maThuocBhyt: string;
  tenHoatChat: string;
  tenThuoc: string;
  hamLuong: string;
  duongDung: string;
  dangBaoChe: string;
  donViTinh: string;
  donGia: number;
  tyLeThanhToan: number;
  soDangKy: string;
  maCskcb: string;
}

// 04/DM: Danh mục thiết bị y tế (Loại 11 - GuiDanhMuc04_DMVTYT)
export type { DmThietBiItem } from '../utils/types/thietBiTypes';

// 05/DM: Dịch vụ kỹ thuật KCB BHYT (Loại 12)
export interface DmDichVuItem {
  id: string;
  stt: number;
  maDichVu: string;
  tenDichVu: string;
  loaiDv: 'Khám bệnh' | 'Xét nghiệm' | 'Chẩn đoán hình ảnh' | 'Phẫu thuật - Thủ thuật' | 'Thăm dò chức năng';
  giaBhyt: number;
  giaVienPhi: number;
  khoaThucHien: string;
  maCskcb: string;
}

// 06/DM: Thiết bị thực hiện DVKT (Loại 73)
export interface DmTbDvktItem {
  id: string;
  stt: number;
  maDvkt: string;
  tenDvkt: string;
  maTbyt: string;
  tenTbyt: string;
  dinhMucTieuHao: string;
  maCskcb: string;
}

// ==========================================
// 2. HỒ SƠ 1: HỒ SƠ TỔNG HỢP CHI PHÍ KCB (MẪU 01/BH)
// ==========================================
export type LoaiKcb = 'Ngoại trú' | 'Nội trú' | 'Cấp cứu' | 'Khám sức khỏe';
export type TrangThaiHoSoBhyt = 'hop_le' | 'canh_bao' | 'tu_choi' | 'da_gui_cong' | 'cho_duyet';

export interface ChiTietChiPhiXml {
  xml1TongHop: {
    maLk: string;
    maBn: string;
    hoTen: string;
    ngayVao: string;
    ngayRa: string;
    ngayQuyetToan: string;
    maBenh: string;
    tenBenh: string;
    maKhoa: string;
    tongChi: number;
    tienBhyt: number;
    tienBnTra: number;
    tienNguonKhac: number;
  };
  xml2Thuoc: Array<{
    stt: number;
    maThuoc: string;
    tenThuoc: string;
    hamLuong: string;
    donViTinh: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
    tienBhyt: number;
    tienBnTra: number;
  }>;
  xml3Dvkt: Array<{
    stt: number;
    maDichVu: string;
    tenDichVu: string;
    khoaThucHien: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
    tienBhyt: number;
    tienBnTra: number;
  }>;
}

export interface HoSoTongHop {
  id: string;
  maLk: string; // Mã liên kết hồ sơ (XML1)
  maBenhNhan: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: 'Nam' | 'Nữ' | 'Khác';
  soTheBhyt: string;
  maDkbd: string; // Nơi ĐK KCB ban đầu
  mucHuong: number; // 80%, 100%, 95%
  loaiKcb: LoaiKcb;
  khoaKcb: string;
  bacSiKcb: string;
  maBenhIcd: string;
  chanDoan: string;
  ngayVao: string;
  ngayRa: string;
  tongChiPhi: number;
  tienBhytThanhToan: number;
  tienNguoiBenhTra: number;
  tienNguonKhac: number;
  trangThai: TrangThaiHoSoBhyt;
  ngayGuiCong?: string;
  maGiaoDichBhxh?: string;
  chiTiet?: ChiTietChiPhiXml;
}

// ==========================================
// 3. HỒ SƠ 2: HỒ SƠ XỬ LÝ & GIẢI TRÌNH XUẤT TOÁN (MẪU 09/BH)
// ==========================================
export type TrangThaiGiaiTrinh = 'cho_xu_ly' | 'da_giai_trinh' | 'chap_nhan_lai' | 'tu_choi_giai_trinh';
export type NhomLoiXuatToan = 
  | 'trung_lap_dich_vu'
  | 'vuot_dinh_muc_phac_do'
  | 'sai_thong_tin_the'
  | 'thieu_ket_qua_cls'
  | 'vuot_tran_gia_thuoc'
  | 'sai_ma_cskcb';

export interface HoSoXuatToan {
  id: string;
  maLk: string;
  maBenhNhan: string;
  hoTen: string;
  soTheBhyt: string;
  khoaDieuTri: string;
  bacSiDieuTri: string;
  ngayKcb: string;
  chanDoan: string;
  tongChiKcb: number;
  tienDeNghiThanhToan: number;
  tienXuatToan: number; // Số tiền bị trừ/từ chối
  tienChapNhanLai?: number;
  maLoiBhxh: string;
  nhomLoi: NhomLoiXuatToan;
  noiDungLoi: string; // Diễn giải lỗi xuất toán từ cổng giám định
  canCuPhapLy: string; // Thông tư / Quyết định vi phạm
  trangThai: TrangThaiGiaiTrinh;
  noiDungGiaiTrinh?: string;
  taiLieuDinhKem?: string[];
  ngayGiaiTrinh?: string;
  nguoiGiaiTrinh?: string;
  ketQuaGiamDinhLai?: string;
}

// Legacy types for compatibility
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  phone: string;
  email: string;
  experience: string;
  room: string;
  status: 'active' | 'busy' | 'off';
  rating: number;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  insuranceNumber?: string;
  allergies?: string[];
  lastVisit?: string;
  totalVisits: number;
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  room: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  unit: string;
  frequency: string;
  duration: string;
  instructions: string;
  price: number;
  quantity: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  icd10Code?: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  prescriptions: PrescriptionItem[];
  reExamDate?: string;
  treatmentPlan: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  category: 'Khám bệnh' | 'Xét nghiệm' | 'Chẩn đoán hình ảnh' | 'Thuốc' | 'Dịch vụ khác';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  insuranceCover: number;
  totalAmount: number;
  status: PaymentStatus;
  paymentMethod?: 'Tiền mặt' | 'Chuyển khoản' | 'Thẻ' | 'BHYT';
}

export interface ClinicStat {
  totalPatients: number;
  appointmentsToday: number;
  activeDoctors: number;
  todayRevenue: number;
  pendingAppointments: number;
  completedToday: number;
}
