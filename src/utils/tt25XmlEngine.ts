// ============================================================
// TT25 XML ENGINE - Bộ sinh XML chứng từ & giấy tờ theo
// Thông tư 25/2025/TT-BYT & Quyết định liên thông BHXH 2025
// ============================================================

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
} from "../types/tt25ChungTuTypes";
import {
  xmlToBase64,
  DEFAULT_MA_CSKCB,
  escapeXml,
} from "./shared/excelXmlShared";

// ------------------------------------------------------------
// 1. SINH XML CHI TIẾT TỪNG CHỨNG TỪ CON (PAYLOAD)
// ------------------------------------------------------------

/** Sinh XML Mẫu CT03: Giấy ra viện (Mẫu số 02 - TT25) */
export function buildCt03Xml(data: Ct03GiayRaVien | any): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<CT03 xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SO_LUU_TRU>${escapeXml(data.soLuuTru || data.SO_LUU_TRU)}</SO_LUU_TRU>
  <MA_YTE>${escapeXml(data.maYTe || data.MA_YTE)}</MA_YTE>
  <MA_KHOA>${escapeXml(data.maKhoa || data.MA_KHOA)}</MA_KHOA>
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <GIOI_TINH>${escapeXml(data.gioiTinh || data.GIOI_TINH)}</GIOI_TINH>
  <MA_DANTOC>${escapeXml(data.maDanToc || data.MA_DANTOC)}</MA_DANTOC>
  <NGHE_NGHIEP>${escapeXml(data.ngheNghiep || data.NGHE_NGHIEP)}</NGHE_NGHIEP>
  <DIA_CHI>${escapeXml(data.diaChi || data.DIA_CHI)}</DIA_CHI>
  <NGAY_VAO>${escapeXml(data.ngayVao || data.NGAY_VAO)}</NGAY_VAO>
  <NGAY_RA>${escapeXml(data.ngayRa || data.NGAY_RA)}</NGAY_RA>
  <DINH_CHI_THAI_NGHEN>${escapeXml(data.dinhChiThaiNghen ?? data.DINH_CHI_THAI_NGHEN ?? "")}</DINH_CHI_THAI_NGHEN>
  <TUOI_THAI>${escapeXml(data.tuoiThai || data.TUOI_THAI)}</TUOI_THAI>
  <CHAN_DOAN>${escapeXml(data.chanDoan || data.CHAN_DOAN)}</CHAN_DOAN>
  <PP_DIEUTRI>${escapeXml(data.ppDieuTri || data.PP_DIEUTRI)}</PP_DIEUTRI>
  <GHI_CHU>${escapeXml(data.ghiChu || data.GHI_CHU)}</GHI_CHU>
  <THU_TRUONG_DVI>${escapeXml(data.thuTruongDvi || data.THU_TRUONG_DVI)}</THU_TRUONG_DVI>
  <MA_CCHN_TRUONGKHOA>${escapeXml(data.maCchnTruongKhoa || data.MA_CCHN_TRUONGKHOA)}</MA_CCHN_TRUONGKHOA>
  <TEN_TRUONGKHOA>${escapeXml(data.tenTruongKhoa || data.TEN_TRUONGKHOA)}</TEN_TRUONGKHOA>
  <NGAY_CHUNG_TU>${escapeXml(data.ngayChungTu || data.NGAY_CHUNG_TU)}</NGAY_CHUNG_TU>
  <TEKT>${escapeXml(data.tekt ?? data.TEKT ?? "")}</TEKT>
  <HO_TEN_CHA>${escapeXml(data.hoTenCha || data.HO_TEN_CHA)}</HO_TEN_CHA>
  <HO_TEN_ME>${escapeXml(data.hoTenMe || data.HO_TEN_ME)}</HO_TEN_ME>
  <NGOAITRU_TUNGAY>${escapeXml(data.ngoaitruTuNgay || data.NGOAITRU_TUNGAY)}</NGOAITRU_TUNGAY>
  <NGOAITRU_DENNGAY>${escapeXml(data.ngoaitruDenNgay || data.NGOAITRU_DENNGAY)}</NGOAITRU_DENNGAY>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_CCCD>${escapeXml(data.soCccd || data.SO_CCCD)}</SO_CCCD>
  <NGAYCAP_CCCD>${escapeXml(data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAYCAP_CCCD>
  <NOICAP_CCCD>${escapeXml(data.noiCapCccd || data.NOICAP_CCCD)}</NOICAP_CCCD>
  <BENHICD10_ID>${escapeXml(data.benhIcd10Id || data.BENHICD10_ID || data.BENH_ICD10_ID || data.BENH_ICD10_MA)}</BENHICD10_ID>
  <TENBENHNICD10>${escapeXml(data.tenBenhIcd10 || data.TENBENHNICD10 || data.BENH_ICD10_TEN)}</TENBENHNICD10>
</CT03>`;
}

/** Sinh XML Mẫu CT04: Bản tóm tắt hồ sơ bệnh án (Mẫu số 03 - TT25) */
export function buildCt04Xml(data: Ct04TomTatHsba | any): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<CT04 xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <MA_CT>${escapeXml(data.maCt || data.MA_CT)}</MA_CT>
  <SO_SERI>${escapeXml(data.soSeri || data.SO_SERI)}</SO_SERI>
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <GIOI_TINH>${escapeXml(data.gioiTinh || data.GIOI_TINH)}</GIOI_TINH>
  <MA_DANTOC>${escapeXml(data.maDanToc || data.MA_DANTOC)}</MA_DANTOC>
  <DIA_CHI>${escapeXml(data.diaChi || data.DIA_CHI)}</DIA_CHI>
  <NGHE_NGHIEP>${escapeXml(data.ngheNghiep || data.NGHE_NGHIEP)}</NGHE_NGHIEP>
  <HO_TEN_CHA>${escapeXml(data.hoTenCha || data.HO_TEN_CHA)}</HO_TEN_CHA>
  <HO_TEN_ME>${escapeXml(data.hoTenMe || data.HO_TEN_ME)}</HO_TEN_ME>
  <NGUOI_GIAM_HO>${escapeXml(data.nguoiGiamHo || data.NGUOI_GIAM_HO)}</NGUOI_GIAM_HO>
  <TEN_DONVI>${escapeXml(data.tenDonVi || data.TEN_DONVI)}</TEN_DONVI>
  <NGUOI_DAI_DIEN>${escapeXml(data.nguoiDaiDien || data.NGUOI_DAI_DIEN)}</NGUOI_DAI_DIEN>
  <NGAY_CT>${escapeXml(data.ngayCt || data.NGAY_CT)}</NGAY_CT>
  <NGAY_VAO>${escapeXml(data.ngayVao || data.NGAY_VAO)}</NGAY_VAO>
  <NGAY_RA>${escapeXml(data.ngayRa || data.NGAY_RA)}</NGAY_RA>
  <CHAN_DOAN_VAO>${escapeXml(data.chanDoanVao || data.CHAN_DOAN_VAO)}</CHAN_DOAN_VAO>
  <CHAN_DOAN_RA>${escapeXml(data.chanDoanRa || data.CHAN_DOAN_RA)}</CHAN_DOAN_RA>
  <QT_BENHLY>${escapeXml(data.qtBenhLy || data.QT_BENHLY)}</QT_BENHLY>
  <TOMTAT_KQ>${escapeXml(data.tomTatKq || data.TOMTAT_KQ)}</TOMTAT_KQ>
  <PP_DIEUTRI>${escapeXml(data.ppDieuTri || data.PP_DIEUTRI)}</PP_DIEUTRI>
  <NGAY_SINHCON>${escapeXml(data.ngaySinhCon || data.NGAY_SINHCON)}</NGAY_SINHCON>
  <NGAY_CHETCON>${escapeXml(data.ngayChetCon || data.NGAY_CHETCON)}</NGAY_CHETCON>
  <SO_CONCHET>${escapeXml(data.soConChet || data.SO_CONCHET)}</SO_CONCHET>
  <TT_RAVIEN>${escapeXml(data.ttRaVien || data.TT_RAVIEN)}</TT_RAVIEN>
  <GHI_CHU>${escapeXml(data.ghiChu || data.GHI_CHU)}</GHI_CHU>
  <TEKT>${escapeXml(data.tekt ?? data.TEKT ?? "")}</TEKT>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_CCCD>${escapeXml(data.soCccd || data.SO_CCCD)}</SO_CCCD>
  <NGAYCAP_CCCD>${escapeXml(data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAYCAP_CCCD>
  <NOICAP_CCCD>${escapeXml(data.noiCapCccd || data.NOICAP_CCCD)}</NOICAP_CCCD>
  <LYDO_VVIEN>${escapeXml(data.lyDoVVien || data.LYDO_VVIEN)}</LYDO_VVIEN>
  <TIEN_SU_BENH>${escapeXml(data.tienSuBenh || data.TIEN_SU_BENH)}</TIEN_SU_BENH>
  <DAU_HIEU_LAM_SANG>${escapeXml(data.dauHieuLamSang || data.DAU_HIEU_LAM_SANG)}</DAU_HIEU_LAM_SANG>
  <NOI_KHOA>${escapeXml(data.noiKhoa || data.NOI_KHOA)}</NOI_KHOA>
  <IS_NOI_KHOA>${escapeXml(data.isNoiKhoa ?? data.IS_NOI_KHOA ?? "")}</IS_NOI_KHOA>
  <PHAU_THUAT_THU_THUAT>${escapeXml(data.phauThuatThuThuat || data.PHAU_THUAT_THU_THUAT)}</PHAU_THUAT_THU_THUAT>
  <IS_PHAU_THUAT_THU_THUAT>${escapeXml(data.isPhauThuatThuThuat ?? data.IS_PHAU_THUAT_THU_THUAT ?? "")}</IS_PHAU_THUAT_THU_THUAT>
  <HUONG_DIEU_TRI>${escapeXml(data.huongDieuTri || data.HUONG_DIEU_TRI)}</HUONG_DIEU_TRI>
  <BENH_ICD10_ID>${escapeXml(data.benhIcd10Id || data.BENH_ICD10_ID || data.BENHICD10_ID || data.BENH_ICD10_MA)}</BENH_ICD10_ID>
  <BENH_ICD10_TEN>${escapeXml(data.benhIcd10Ten || data.BENH_ICD10_TEN || data.TENBENHNICD10)}</BENH_ICD10_TEN>
  <IS_LAO_GIAI_DOAN_NANG>${escapeXml(data.isLaoGiaiDoanNang ?? data.IS_LAO_GIAI_DOAN_NANG ?? "")}</IS_LAO_GIAI_DOAN_NANG>
  <IS_XO_GAN_GIAI_DOAN_MAT_BU>${escapeXml(data.isXoGanGiaiDoanMatBu ?? data.IS_XO_GAN_GIAI_DOAN_MAT_BU ?? "")}</IS_XO_GAN_GIAI_DOAN_MAT_BU>
</CT04>`;
}

/** Sinh XML Mẫu CT06: Giấy xác nhận nghỉ dưỡng thai (Mẫu số 11 - TT25) */
export function buildCt06Xml(data: Ct06NghiDuongThai | any): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<CT06 xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <NGAY_VAO>${escapeXml(data.ngayVao || data.NGAY_VAO)}</NGAY_VAO>
  <NGAY_RA>${escapeXml(data.ngayRa || data.NGAY_RA)}</NGAY_RA>
  <CHAN_DOAN>${escapeXml(data.chanDoan || data.CHAN_DOAN)}</CHAN_DOAN>
  <NGUOI_DAI_DIEN>${escapeXml(data.nguoiDaiDien || data.NGUOI_DAI_DIEN)}</NGUOI_DAI_DIEN>
  <MA_BS>${escapeXml(data.maBs || data.MA_BS)}</MA_BS>
  <TEN_BS>${escapeXml(data.tenBs || data.TEN_BS)}</TEN_BS>
  <TEN_DVI>${escapeXml(data.tenDvi || data.TEN_DVI)}</TEN_DVI>
  <SO_KCB>${escapeXml(data.soKcb || data.SO_KCB)}</SO_KCB>
  <NGAY_CT>${escapeXml(data.ngayCt || data.NGAY_CT)}</NGAY_CT>
  <SO_SERI>${escapeXml(data.soSeri || data.SO_SERI)}</SO_SERI>
  <MA_CT>${escapeXml(data.maCt || data.MA_CT)}</MA_CT>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_CCCD>${escapeXml(data.soCccd || data.SO_CCCD)}</SO_CCCD>
  <NGAYCAP_CCCD>${escapeXml(data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAYCAP_CCCD>
  <NOICAP_CCCD>${escapeXml(data.noiCapCccd || data.NOICAP_CCCD)}</NOICAP_CCCD>
  <NOI_CU_TRU_NND>${escapeXml(data.noiCuTruNnd || data.NOI_CU_TRU_NND)}</NOI_CU_TRU_NND>
  <MATINH_CU_TRU>${escapeXml(data.maTinhCuTru || data.MATINH_CU_TRU)}</MATINH_CU_TRU>
  <MAXA_CU_TRU>${escapeXml(data.maXaCuTru || data.MAXA_CU_TRU)}</MAXA_CU_TRU>
  <TUOI_THAI>${escapeXml(data.tuoiThai || data.TUOI_THAI)}</TUOI_THAI>
  <BENH_ICD10_ID>${escapeXml(data.benhIcd10Id || data.BENH_ICD10_ID || data.BENHICD10_ID || data.BENH_ICD10_MA)}</BENH_ICD10_ID>
  <BENH_ICD10_TEN>${escapeXml(data.benhIcd10Ten || data.BENH_ICD10_TEN || data.TENBENHNICD10)}</BENH_ICD10_TEN>
</CT06>`;
}

/** Sinh XML Mẫu CT07: Giấy chứng nhận nghỉ việc hưởng BHXH (Mẫu số 07 - TT25) */
export function buildCt07Xml(data: Ct07NghiViecBhxh | any): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<CT07 xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <MA_CT>${escapeXml(data.maCt || data.MA_CT)}</MA_CT>
  <MAU_SO>${escapeXml(data.mauSo || data.MAU_SO || "")}</MAU_SO>
  <SO_SERI>${escapeXml(data.soSeri || data.SO_SERI)}</SO_SERI>
  <SO_KCB>${escapeXml(data.soKcb || data.SO_KCB)}</SO_KCB>
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <GIOI_TINH>${escapeXml(data.gioiTinh || data.GIOI_TINH)}</GIOI_TINH>
  <DON_VI>${escapeXml(data.donVi || data.DON_VI)}</DON_VI>
  <CHANDOAN_DIEUTRI>${escapeXml(data.chanDoanDieuTri || data.CHANDOAN_DIEUTRI)}</CHANDOAN_DIEUTRI>
  <TU_NGAY>${escapeXml(data.tuNgay || data.TU_NGAY)}</TU_NGAY>
  <DEN_NGAY>${escapeXml(data.denNgay || data.DEN_NGAY)}</DEN_NGAY>
  <HO_TEN_CHA>${escapeXml(data.hoTenCha || data.HO_TEN_CHA)}</HO_TEN_CHA>
  <HO_TEN_ME>${escapeXml(data.hoTenMe || data.HO_TEN_ME)}</HO_TEN_ME>
  <THU_TRUONG_DV>${escapeXml(data.thuTruongDv || data.THU_TRUONG_DV)}</THU_TRUONG_DV>
  <MA_CCHN>${escapeXml(data.maCchn || data.MA_CCHN)}</MA_CCHN>
  <TEN_NGUOI_HANH_NGHE>${escapeXml(data.tenNguoiHanhNghe || data.TEN_NGUOI_HANH_NGHE)}</TEN_NGUOI_HANH_NGHE>
  <NGAY_CHUNG_TU>${escapeXml(data.ngayChungTu || data.NGAY_CHUNG_TU)}</NGAY_CHUNG_TU>
  <TEKT>${escapeXml(data.tekt ?? data.TEKT ?? "")}</TEKT>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_CCCD>${escapeXml(data.soCccd || data.SO_CCCD)}</SO_CCCD>
  <NGAYCAP_CCCD>${escapeXml(data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAYCAP_CCCD>
  <NOICAP_CCCD>${escapeXml(data.noiCapCccd || data.NOICAP_CCCD)}</NOICAP_CCCD>
  <NGAY_KCB>${escapeXml(data.ngayKcb || data.NGAY_KCB)}</NGAY_KCB>
  <BENH_ICD10_ID>${escapeXml(data.benhIcd10Id || data.BENH_ICD10_ID || data.BENHICD10_ID || data.BENH_ICD10_MA)}</BENH_ICD10_ID>
  <BENH_ICD10_TEN>${escapeXml(data.benhIcd10Ten || data.BENH_ICD10_TEN || data.TENBENHNICD10)}</BENH_ICD10_TEN>
</CT07>`;
}

/** Sinh XML Mẫu GIAYDIEUTRINOITRU: Giấy xác nhận quá trình điều trị nội trú (Mẫu số 06 - TT25) */
export function buildGiayDieuTriNoiTruXml(
  data: GiayDieuTriNoiTru06 | any,
): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<CTGiayDieuTriNoiTru xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SO_LUU_TRU>${escapeXml(data.soLuuTru || data.SO_LUU_TRU)}</SO_LUU_TRU>
  <MA_YTE>${escapeXml(data.maYTe || data.MA_YTE)}</MA_YTE>
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <GIOI_TINH>${escapeXml(data.gioiTinh || data.GIOI_TINH)}</GIOI_TINH>
  <MA_KHOA>${escapeXml(data.maKhoa || data.MA_KHOA)}</MA_KHOA>
  <TEN_DAN_TOC>${escapeXml(data.tenDanToc || data.TEN_DAN_TOC)}</TEN_DAN_TOC>
  <MA_DAN_TOC>${escapeXml(data.maDanToc || data.MA_DAN_TOC || data.MA_DANTOC)}</MA_DAN_TOC>
  <NGHE_NGHIEP>${escapeXml(data.ngheNghiep || data.NGHE_NGHIEP)}</NGHE_NGHIEP>
  <DIA_CHI>${escapeXml(data.diaChi || data.DIA_CHI)}</DIA_CHI>
  <NGAY_VAO>${escapeXml(data.ngayVao || data.NGAY_VAO)}</NGAY_VAO>
  <NGAY_RA>${escapeXml(data.ngayRa || data.NGAY_RA)}</NGAY_RA>
  <CHAN_DOAN>${escapeXml(data.chanDoan || data.CHAN_DOAN)}</CHAN_DOAN>
  <PP_DIEUTRI>${escapeXml(data.ppDieuTri || data.PP_DIEUTRI)}</PP_DIEUTRI>
  <MO_TA>${escapeXml(data.moTa || data.MO_TA)}</MO_TA>
  <GHI_CHU>${escapeXml(data.ghiChu || data.GHI_CHU)}</GHI_CHU>
  <DAI_DIEN_DVI>${escapeXml(data.daiDienDvi || data.DAI_DIEN_DVI || data.THU_TRUONG_DVI)}</DAI_DIEN_DVI>
  <MA_CCHN_BS>${escapeXml(data.maCchnBs || data.MA_CCHN_BS || data.MA_CCHN_TRUONGKHOA || data.MA_CCHN)}</MA_CCHN_BS>
  <TEN_BS>${escapeXml(data.tenBs || data.TEN_BS || data.TEN_TRUONGKHOA || data.TEN_NGUOI_HANH_NGHE)}</TEN_BS>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_CCCD>${escapeXml(data.soCccd || data.SO_CCCD)}</SO_CCCD>
  <NGAYCAP_CCCD>${escapeXml(data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAYCAP_CCCD>
  <NOICAP_CCCD>${escapeXml(data.noiCapCccd || data.NOICAP_CCCD)}</NOICAP_CCCD>
  <BENH_ICD10_MA>${escapeXml(data.benhIcd10Ma || data.BENH_ICD10_MA || data.benhIcd10Id || data.BENHICD10_ID || data.BENH_ICD10_ID)}</BENH_ICD10_MA>
  <BENH_ICD10_TEN>${escapeXml(data.benhIcd10Ten || data.BENH_ICD10_TEN || data.tenBenhIcd10 || data.TENBENHNICD10)}</BENH_ICD10_TEN>
  <MA_CT>${escapeXml(data.maCt || data.MA_CT)}</MA_CT>
  <NGAY_CT>${escapeXml(data.ngayCt || data.NGAY_CT)}</NGAY_CT>
  <SO_SERI>${escapeXml(data.soSeri || data.SO_SERI)}</SO_SERI>
  <TUOI_THAI>${escapeXml(data.tuoiThai || data.TUOI_THAI)}</TUOI_THAI>
  <LOAI_PHUONG_PHAP>${escapeXml(data.loaiPhuongPhap || data.LOAI_PHUONG_PHAP)}</LOAI_PHUONG_PHAP>
  <LOAI_PP_DIEU_TRI_VOSINH>${escapeXml(data.loaiPpDieuTriVoSinh || data.LOAI_PP_DIEU_TRI_VOSINH)}</LOAI_PP_DIEU_TRI_VOSINH>
  <NGAY_DINH_CHI_THAINGHEN>${escapeXml(data.ngayDinhChiThainghen || data.NGAY_DINH_CHI_THAINGHEN)}</NGAY_DINH_CHI_THAINGHEN>
  <IS_NGHIDUONGTHAI>${escapeXml(data.isNghiduongthai ?? data.IS_NGHIDUONGTHAI ?? "")}</IS_NGHIDUONGTHAI>
  <SO_NGAY_NGHIDUONGTHAI>${escapeXml(data.soNgayNghiduongthai || data.SO_NGAY_NGHIDUONGTHAI)}</SO_NGAY_NGHIDUONGTHAI>
</CTGiayDieuTriNoiTru>`;
}

/** Sinh XML Mẫu GIAYDIEUTRIVOSINH: Giấy xác nhận điều trị vô sinh (Mẫu số 09 - TT25) */
export function buildGiayDieuTriVoSinhXml(
  data: GiayDieuTriVoSinh09 | any,
): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<CTGiayDieuTriVoSinh xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SO_LUU_TRU>${escapeXml(data.soLuuTru || data.SO_LUU_TRU)}</SO_LUU_TRU>
  <MA_YTE>${escapeXml(data.maYTe || data.MA_YTE)}</MA_YTE>
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <MA_KHOA>${escapeXml(data.maKhoa || data.MA_KHOA)}</MA_KHOA>
  <MA_TINHCUTRU>${escapeXml(data.maTinhCuTru || data.MA_TINHCUTRU || data.MATINH_CU_TRU)}</MA_TINHCUTRU>
  <MA_XACUTRU>${escapeXml(data.maXaCuTru || data.MA_XACUTRU || data.MAXA_CU_TRU)}</MA_XACUTRU>
  <NGHE_NGHIEP>${escapeXml(data.ngheNghiep || data.NGHE_NGHIEP)}</NGHE_NGHIEP>
  <DIA_CHI>${escapeXml(data.diaChi || data.DIA_CHI)}</DIA_CHI>
  <NGAY_VAO>${escapeXml(data.ngayVao || data.NGAY_VAO)}</NGAY_VAO>
  <NGAY_RA>${escapeXml(data.ngayRa || data.NGAY_RA)}</NGAY_RA>
  <CHAN_DOAN>${escapeXml(data.chanDoan || data.CHAN_DOAN)}</CHAN_DOAN>
  <PP_DIEUTRI>${escapeXml(data.ppDieuTri || data.PP_DIEUTRI)}</PP_DIEUTRI>
  <GHI_CHU>${escapeXml(data.ghiChu || data.GHI_CHU)}</GHI_CHU>
  <DAI_DIEN_DVI>${escapeXml(data.daiDienDvi || data.DAI_DIEN_DVI || data.THU_TRUONG_DVI)}</DAI_DIEN_DVI>
  <MA_CCHN_BS>${escapeXml(data.maCchnBs || data.MA_CCHN_BS || data.MA_CCHN_TRUONGKHOA || data.MA_CCHN)}</MA_CCHN_BS>
  <TEN_BS>${escapeXml(data.tenBs || data.TEN_BS || data.TEN_TRUONGKHOA || data.TEN_NGUOI_HANH_NGHE)}</TEN_BS>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_CCCD>${escapeXml(data.soCccd || data.SO_CCCD)}</SO_CCCD>
  <NGAYCAP_CCCD>${escapeXml(data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAYCAP_CCCD>
  <NOICAP_CCCD>${escapeXml(data.noiCapCccd || data.NOICAP_CCCD)}</NOICAP_CCCD>
  <BENH_ICD10_MA>${escapeXml(data.benhIcd10Ma || data.BENH_ICD10_MA || data.benhIcd10Id || data.BENHICD10_ID || data.BENH_ICD10_ID)}</BENH_ICD10_MA>
  <BENH_ICD10_TEN>${escapeXml(data.benhIcd10Ten || data.BENH_ICD10_TEN || data.tenBenhIcd10 || data.TENBENHNICD10)}</BENH_ICD10_TEN>
  <MA_CT>${escapeXml(data.maCt || data.MA_CT)}</MA_CT>
  <NGAY_CT>${escapeXml(data.ngayCt || data.NGAY_CT)}</NGAY_CT>
  <SO_SERI>${escapeXml(data.soSeri || data.SO_SERI)}</SO_SERI>
  <LOAI_PHUONG_PHAP>${escapeXml(data.loaiPhuongPhap || data.LOAI_PHUONG_PHAP)}</LOAI_PHUONG_PHAP>
</CTGiayDieuTriVoSinh>`;
}

/** Sinh XML Mẫu GIAYSUCKHOEME: Giấy xác nhận sức khỏe mẹ (Mẫu số 10 - TT25) */
export function buildGiaySucKhoeMeXml(data: GiaySucKhoeMe10 | any): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<CTGiaySucKhoeMe xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SO_LUU_TRU>${escapeXml(data.soLuuTru || data.SO_LUU_TRU)}</SO_LUU_TRU>
  <MA_YTE>${escapeXml(data.maYTe || data.MA_YTE)}</MA_YTE>
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <MA_KHOA>${escapeXml(data.maKhoa || data.MA_KHOA)}</MA_KHOA>
  <MA_TINHCUTRU>${escapeXml(data.maTinhCuTru || data.MA_TINHCUTRU || data.MATINH_CU_TRU)}</MA_TINHCUTRU>
  <MA_XACUTRU>${escapeXml(data.maXaCuTru || data.MA_XACUTRU || data.MAXA_CU_TRU)}</MA_XACUTRU>
  <NGHE_NGHIEP>${escapeXml(data.ngheNghiep || data.NGHE_NGHIEP)}</NGHE_NGHIEP>
  <DIA_CHI>${escapeXml(data.diaChi || data.DIA_CHI)}</DIA_CHI>
  <NGAY_VAO>${escapeXml(data.ngayVao || data.NGAY_VAO)}</NGAY_VAO>
  <NGAY_RA>${escapeXml(data.ngayRa || data.NGAY_RA)}</NGAY_RA>
  <CHAN_DOAN>${escapeXml(data.chanDoan || data.CHAN_DOAN)}</CHAN_DOAN>
  <PP_DIEUTRI>${escapeXml(data.ppDieuTri || data.PP_DIEUTRI)}</PP_DIEUTRI>
  <KET_LUAN>${escapeXml(data.ketLuan || data.KET_LUAN)}</KET_LUAN>
  <TINHTRANGBENHHIENTAI>${escapeXml(data.tinhTrangBenhHienTai || data.TINHTRANGBENHHIENTAI)}</TINHTRANGBENHHIENTAI>
  <DAI_DIEN_DVI>${escapeXml(data.daiDienDvi || data.DAI_DIEN_DVI || data.THU_TRUONG_DVI)}</DAI_DIEN_DVI>
  <MA_CCHN_BS>${escapeXml(data.maCchnBs || data.MA_CCHN_BS || data.MA_CCHN_TRUONGKHOA || data.MA_CCHN)}</MA_CCHN_BS>
  <TEN_BS>${escapeXml(data.tenBs || data.TEN_BS || data.TEN_TRUONGKHOA || data.TEN_NGUOI_HANH_NGHE)}</TEN_BS>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_CCCD>${escapeXml(data.soCccd || data.SO_CCCD)}</SO_CCCD>
  <NGAYCAP_CCCD>${escapeXml(data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAYCAP_CCCD>
  <NOICAP_CCCD>${escapeXml(data.noiCapCccd || data.NOICAP_CCCD)}</NOICAP_CCCD>
  <BENH_ICD10_MA>${escapeXml(data.benhIcd10Ma || data.BENH_ICD10_MA || data.benhIcd10Id || data.BENHICD10_ID || data.BENH_ICD10_ID)}</BENH_ICD10_MA>
  <BENH_ICD10_TEN>${escapeXml(data.benhIcd10Ten || data.BENH_ICD10_TEN || data.tenBenhIcd10 || data.TENBENHNICD10)}</BENH_ICD10_TEN>
  <MA_CT>${escapeXml(data.maCt || data.MA_CT)}</MA_CT>
  <NGAY_CT>${escapeXml(data.ngayCt || data.NGAY_CT)}</NGAY_CT>
  <SO_SERI>${escapeXml(data.soSeri || data.SO_SERI)}</SO_SERI>
</CTGiaySucKhoeMe>`;
}

// ------------------------------------------------------------
// 2. SINH GÓI XML TỔNG HỢP <HSCHUNGTU> (LOẠI HỒ SƠ 39 - TT 25/2025)
// ------------------------------------------------------------

export interface BuildHsChungTuPackageParams {
  maCskcb: string;
  ngayLap?: string; // YYYYMMDD
  hosoId?: string; // UUID
  items: Array<{
    loaiHoSo: string; // CT03, CT04, CT06, CT07, GIAYDIEUTRINOITRU, GIAYBAOTU, GIAYCHUNGSINH...
    rawXmlContent: string;
  }>;
}

export function buildHsChungTuXmlPackage(params: BuildHsChungTuPackageParams): {
  xml: string;
  targetDataId: string;
} {
  const hosoId = params.hosoId || `Id-${crypto.randomUUID()}`;
  const ngayLap =
    params.ngayLap || new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const fileHoSoBlocks = params.items
    .map((item) => {
      const base64 = xmlToBase64(item.rawXmlContent);
      return `        <FILEHOSO>
          <LOAIHOSO>${escapeXml(item.loaiHoSo)}</LOAIHOSO>
          <NOIDUNGFILE>${base64}</NOIDUNGFILE>
        </FILEHOSO>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<HSCHUNGTU xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <THONGTINDONVI>
    <MACSKCB>${escapeXml(params.maCskcb)}</MACSKCB>
  </THONGTINDONVI>
  <THONGTINHOSO Id="${hosoId}">
    <NGAYLAP>${ngayLap}</NGAYLAP>
    <SOLUONGHOSO>${params.items.length}</SOLUONGHOSO>
    <DANHSACHHOSO>
      <HOSO>
${fileHoSoBlocks}
      </HOSO>
    </DANHSACHHOSO>
  </THONGTINHOSO>
  <CHUKYDONVI />
</HSCHUNGTU>`;

  return { xml, targetDataId: hosoId };
}

// ------------------------------------------------------------
// 3. SINH XML GIẤY BÁO TỬ (LOẠI HỒ SƠ 60)
// ------------------------------------------------------------

/**
 * Sinh XML Mẫu Giấy Báo Tử (Mẫu Loại 60 - TT25 / QĐ 130)
 * Chỉ sinh khối thân chứng từ <GIAYBAOTU>, dùng nhúng vào gói HSCHUNGTU
 */
export function buildGiayBaoTuXml(data: GiayBaoTu60 | any): string {
  const dataId = data.id || `Id-${crypto.randomUUID()}`;

  return `<?xml version="1.0" encoding="utf-8"?>
<GIAYBAOTU Id="${dataId}" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <MA_GBT>${escapeXml(data.maGbt || data.MA_GBT)}</MA_GBT>
  <MA_BN>${escapeXml(data.maBn || data.MA_BN)}</MA_BN>
  <MA_HSBA>${escapeXml(data.maHsba || data.MA_HSBA)}</MA_HSBA>
  <HO_TEN>${escapeXml(data.hoTen || data.HO_TEN)}</HO_TEN>
  <NGAY_SINH>${escapeXml(data.ngaySinh || data.NGAY_SINH)}</NGAY_SINH>
  <GIOI_TINH>${escapeXml(data.gioiTinh || data.GIOI_TINH)}</GIOI_TINH>
  <MA_THE>${escapeXml(data.maThe || data.MA_THE)}</MA_THE>
  <MA_DANTOC>${escapeXml(data.maDanToc || data.MA_DANTOC)}</MA_DANTOC>
  <MA_QUOCTICH>${escapeXml(data.maQuocTich || data.MA_QUOCTICH || "")}</MA_QUOCTICH>
  <DCHI_THUONGTRU>${escapeXml(data.dchiThuongTru || data.DCHI_THUONGTRU)}</DCHI_THUONGTRU>
  <MATINH_THUONGTRU>${escapeXml(data.maTinhThuongTru || data.MATINH_THUONGTRU)}</MATINH_THUONGTRU>
  <MAHUYEN_THUONGTRU>${escapeXml(data.maHuyenThuongTru || data.MAHUYEN_THUONGTRU)}</MAHUYEN_THUONGTRU>
  <MAXA_THUONGTRU>${escapeXml(data.maXaThuongTru || data.MAXA_THUONGTRU)}</MAXA_THUONGTRU>
  <DCHI_HIENTAI>${escapeXml(data.dchiHienTai || data.DCHI_HIENTAI)}</DCHI_HIENTAI>
  <MATINH_HIENTAI>${escapeXml(data.maTinhHienTai || data.MATINH_HIENTAI)}</MATINH_HIENTAI>
  <MAHUYEN_HIENTAI>${escapeXml(data.maHuyenHienTai || data.MAHUYEN_HIENTAI)}</MAHUYEN_HIENTAI>
  <MAXA_HIENTAI>${escapeXml(data.maXaHienTai || data.MAXA_HIENTAI)}</MAXA_HIENTAI>
  <LOAI_GIAYTO>${escapeXml(data.loaiGiayTo ?? data.LOAI_GIAYTO ?? "")}</LOAI_GIAYTO>
  <SO_GIAYTO>${escapeXml(data.soGiayTo || data.SO_GIAYTO || data.soCccd || data.SO_CCCD)}</SO_GIAYTO>
  <NGAY_CAP>${escapeXml(data.ngayCap || data.NGAY_CAP || data.ngayCapCccd || data.NGAYCAP_CCCD)}</NGAY_CAP>
  <NOI_CAP>${escapeXml(data.noiCap || data.NOI_CAP || data.noiCapCccd || data.NOICAP_CCCD)}</NOI_CAP>
  <NGAYGIO_VV>${escapeXml(data.ngayGioVv || data.NGAYGIO_VV || data.ngayVao || data.NGAY_VAO)}</NGAYGIO_VV>
  <NGAY_TV>${escapeXml(data.ngayTv || data.NGAY_TV)}</NGAY_TV>
  <TINH_TRANG_TV>${escapeXml(data.tinhTrangTv ?? data.TINH_TRANG_TV ?? "")}</TINH_TRANG_TV>
  <NGUYENNHAN_TV>${escapeXml(data.nguyenNhanTv || data.NGUYENNHAN_TV)}</NGUYENNHAN_TV>
  <NGUOI_GHIGIAY>${escapeXml(data.nguoiGhiGiay || data.NGUOI_GHIGIAY)}</NGUOI_GHIGIAY>
  <NGUOI_THANTHICH>${escapeXml(data.nguoiThanThich || data.NGUOI_THANTHICH)}</NGUOI_THANTHICH>
  <TTRUONG_DVI>${escapeXml(data.tTruongDvi || data.TTRUONG_DVI || data.thuTruongDvi || data.THU_TRUONG_DVI)}</TTRUONG_DVI>
  <SO_BAOTU>${escapeXml(data.soBaoTu || data.SO_BAOTU)}</SO_BAOTU>
  <QUYEN_SO>${escapeXml(data.quyenSo || data.QUYEN_SO)}</QUYEN_SO>
  <NGAY_CAPGIAYBT>${escapeXml(data.ngayCapGiayBt || data.NGAY_CAPGIAYBT)}</NGAY_CAPGIAYBT>
  <SO_BAOTU_BD>${escapeXml(data.soBaoTuBd || data.SO_BAOTU_BD)}</SO_BAOTU_BD>
  <QUYEN_SO_BD>${escapeXml(data.quyenSoBd || data.QUYEN_SO_BD)}</QUYEN_SO_BD>
  <MACSKCB>${escapeXml(data.maCskcb || data.MACSKCB || DEFAULT_MA_CSKCB)}</MACSKCB>
  <DIACHI_CSKCB>${escapeXml(data.diaChiCskcb || data.DIACHI_CSKCB)}</DIACHI_CSKCB>
  <MA_BHXH>${escapeXml(data.maBhxh || data.MA_BHXH)}</MA_BHXH>
  <BENH_ICD10_ID>${escapeXml(data.benhIcd10Id || data.BENH_ICD10_ID || data.BENHICD10_ID || data.BENH_ICD10_MA)}</BENH_ICD10_ID>
  <BENH_ICD10_TEN>${escapeXml(data.benhIcd10Ten || data.BENH_ICD10_TEN || data.tenBenhIcd10 || data.TENBENHNICD10)}</BENH_ICD10_TEN>
</GIAYBAOTU>`;
}

/**
 * Sinh gói XML Giấy Báo Tử độc lập <HSDLGBT> kèm thẻ ký số <CHUKYDONVI>
 */
export function buildGiayBaoTu60XmlPackage(data: GiayBaoTu60 | any): {
  xml: string;
  targetDataId: string;
} {
  const dataId = data.id || `Id-${crypto.randomUUID()}`;
  const rawItemXml = buildGiayBaoTuXml({ ...data, id: dataId });
  const cleanBody = rawItemXml.replace(/<\?xml[^>]*\?>\s*/i, "");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<HSDLGBT xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  ${cleanBody}
  <CHUKYDONVI />
</HSDLGBT>`;

  return { xml, targetDataId: dataId };
}

// ------------------------------------------------------------
// 4. SINH XML GIẤY CHỨNG SINH (LOẠI HỒ SƠ 61 - TT 22/2025)
// ------------------------------------------------------------

/**
 * Sinh XML Mẫu Giấy Chứng Sinh (Mẫu Loại 61 - TT 22/2025 / QĐ 130)
 * Chỉ sinh khối thân chứng từ <GIAYCHUNGSINH>, dùng nhúng vào gói HSCHUNGTU
 */
export function buildGiayChungSinhXml(data: GiayChungSinh61 | any): string {
  const dataId = data.id || `Id-${crypto.randomUUID()}`;

  return `<?xml version="1.0" encoding="utf-8"?>
<GIAYCHUNGSINH Id="${dataId}" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <MA_GCS>${escapeXml(data.maGcs || data.MA_GCS)}</MA_GCS>
  <MA_BN>${escapeXml(data.maBn || data.MA_BN)}</MA_BN>
  <MA_CT>${escapeXml(data.maCt || data.MA_CT || data.so || data.SO)}</MA_CT>
  <SO_SERI>${escapeXml(data.soSeri || data.SO_SERI)}</SO_SERI>
  <MA_BHXH_NND>${escapeXml(data.maBhxhNnd || data.MA_BHXH_NND)}</MA_BHXH_NND>
  <MA_THE_NND>${escapeXml(data.maTheNnd || data.MA_THE_NND)}</MA_THE_NND>
  <HOTEN_NND>${escapeXml(data.hotenNnd || data.HOTEN_NND || data.hoTen || data.HO_TEN)}</HOTEN_NND>
  <NGAYSINH_NND>${escapeXml(data.ngaysinhNnd || data.NGAYSINH_NND || data.ngaySinh || data.NGAY_SINH)}</NGAYSINH_NND>
  <MA_DANTOC_NND>${escapeXml(data.maDantocNnd || data.MA_DANTOC_NND || data.maDanToc || data.MA_DANTOC)}</MA_DANTOC_NND>
  <MA_QUOCTICH_NND>${escapeXml(data.maQuoctichNnd || data.MA_QUOCTICH_NND || "")}</MA_QUOCTICH_NND>
  <LOAI_GIAYTO_NND>${escapeXml(data.loaiGiaytoNnd ?? data.LOAI_GIAYTO_NND ?? "")}</LOAI_GIAYTO_NND>
  <SO_CCCD_NND>${escapeXml(data.soCccdNnd || data.SO_CCCD_NND || data.soCccd || data.SO_CCCD)}</SO_CCCD_NND>
  <NGAYCAP_CCCD_NND>${escapeXml(data.ngaycapCccdNnd || data.NGAYCAP_CCCD_NND)}</NGAYCAP_CCCD_NND>
  <NOICAP_CCCD_NND>${escapeXml(data.noicapCccdNnd || data.NOICAP_CCCD_NND)}</NOICAP_CCCD_NND>
  <NOI_CU_TRU_NND>${escapeXml(data.noiCuTruNnd || data.NOI_CU_TRU_NND || data.diaChi || data.DIA_CHI)}</NOI_CU_TRU_NND>
  <MATINH_CU_TRU>${escapeXml(data.matinhCuTru || data.MATINH_CU_TRU)}</MATINH_CU_TRU>
  <MAHUYEN_CU_TRU>${escapeXml(data.mahuyenCuTru || data.MAHUYEN_CU_TRU)}</MAHUYEN_CU_TRU>
  <MAXA_CU_TRU>${escapeXml(data.maxaCuTru || data.MAXA_CU_TRU)}</MAXA_CU_TRU>
  <HO_TEN_CHA>${escapeXml(data.hoTenCha || data.HO_TEN_CHA)}</HO_TEN_CHA>
  <MA_THE_TAM>${escapeXml(data.maTheTam || data.MA_THE_TAM)}</MA_THE_TAM>
  <TEN_CON>${escapeXml(data.tenCon || data.TEN_CON)}</TEN_CON>
  <GIOI_TINH_CON>${escapeXml(data.gioiTinhCon || data.GIOI_TINH_CON)}</GIOI_TINH_CON>
  <SO_CON>${escapeXml(data.soCon || data.SO_CON)}</SO_CON>
  <LAN_SINH>${escapeXml(data.lanSinh || data.LAN_SINH)}</LAN_SINH>
  <SO_CON_SONG>${escapeXml(data.soConSong || data.SO_CON_SONG)}</SO_CON_SONG>
  <CAN_NANG_CON>${escapeXml(data.canNangCon || data.CAN_NANG_CON)}</CAN_NANG_CON>
  <NGAY_SINH_CON>${escapeXml(data.ngaySinhCon || data.NGAY_SINH_CON)}</NGAY_SINH_CON>
  <NOI_SINH_CON>${escapeXml(data.noiSinhCon || data.NOI_SINH_CON)}</NOI_SINH_CON>
  <TINH_TRANG_CON>${escapeXml(data.tinhTrangCon || data.TINH_TRANG_CON)}</TINH_TRANG_CON>
  <SINHCON_PHAUTHUAT>${escapeXml(data.sinhconPhauthuat ?? data.SINHCON_PHAUTHUAT ?? "")}</SINHCON_PHAUTHUAT>
  <SINHCON_DUOI32TUAN>${escapeXml(data.sinhconDuoi32tuan ?? data.SINHCON_DUOI32TUAN ?? "")}</SINHCON_DUOI32TUAN>
  <GHI_CHU>${escapeXml(data.ghiChu || data.GHI_CHU)}</GHI_CHU>
  <NGUOI_DO_DE>${escapeXml(data.nguoiDoDe || data.NGUOI_DO_DE)}</NGUOI_DO_DE>
  <NGUOI_GHI_PHIEU>${escapeXml(data.nguoiGhiPhieu || data.NGUOI_GHI_PHIEU)}</NGUOI_GHI_PHIEU>
  <MA_TTDV>${escapeXml(data.maTtdv || data.MA_TTDV)}</MA_TTDV>
  <THU_TRUONG_DVI>${escapeXml(data.thuTruongDvi || data.THU_TRUONG_DVI)}</THU_TRUONG_DVI>
  <NGAY_CT>${escapeXml(data.ngayCt || data.NGAY_CT)}</NGAY_CT>
  <SO>${escapeXml(data.so || data.SO)}</SO>
  <QUYEN_SO>${escapeXml(data.quyenSo || data.QUYEN_SO)}</QUYEN_SO>
  <MA_BHXH_MTH>${escapeXml(data.maBhxhMth || data.MA_BHXH_MTH)}</MA_BHXH_MTH>
  <MA_THE_MTH>${escapeXml(data.maTheMth || data.MA_THE_MTH)}</MA_THE_MTH>
  <HOTEN_MTH>${escapeXml(data.hotenMth || data.HOTEN_MTH)}</HOTEN_MTH>
  <NGAYSINH_MTH>${escapeXml(data.ngaysinhMth || data.NGAYSINH_MTH)}</NGAYSINH_MTH>
  <MA_DANTOC_MTH>${escapeXml(data.maDantocMth || data.MA_DANTOC_MTH)}</MA_DANTOC_MTH>
  <MA_QUOCTICH_MTH>${escapeXml(data.maQuoctichMth || data.MA_QUOCTICH_MTH)}</MA_QUOCTICH_MTH>
  <LOAI_GIAYTO_MTH>${escapeXml(data.loaiGiaytoMth || data.LOAI_GIAYTO_MTH)}</LOAI_GIAYTO_MTH>
  <SO_CCCD_MTH>${escapeXml(data.soCccdMth || data.SO_CCCD_MTH)}</SO_CCCD_MTH>
  <NGAYCAP_CCCD_MTH>${escapeXml(data.ngaycapCccdMth || data.NGAYCAP_CCCD_MTH)}</NGAYCAP_CCCD_MTH>
  <NOICAP_CCCD_MTH>${escapeXml(data.noicapCccdMth || data.NOICAP_CCCD_MTH)}</NOICAP_CCCD_MTH>
  <NOI_CU_TRU_MTH>${escapeXml(data.noiCuTruMth || data.NOI_CU_TRU_MTH)}</NOI_CU_TRU_MTH>
  <MATINH_CU_TRU_MTH>${escapeXml(data.matinhCuTruMth || data.MATINH_CU_TRU_MTH)}</MATINH_CU_TRU_MTH>
  <MAXA_CU_TRU_MTH>${escapeXml(data.maxaCuTruMth || data.MAXA_CU_TRU_MTH)}</MAXA_CU_TRU_MTH>
  <HO_TEN_CHA_MTH>${escapeXml(data.hoTenChaMth || data.HO_TEN_CHA_MTH)}</HO_TEN_CHA_MTH>
  <NGAYSINH_CHA_MTH>${escapeXml(data.ngaysinhChaMth || data.NGAYSINH_CHA_MTH)}</NGAYSINH_CHA_MTH>
  <MA_DANTOC_CHA_MTH>${escapeXml(data.maDantocChaMth || data.MA_DANTOC_CHA_MTH)}</MA_DANTOC_CHA_MTH>
  <NOI_CU_TRU_CHA_MTH>${escapeXml(data.noiCuTruChaMth || data.NOI_CU_TRU_CHA_MTH)}</NOI_CU_TRU_CHA_MTH>
  <MATINH_CU_TRU_CHA_MTH>${escapeXml(data.matinhCuTruChaMth || data.MATINH_CU_TRU_CHA_MTH)}</MATINH_CU_TRU_CHA_MTH>
  <MAXA_CU_TRU_CHA_MTH>${escapeXml(data.maxaCuTruChaMth || data.MAXA_CU_TRU_CHA_MTH)}</MAXA_CU_TRU_CHA_MTH>
  <LOAI_GIAYTO_CHA_MTH>${escapeXml(data.loaiGiaytoChaMth || data.LOAI_GIAYTO_CHA_MTH)}</LOAI_GIAYTO_CHA_MTH>
  <SO_CCCD_CHA_MTH>${escapeXml(data.soCccdChaMth || data.SO_CCCD_CHA_MTH)}</SO_CCCD_CHA_MTH>
  <NGAYCAP_CCCD_CHA_MTH>${escapeXml(data.ngaycapCccdChaMth || data.NGAYCAP_CCCD_CHA_MTH)}</NGAYCAP_CCCD_CHA_MTH>
  <NOICAP_CCCD_CHA_MTH>${escapeXml(data.noicapCccdChaMth || data.NOICAP_CCCD_CHA_MTH)}</NOICAP_CCCD_CHA_MTH>
  <NGAYSINH_CHA_NND>${escapeXml(data.ngaysinhChaNnd || data.NGAYSINH_CHA_NND)}</NGAYSINH_CHA_NND>
  <MA_DANTOC_CHA_NND>${escapeXml(data.maDantocChaNnd || data.MA_DANTOC_CHA_NND)}</MA_DANTOC_CHA_NND>
  <LOAI_GIAYTO_CHA_NND>${escapeXml(data.loaiGiaytoChaNnd || data.LOAI_GIAYTO_CHA_NND)}</LOAI_GIAYTO_CHA_NND>
  <SO_CCCD_CHA_NND>${escapeXml(data.soCccdChaNnd || data.SO_CCCD_CHA_NND)}</SO_CCCD_CHA_NND>
  <NGAYCAP_CCCD_CHA_NND>${escapeXml(data.ngaycapCccdChaNnd || data.NGAYCAP_CCCD_CHA_NND)}</NGAYCAP_CCCD_CHA_NND>
  <NOICAP_CCCD_CHA_NND>${escapeXml(data.noicapCccdChaNnd || data.NOICAP_CCCD_CHA_NND)}</NOICAP_CCCD_CHA_NND>
  <CAP_LAN_DAU>${escapeXml(data.capLanDau ?? data.CAP_LAN_DAU ?? "")}</CAP_LAN_DAU>
</GIAYCHUNGSINH>`;
}

/**
 * Sinh gói XML Giấy Chứng Sinh độc lập <HSDLGCS> kèm thẻ ký số <CHUKYDONVI>
 */
export function buildGiayChungSinh61XmlPackage(data: GiayChungSinh61 | any): {
  xml: string;
  targetDataId: string;
} {
  const dataId = data.id || `Id-${crypto.randomUUID()}`;
  const rawItemXml = buildGiayChungSinhXml({ ...data, id: dataId });
  const cleanBody = rawItemXml.replace(/<\?xml[^>]*\?>\s*/i, "");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<HSDLGCS xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  ${cleanBody}
  <CHUKYDONVI />
</HSDLGCS>`;

  return { xml, targetDataId: dataId };
}
