import type {
  Ct03GiayRaVien,
  Ct04TomTatHsba,
  Ct06NghiDuongThai,
  Ct07NghiViecBhxh,
  GiayDieuTriNoiTru06,
  GiayDieuTriVoSinh09,
  GiaySucKhoeMe10,
  GiayBaoTu60,
  GiayChungSinh61,
} from "../../types/tt25ChungTuTypes";
import {
  parseYmdDate,
  parseYmdHmDate,
  parseYmdHmsDate,
  parseExcelDate,
  getRowVal,
  getRowCell,
  parseOptionalGender,
  resolveLoaiGiayTo,
  parseExactBinaryFlag,
} from "../shared/excelXmlShared";

export type RowMap = Map<string, any>;

// Re-export để các module khác import từ parser vẫn tương thích ngược
export {
  getRowVal,
  parseOptionalGender,
  resolveLoaiGiayTo,
  parseExactBinaryFlag,
};

/* ================================================================== */
/* 1. TẬP DANH SÁCH TỪ KHÓA CỘT DÙNG CHUNG (KHÔNG VIẾT TẮT)            */
/* ================================================================== */

export const COMMON_FIELD_ALIASES = {
  // Thông tin nhân thân người bệnh / người lao động
  hoTen: ["ho_ten", "hoten", "hovaten", "tenbenhnhan", "fullname", "name"],
  maThe: ["ma_the", "mathe", "mathebhyt", "ma_the_bhyt", "sothe", "sothebhyt"],
  maBhxh: ["ma_bhxh", "mabhxh", "masobhxh", "sobhxh"],
  ngaySinh: ["ngay_sinh", "ngaysinh", "namsinh", "dob", "ngaysinhbn"],
  gioiTinh: ["gioi_tinh", "gioitinh", "phai", "gender", "sex"],
  maDanToc: ["ma_dantoc", "madantoc", "ma_dan_toc", "dantoc", "ten_dantoc"],
  ngheNghiep: ["nghe_nghiep", "nghenghiep", "nghe"],
  diaChi: ["dia_chi", "diachi", "noio", "thuongtru", "diachithuongtru"],
  hoTenCha: ["ho_ten_cha", "hotencha", "hovatencha", "ten_cha", "tencha"],
  hoTenMe: ["ho_ten_me", "hotenme", "hovatenme", "ten_me", "tenme"],
  tekt: ["tekt"],

  // Giấy tờ tùy thân
  loaiGiayTo: ["loai_giay_to", "loaigiayto", "loaigiaytotuythan"],
  soCccd: [
    "so_cccd",
    "socccd",
    "cccd",
    "cmnd",
    "dinhdanh",
    "sodinhdanh",
    "so_cmnd",
    "socmnd",
  ],
  ngayCapCccd: ["ngay_cap_cccd", "ngaycapcccd", "ngaycap"],
  noiCapCccd: ["noi_cap_cccd", "noicapcccd", "noicap"],

  // Hồ sơ bệnh án & Chứng từ hành chính
  maCt: ["ma_ct", "mact", "sochungtu", "so_ct", "so_chung_tu"],
  soSeri: ["so_seri", "soseri", "seri", "series"],
  ngayCt: [
    "ngay_ct",
    "ngayct",
    "ngay_chung_tu",
    "ngaychungtu",
    "ngayky",
    "ngaycap",
  ],
  soLuuTru: ["so_luu_tru", "soluutru", "soba", "so_ba", "sohoso", "mabenhan"],
  maYTe: ["ma_yte", "mayte", "mabn", "ma_bn", "mabenhnhan"],
  maKhoa: ["ma_khoa", "makhoa", "khoa", "tenkhoa", "khoaphong"],
  soKcb: ["so_kcb", "sokcb", "mabenhan", "ma_benh_an"],

  // Quá trình điều trị & Khám chữa bệnh
  ngayVao: [
    "ngay_vao",
    "ngayvao",
    "vaovien",
    "ngayvaovien",
    "thoigianvaovien",
    "tungay",
  ],
  ngayRa: [
    "ngay_ra",
    "ngayra",
    "ravien",
    "ngayravien",
    "thoigianravien",
    "denngay",
  ],
  chanDoan: ["chan_doan", "chandoan", "benhchinh", "tenbenh", "ten_benh"],
  ppDieuTri: [
    "pp_dieutri",
    "ppdieutri",
    "dieutri",
    "phuongphapdieutri",
    "phuong_phap_dieu_tri",
    "cachdieutri",
  ],
  ghiChu: ["ghi_chu", "ghichu", "loidan", "loidanbacsi"],
  tuoiThai: ["tuoi_thai", "tuoithai", "sotuanthai"],
  maTinhCuTru: ["ma_tinh_cu_tru", "matinhcutru", "matinh"],
  maXaCuTru: ["ma_xa_cu_tru", "maxacutru", "maxa"],

  // Bác sĩ & Người đại diện ký
  daiDienDvi: [
    "dai_dien_dvi",
    "daidiendvi",
    "thutruong",
    "giamdoc",
    "thutruongdonvi",
    "daidiendonvi",
  ],
  maCchnBs: ["ma_cchn_bs", "macchnbs", "macchn", "cchn", "socchn", "ma_cchn"],
  tenBs: [
    "ten_bs",
    "tenbs",
    "tenbacsi",
    "bacsi",
    "doctor",
    "bskcb",
    "ten_nguoi_hanh_nghe",
  ],

  // Mã bệnh ICD10
  icdMa: [
    "benh_icd10_ma",
    "benh_icd10_id",
    "benhicd10id",
    "benhicd10_id",
    "ma_icd",
    "maicd",
    "icd10",
    "icd",
    "ma_benh",
  ],

  // Tên bệnh ICD10 (chuẩn TT25 / BHXH: TENBENHNICD10, BENH_ICD10_TEN...)
  icdTen: [
    "tenbenhnicd10",
    "ten_benh_n_icd10",
    "benh_icd10_ten",
    "benhicd10ten",
    "ten_benh_icd10",
    "tenbenhicd10",
    "ten_benh_icd",
    "tenicd10",
    "ten_icd10",
    "ten_icd",
    "tenicd",
    "ten_benh",
    "tenbenh",
  ],
} as const;

export type CommonFieldKey = keyof typeof COMMON_FIELD_ALIASES;

/* ================================================================== */
/* 2. BỘ ĐỌC TRÍCH XUẤT DỮ LIỆU EXCEL RÕ RÀNG (KHÔNG VIẾT TẮT)         */
/* ================================================================== */

export function createRowReader(rowMap: RowMap) {
  const readCellFromAliases = (
    key: CommonFieldKey,
    extraAliases: readonly string[] = [],
  ): unknown => {
    return getRowCell(rowMap, [...extraAliases, ...COMMON_FIELD_ALIASES[key]]);
  };

  const readStringFromAliases = (
    key: CommonFieldKey,
    extraAliases: readonly string[] = [],
  ): string => {
    return getRowVal(
      rowMap,
      [...extraAliases, ...COMMON_FIELD_ALIASES[key]],
      "",
    );
  };

  return {
    readString: readStringFromAliases,
    // Ngày 8 ký tự YYYYMMDD (nhận diện chính xác Date object, serial, hoặc chuỗi ngày)
    readDate: (
      key: CommonFieldKey,
      extraAliases: readonly string[] = [],
    ): string => {
      return parseYmdDate(readCellFromAliases(key, extraAliases), "");
    },
    // Ngày giờ 12 ký tự YYYYMMDDHHmm (vào viện, ra viện, tử vong...)
    readDateTime12: (
      key: CommonFieldKey,
      extraAliases: readonly string[] = [],
      defaultHourMinute = "0000",
    ): string => {
      return parseYmdHmDate(
        readCellFromAliases(key, extraAliases),
        defaultHourMinute,
      );
    },
    // Ngày giờ 14 ký tự YYYYMMDDHHmmss (ngày sinh con chứng sinh...)
    readDateTime14: (
      key: CommonFieldKey,
      extraAliases: readonly string[] = [],
      defaultHms = "000000",
    ): string => {
      return parseYmdHmsDate(
        readCellFromAliases(key, extraAliases),
        defaultHms,
      );
    },
    readFlag: (
      key: CommonFieldKey,
      extraAliases: readonly string[] = [],
    ): string => {
      return parseExactBinaryFlag(readCellFromAliases(key, extraAliases));
    },
    readGender: (key: CommonFieldKey = "gioiTinh"): string => {
      return parseOptionalGender(readCellFromAliases(key));
    },
    readCustomString: (aliases: readonly string[]): string => {
      return getRowVal(rowMap, aliases as string[], "");
    },
    // Ngày 8 ký tự tùy biến
    readCustomDate: (aliases: readonly string[]): string => {
      return parseYmdDate(getRowCell(rowMap, aliases as string[]), "");
    },
    // Ngày giờ 12 ký tự tùy biến
    readCustomDateTime12: (
      aliases: readonly string[],
      defaultHourMinute = "0000",
    ): string => {
      return parseYmdHmDate(
        getRowCell(rowMap, aliases as string[]),
        defaultHourMinute,
      );
    },
    // Ngày giờ 14 ký tự tùy biến
    readCustomDateTime14: (
      aliases: readonly string[],
      defaultHms = "000000",
    ): string => {
      return parseYmdHmsDate(
        getRowCell(rowMap, aliases as string[]),
        defaultHms,
      );
    },
    readCustomFlag: (aliases: readonly string[]): string => {
      return parseExactBinaryFlag(getRowCell(rowMap, aliases as string[]));
    },
  };
}

export type RowReader = ReturnType<typeof createRowReader>;

/* ================================================================== */
/* 3. CÁC NHÓM TRƯỜNG DÙNG CHUNG GIỮA CÁC CHỨNG TỪ                    */
/* ================================================================== */

/** Bộ thông tin nhân thân cơ sở của người bệnh */
function extractPersonInfo(reader: RowReader) {
  const maThe = reader.readString("maThe");
  const soCccd = reader.readString("soCccd");
  return {
    maBhxh: reader.readString("maBhxh") || (maThe ? maThe.slice(-10) : ""),
    maThe,
    hoTen: reader.readString("hoTen").toUpperCase(),
    ngaySinh: reader.readDate("ngaySinh"),
    loaiGiayTo: resolveLoaiGiayTo(reader.readString("loaiGiayTo"), soCccd),
    soCccd,
    ngayCapCccd: reader.readDate("ngayCapCccd", ["ngaycap"]),
    noiCapCccd: reader.readString("noiCapCccd", ["noicap"]),
  };
}

/** Bộ thông tin mã và ngày chứng từ */
function extractDocumentMeta(reader: RowReader) {
  return {
    maCt: reader.readString("maCt"),
    ngayCt: reader.readDate("ngayCt"),
    soSeri: reader.readString("soSeri"),
  };
}

/** Bộ thông tin người ký và bác sĩ điều trị */
function extractSignerInfo(reader: RowReader) {
  return {
    daiDienDvi: reader.readString("daiDienDvi"),
    maCchnBs: reader.readString("maCchnBs"),
    tenBs: reader.readString("tenBs"),
  };
}

/** Khung thông tin điều trị nội viện dùng chung (Mẫu 06, Mẫu 09, Mẫu 10) */
function extractCommonGiayFrame(reader: RowReader) {
  const chanDoan = reader.readString("chanDoan");
  const personInfo = extractPersonInfo(reader);
  return {
    soLuuTru: reader.readString("soLuuTru"),
    maYTe: reader.readString("maYTe"),
    maKhoa: reader.readString("maKhoa"),
    ...personInfo,
    loaiGiayTo: personInfo.loaiGiayTo || "1",
    ngheNghiep: reader.readString("ngheNghiep"),
    diaChi: reader.readString("diaChi"),
    ngayVao: reader.readDateTime12("ngayVao"),
    ngayRa: reader.readDateTime12("ngayRa"),
    chanDoan,
    ppDieuTri: reader.readString("ppDieuTri"),
    ...extractSignerInfo(reader),
    benhIcd10Ma: reader.readString("icdMa"),
    benhIcd10Ten: reader.readString("icdTen") || "",
    ...extractDocumentMeta(reader),
  };
}

/* ================================================================== */
/* 4. CÁC HÀM TRÍCH XUẤT CHO TỪNG LOẠI CHỨNG TỪ CỤ THỂ                */
/* ================================================================== */

/** CT03: Giấy ra viện (Mẫu số 02 - TT25) */
export function parseCt03Row(rowMap: RowMap, _idx: number): Ct03GiayRaVien {
  const reader = createRowReader(rowMap);
  const chanDoan = reader.readString("chanDoan", [
    "chandoanravien",
    "chan_doan_ra_vien",
    "chan_doan_ra",
  ]);
  return {
    soLuuTru: reader.readString("soLuuTru", ["so_ba", "sohoso", "mabenhan"]),
    maYTe: reader.readString("maYTe", ["ma_bn", "mabenhnhan"]),
    maKhoa: reader.readString("maKhoa", ["tenkhoa", "khoaphong"]),
    ...extractPersonInfo(reader),
    gioiTinh: reader.readGender(),
    maDanToc: reader.readString("maDanToc"),
    ngheNghiep: reader.readString("ngheNghiep"),
    diaChi: reader.readString("diaChi"),
    ngayVao: reader.readDateTime12("ngayVao"),
    ngayRa: reader.readDateTime12("ngayRa"),
    dinhChiThaiNghen: reader.readCustomFlag([
      "dinh_chi_thai_nghen",
      "dinhchithainghen",
    ]),
    tuoiThai: reader.readString("tuoiThai"),
    chanDoan,
    ppDieuTri: reader.readString("ppDieuTri"),
    ghiChu: reader.readString("ghiChu"),
    thuTruongDvi: reader.readString("daiDienDvi", [
      "thu_truong_dvi",
      "thutruongdvi",
    ]),
    maCchnTruongKhoa: reader.readString("maCchnBs", [
      "ma_cchn_truongkhoa",
      "macchn_truongkhoa",
    ]),
    tenTruongKhoa: reader.readString("tenBs", [
      "ten_truongkhoa",
      "tentruongkhoa",
      "truongkhoa",
    ]),
    ngayChungTu: reader.readDate("ngayCt"),
    tekt: reader.readFlag("tekt"),
    hoTenCha: reader.readString("hoTenCha"),
    hoTenMe: reader.readString("hoTenMe"),
    ngoaitruTuNgay: reader.readCustomDate([
      "ngoaitru_tu_ngay",
      "ngoaitrutungay",
    ]),
    ngoaitruDenNgay: reader.readCustomDate([
      "ngoaitru_den_ngay",
      "ngoaitrudenngay",
    ]),
    benhIcd10Id: reader.readString("icdMa"),
    tenBenhIcd10: reader.readString("icdTen") || "",
  };
}

/** CT04: Bản tóm tắt hồ sơ bệnh án (Mẫu số 03 - TT25) */
export function parseCt04Row(rowMap: RowMap, _idx: number): Ct04TomTatHsba {
  const reader = createRowReader(rowMap);
  const chanDoanRa = reader.readString("chanDoan", [
    "chan_doan_ra",
    "chandoanra",
  ]);
  return {
    ...extractDocumentMeta(reader),
    ...extractPersonInfo(reader),
    gioiTinh: reader.readGender(),
    maDanToc: reader.readString("maDanToc"),
    diaChi: reader.readString("diaChi"),
    ngheNghiep: reader.readString("ngheNghiep"),
    hoTenCha: reader.readString("hoTenCha"),
    hoTenMe: reader.readString("hoTenMe"),
    nguoiGiamHo: reader.readCustomString(["nguoi_giam_ho", "nguoigiamho"]),
    tenDonVi: reader.readCustomString([
      "ten_don_vi",
      "tendonvi",
      "donvi",
      "noilamviec",
    ]),
    nguoiDaiDien: reader.readCustomString(["nguoi_dai_dien", "nguoidaidien"]),
    ngayVao: reader.readDateTime12("ngayVao"),
    ngayRa: reader.readDateTime12("ngayRa"),
    chanDoanVao: reader.readCustomString(["chan_doan_vao", "chandoanvao"]),
    chanDoanRa,
    qtBenhLy: reader.readCustomString([
      "qt_benhly",
      "qtbenhly",
      "benhly",
      "dienbien",
      "dienbienbenh",
    ]),
    tomTatKq: reader.readCustomString([
      "tomtat_kq",
      "tomtatkq",
      "ketqua",
      "cls",
      "canlamsang",
    ]),
    ppDieuTri: reader.readString("ppDieuTri"),
    ngaySinhCon: reader.readCustomDate(["ngay_sinh_con", "ngaysinhcon"]),
    ngayChetCon: reader.readCustomDate(["ngay_chet_con", "ngaychetcon"]),
    soConChet: reader.readCustomString(["so_con_chet", "soconchet"]),
    ttRaVien: reader.readCustomString([
      "tt_ravien",
      "ttravien",
      "tinhtrangravien",
    ]),
    ghiChu: reader.readString("ghiChu"),
    tekt: reader.readFlag("tekt"),
    lyDoVVien: reader.readCustomString([
      "ly_do_vvien",
      "lydo_vvien",
      "lydovien",
      "lydovaovien",
    ]),
    tienSuBenh: reader.readCustomString([
      "tien_su_benh",
      "tiensubenh",
      "tiensu",
    ]),
    dauHieuLamSang: reader.readCustomString([
      "dau_hieu_lam_sang",
      "dauhieulamsang",
      "lamsang",
    ]),
    noiKhoa: reader.readCustomString(["noi_khoa", "noikhoa"]),
    isNoiKhoa: reader.readCustomFlag(["is_noi_khoa", "is_noikhoa"]),
    phauThuatThuThuat: reader.readCustomString([
      "phau_thuat_thu_thuat",
      "phauthuatthuthuat",
      "pttt",
    ]),
    isPhauThuatThuThuat: reader.readCustomFlag([
      "is_phau_thuat_thu_thuat",
      "is_phauthuatthuthuat",
      "phauthuat",
    ]),
    huongDieuTri: reader.readCustomString(["huong_dieu_tri", "huongdieutri"]),
    benhIcd10Id: reader.readString("icdMa"),
    benhIcd10Ten: reader.readString("icdTen") || "",
    isLaoGiaiDoanNang: reader.readCustomFlag([
      "is_lao_giai_doan_nang",
      "islaogiaidoannang",
      "lao_giai_doan_nang",
      "laogiaidoannang",
      "is_lao_gd_nang",
      "islaogdnang",
      "lao_gd_nang",
      "laogdnang",
      "is_lao_nang",
      "islaonang",
      "lao_nang",
      "laonang",
      "is_lao",
      "islao",
    ]),
    isXoGanGiaiDoanMatBu: reader.readCustomFlag([
      "is_xo_gan_giai_doan_mat_bu",
      "isxogangiaidoanmatbu",
      "xo_gan_giai_doan_mat_bu",
      "xogangiaidoanmatbu",
      "is_xogan_giai_doan_mat_bu",
      "isxogangiaidoanmatbu",
      "is_xo_gan_mat_bu",
      "isxoganmatbu",
      "xo_gan_mat_bu",
      "xoganmatbu",
      "xo_gan_gd_mat_bu",
      "xogangdmatbu",
      "is_xogan",
      "isxogan",
      "is_xo_gan",
    ]),
  };
}

/** CT06: Giấy xác nhận nghỉ dưỡng thai (Mẫu số 11 - TT25) */
export function parseCt06Row(rowMap: RowMap, _idx: number): Ct06NghiDuongThai {
  const reader = createRowReader(rowMap);
  const chanDoan = reader.readString("chanDoan");
  const tuNgay = reader.readDate("ngayVao", ["tu_ngay", "tungay"]);
  return {
    ...extractPersonInfo(reader),
    ngayVao: tuNgay,
    ngayRa: reader.readDate("ngayRa", ["den_ngay", "denngay"]),
    chanDoan,
    nguoiDaiDien: reader.readCustomString(["nguoi_dai_dien", "nguoidaidien"]),
    maBs: reader.readString("maCchnBs", ["ma_bs", "mabs"]),
    tenBs: reader.readString("tenBs"),
    tenDvi: reader.readCustomString(["ten_dvi", "tendvi", "tendonvi", "donvi"]),
    soKcb: reader.readCustomString(["so_kcb", "sokcb", "mabenhan"]),
    ...extractDocumentMeta(reader),
    ngayCt: reader.readDate("ngayCt") || tuNgay,
    noiCuTruNnd: reader.readCustomString([
      "noi_cu_tru_nnd",
      "noicutrunnd",
      "diachi",
    ]),
    maTinhCuTru: reader.readString("maTinhCuTru"),
    maXaCuTru: reader.readString("maXaCuTru"),
    tuoiThai: reader.readString("tuoiThai"),
    benhIcd10Id: reader.readString("icdMa"),
    benhIcd10Ten: reader.readString("icdTen") || "",
  };
}

/** CT07: Giấy chứng nhận nghỉ việc hưởng BHXH (Mẫu số 07 - TT25) */
export function parseCt07Row(rowMap: RowMap, _idx: number): Ct07NghiViecBhxh {
  const reader = createRowReader(rowMap);
  const chanDoan = reader.readString("chanDoan", [
    "chandoan_dieutri",
    "chandoandieutri",
    "chan_doan_rv",
  ]);
  const tuNgay = reader.readCustomDate([
    "tu_ngay",
    "tungay",
    "batdau",
    "from_date",
    "ngaybatdau",
    "ngaynghibatdau",
  ]);
  return {
    maCt: reader.readString("maCt"),
    mauSo: reader.readCustomString(["mau_so", "mauso"]),
    soSeri: reader.readString("soSeri"),
    soKcb: reader.readCustomString(["so_kcb", "sokcb", "mabenhan"]),
    ...extractPersonInfo(reader),
    gioiTinh: reader.readGender(),
    donVi: reader.readCustomString([
      "don_vi",
      "donvi",
      "noilamviec",
      "noi_lam_viec",
      "congty",
      "company",
      "tendonvi",
      "ten_don_vi",
      "coquan",
    ]),
    chanDoanDieuTri: chanDoan,
    tuNgay,
    denNgay: reader.readCustomDate([
      "den_ngay",
      "denngay",
      "ketthuc",
      "to_date",
      "ngayketthuc",
      "ngaynghidenngay",
    ]),
    hoTenCha: reader.readString("hoTenCha"),
    hoTenMe: reader.readString("hoTenMe"),
    thuTruongDv: reader.readString("daiDienDvi", [
      "thu_truong_dvi",
      "thutruongdv",
    ]),
    maCchn: reader.readString("maCchnBs", ["ma_cchn"]),
    tenNguoiHanhNghe: reader.readString("tenBs", ["ten_nguoi_hanh_nghe"]),
    ngayChungTu: reader.readDate("ngayCt"),
    tekt: reader.readFlag("tekt"),
    ngayKcb: reader.readCustomDate(["ngay_kcb", "ngaykcb"]) || tuNgay,
    benhIcd10Id: reader.readString("icdMa"),
    benhIcd10Ten: reader.readString("icdTen") || "",
  };
}

/** Giấy xác nhận điều trị nội trú (Mẫu số 06 - TT25) */
export function parseGiayDieuTriNoiTruRow(
  rowMap: RowMap,
  _idx: number,
): GiayDieuTriNoiTru06 {
  const reader = createRowReader(rowMap);
  return {
    ...extractCommonGiayFrame(reader),
    gioiTinh: reader.readGender(),
    tenDanToc: reader.readCustomString(["ten_dan_toc", "tendantoc", "dantoc"]),
    maDanToc: reader.readString("maDanToc"),
    moTa: reader.readCustomString(["mo_ta", "mota"]),
    ghiChu: reader.readString("ghiChu"),
    tuoiThai: reader.readString("tuoiThai"),
    loaiPhuongPhap: reader.readCustomString([
      "loai_phuong_phap",
      "loaiphuongphap",
    ]),
    loaiPpDieuTriVoSinh: reader.readCustomString([
      "loai_pp_dieu_tri_vosinh",
      "loaippdieutrivosinh",
    ]),
    ngayDinhChiThainghen: reader.readCustomDateTime12([
      "ngay_dinh_chi_thainghen",
      "ngaydinhchithainghen",
    ]),
    isNghiduongthai: reader.readCustomFlag([
      "is_nghiduongthai",
      "isnghiduongthai",
    ]),
    soNgayNghiduongthai: reader.readCustomString([
      "so_ngay_nghiduongthai",
      "songaynghiduongthai",
    ]),
  };
}

/** Giấy xác nhận điều trị vô sinh (Mẫu số 09 - TT25) */
export function parseGiayDieuTriVoSinhRow(
  rowMap: RowMap,
  _idx: number,
): GiayDieuTriVoSinh09 {
  const reader = createRowReader(rowMap);
  return {
    ...extractCommonGiayFrame(reader),
    maTinhCuTru: reader.readString("maTinhCuTru"),
    maXaCuTru: reader.readString("maXaCuTru"),
    ghiChu: reader.readString("ghiChu"),
    loaiPhuongPhap: reader.readCustomString([
      "loai_phuong_phap",
      "loaiphuongphap",
    ]),
  };
}

/** Giấy xác nhận sức khỏe mẹ (Mẫu số 10 - TT25) */
export function parseGiaySucKhoeMeRow(
  rowMap: RowMap,
  _idx: number,
): GiaySucKhoeMe10 {
  const reader = createRowReader(rowMap);
  return {
    ...extractCommonGiayFrame(reader),
    maTinhCuTru: reader.readString("maTinhCuTru"),
    maXaCuTru: reader.readString("maXaCuTru"),
    ketLuan: reader.readCustomString(["ket_luan", "ketluan"]),
    tinhTrangBenhHienTai: reader.readCustomString([
      "tinh_trang_benh_hien_tai",
      "tinhtrangbenhhientai",
    ]),
  };
}

/** Giấy báo tử (Mã loại hồ sơ 60 - BHXH 2025) */
export function parseGiayBaoTuRow(rowMap: RowMap, _idx: number): GiayBaoTu60 {
  const reader = createRowReader(rowMap);
  const soGiayTo = reader.readString("soCccd", ["so_giay_to"]);
  const benhIcd10Ten = reader.readString("icdTen") || "";
  return {
    maGbt: reader.readCustomString(["ma_gbt", "magbt"]),
    maBn: reader.readCustomString(["ma_bn", "mabn"]),
    maHsba: reader.readCustomString(["ma_hsba", "mahsba", "soba"]),
    hoTen: reader.readString("hoTen", ["tennguoichet"]).toUpperCase(),
    ngaySinh: reader.readDate("ngaySinh"),
    gioiTinh: reader.readGender(),
    maThe: reader.readString("maThe"),
    maDanToc: reader.readString("maDanToc"),
    maQuocTich: reader.readCustomString(["ma_quoctich", "quoctich"]),
    dchiThuongTru: reader.readString("diaChi", ["dchi_thuongtru"]),
    maTinhThuongTru: reader.readCustomString([
      "matinh_thuongtru",
      "ma_tinh",
      "matinh",
    ]),
    maHuyenThuongTru: reader.readCustomString([
      "mahuyen_thuongtru",
      "ma_huyen",
      "mahuyen",
    ]),
    maXaThuongTru: reader.readCustomString(["maxa_thuongtru", "ma_xa", "maxa"]),
    dchiHienTai: reader.readCustomString(["dchi_hientai"]),
    maTinhHienTai: reader.readCustomString(["matinh_hientai"]),
    maHuyenHienTai: reader.readCustomString(["mahuyen_hientai"]),
    maXaHienTai: reader.readCustomString(["maxa_hientai"]),
    // Báo tử: 6 = không có giấy tờ (bản cũ mặc định 1)
    loaiGiayTo:
      resolveLoaiGiayTo(reader.readString("loaiGiayTo"), soGiayTo) || "6",
    soGiayTo,
    ngayCap: reader.readDate("ngayCapCccd", ["ngay_cap_giay_to", "ngay_cap"]),
    noiCap: reader.readString("noiCapCccd", ["noi_cap"]),
    ngayGioVv: reader.readDateTime12("ngayVao", ["ngay_gio_vv", "ngaygiovv"]),
    ngayTv: reader.readCustomDateTime12(["ngay_tv", "ngay_chet", "ngaychet"]),
    tinhTrangTv: reader.readCustomFlag(["tinh_trang_tv", "tinhtrangtv"]),
    nguyenNhanTv:
      reader.readCustomString([
        "nguyen_nhan_chet",
        "nguyennhan",
        "nguyennhantv",
      ]) || benhIcd10Ten,
    nguoiGhiGiay: reader.readCustomString(["nguoi_ghi_giay", "nguoighigiay"]),
    nguoiThanThich: reader.readCustomString([
      "nguoi_than_thich",
      "nguoithanthich",
    ]),
    tTruongDvi: reader.readString("daiDienDvi", ["thu_truong_dvi"]),
    soBaoTu: reader.readCustomString(["so_bao_tu", "sobaotu"]),
    quyenSo: reader.readCustomString(["quyen_so", "quyenso"]),
    ngayCapGiayBt: reader.readDate("ngayCt", [
      "ngay_cap_giay_bt",
      "ngaycapgiaybt",
    ]),
    maCskcb: reader.readCustomString(["ma_cskcb", "macskcb"]),
    diaChiCskcb: reader.readCustomString(["dia_chi_cskcb", "diachi_cskcb"]),
    maBhxh: reader.readString("maBhxh"),
    benhIcd10Id: reader.readString("icdMa"),
    benhIcd10Ten,
  };
}

/* ================================================================== */
/* 5. GIẤY CHỨNG SINH: ĐỌC RIÊNG THÔNG TIN MẸ (NND) & CON              */
/* ================================================================== */

/** Đọc bộ thông tin nhân thân có hậu tố (Ví dụ _NND của Người nuôi dưỡng / Mẹ) */
function extractPersonWithSuffix(
  reader: RowReader,
  suffix: string,
  extraAliases: Record<string, string[]> = {},
) {
  const pick = (baseName: string, additionalAliases: string[] = []) =>
    reader.readCustomString([
      `${baseName}${suffix}`,
      `${baseName.toLowerCase()}${suffix.toLowerCase()}`,
      `${baseName.replace(/_/g, "")}${suffix.replace(/_/g, "")}`.toLowerCase(),
      ...additionalAliases,
    ]);

  const soCccd = pick("SO_CCCD", extraAliases.soCccd || []);

  return {
    maBhxh: pick(
      "MA_BHXH",
      extraAliases.maBhxh || [
        "mabhxh_nnd",
        "mabhxh_me",
        "bhxh_me",
        "sobhxh_me",
        "ma_bhxh",
        "mabhxh",
      ],
    ),
    maThe: pick(
      "MA_THE",
      extraAliases.maThe || [
        "mathe_nnd",
        "mathe_me",
        "thebhyt_me",
        "ma_the",
        "mathe",
        "mathebhyt",
      ],
    ),
    hoTen: pick("HOTEN", extraAliases.hoTen || []).toUpperCase(),
    ngaySinh: parseExcelDate(pick("NGAYSINH", extraAliases.ngaySinh || []), ""),
    maDantoc: pick("MA_DANTOC", extraAliases.maDantoc || []),
    maQuoctich: pick("MA_QUOCTICH", extraAliases.maQuoctich || []),
    loaiGiayto: resolveLoaiGiayTo(
      pick("LOAI_GIAYTO", extraAliases.loaiGiayto || []),
      soCccd,
    ),
    soCccd,
    ngayCapCccd: parseExcelDate(
      pick("NGAYCAP_CCCD", extraAliases.ngayCapCccd || []),
      "",
    ),
    noiCapCccd: pick("NOICAP_CCCD", extraAliases.noiCapCccd || []),
  };
}

/** Giấy chứng sinh (Mã loại hồ sơ 61 - TT 22/2025/TT-BYT) */
export function parseGiayChungSinhRow(
  rowMap: RowMap,
  _idx: number,
): GiayChungSinh61 {
  const reader = createRowReader(rowMap);

  // Đọc riêng bộ thông tin Người nuôi dưỡng / Mẹ với hậu tố _NND
  const nguoiNuoiDuong = extractPersonWithSuffix(reader, "_NND", {
    hoTen: ["hotenme", "hovatenme", "hoten_me", "tenme", "me", "ho_ten"],
    ngaySinh: ["ngaysinhme"],
    maDantoc: ["dantocme", "dantoc"],
    maQuoctich: ["quoctichme", "quoctich"],
    soCccd: ["cccdme", "so_cccd", "cccd", "cmnd"],
    loaiGiayto: ["loaigiayto"],
  });

  return {
    maGcs: reader.readCustomString(["ma_gcs", "magcs"]),
    maBn: reader.readCustomString(["ma_bn", "mabn"]),
    soSeri: reader.readString("soSeri"),
    maBhxhNnd: nguoiNuoiDuong.maBhxh,
    maTheNnd: nguoiNuoiDuong.maThe,
    hotenNnd: nguoiNuoiDuong.hoTen,
    ngaysinhNnd: nguoiNuoiDuong.ngaySinh,
    maDantocNnd: nguoiNuoiDuong.maDantoc,
    maQuoctichNnd: nguoiNuoiDuong.maQuoctich,
    loaiGiaytoNnd: nguoiNuoiDuong.loaiGiayto,
    soCccdNnd: nguoiNuoiDuong.soCccd,
    ngaycapCccdNnd: nguoiNuoiDuong.ngayCapCccd,
    noicapCccdNnd: nguoiNuoiDuong.noiCapCccd,
    noiCuTruNnd: reader.readCustomString([
      "noi_cu_tru_nnd",
      "diachime",
      "dia_chi",
      "noio",
    ]),
    matinhCuTru: reader.readString("maTinhCuTru"),
    maxaCuTru: reader.readString("maXaCuTru"),
    hoTenCha: reader.readString("hoTenCha"),
    tenCon: reader
      .readCustomString(["ten_con", "tencon", "hotencon", "ho_ten_con"])
      .toUpperCase(),
    gioiTinhCon: parseOptionalGender(
      reader.readCustomString([
        "gioi_tinh_con",
        "gioitinhcon",
        "gioi_tinh",
        "phai",
      ]),
    ),
    soCon: reader.readCustomString(["so_con", "socon"]),
    lanSinh: reader.readCustomString(["lan_sinh", "lansinh"]),
    soConSong: reader.readCustomString(["so_con_song", "soconsong"]),
    canNangCon: reader.readCustomString([
      "can_nang_con",
      "cannang",
      "trongluong",
    ]),
    ngaySinhCon: reader.readCustomDateTime14(["ngay_sinh_con", "ngaysinhcon"]),
    noiSinhCon: reader.readCustomString(["noi_sinh_con", "noisinh"]),
    tinhTrangCon: reader.readCustomString(["tinh_trang_con", "tinhtrangcon"]),
    sinhconPhauthuat: reader.readCustomFlag([
      "sinhcon_phauthuat",
      "phauthuat",
      "pttt",
    ]),
    sinhconDuoi32tuan: reader.readCustomFlag([
      "sinhcon_duoi32tuan",
      "duoi32tuan",
    ]),
    capLanDau: reader.readCustomFlag(["cap_lan_dau", "caplandau"]),
    ghiChu: reader.readString("ghiChu"),
    nguoiDoDe: reader.readCustomString(["nguoi_do_de", "nguoidode", "hosinh"]),
    nguoiGhiPhieu: reader.readCustomString([
      "nguoi_ghi_phieu",
      "nguoighiphieu",
    ]),
    maTtdv: reader.readCustomString(["ma_ttdv", "mattdv"]),
    thuTruongDvi: reader.readString("daiDienDvi", ["thu_truong_dvi"]),
    ngayCt: reader.readDate("ngayCt"),
    so: reader.readCustomString(["so", "sochungtu", "so_ct"]),
    quyenSo: reader.readCustomString(["quyen_so", "quyenso"]),
  };
}
