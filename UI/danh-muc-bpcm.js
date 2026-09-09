/**
 * ==============================================================================
 * MODULE JS: ĐỌC EXCEL, KIỂM TRA TRƯỜNG DỮ LIỆU & XUẤT XML/BASE64 DANH MỤC BPCM
 * Danh mục: Bộ phận chuyên môn khám bệnh, chữa bệnh BHYT (Loại hồ sơ: 70)
 * API: https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc01_BPCMKBCB
 * ==============================================================================
 */

// Danh sách 11 trường dữ liệu chuẩn theo tài liệu hướng dẫn kỹ thuật BHXH 2026 (Mẫu 01/DM - BPCM, Loại hồ sơ 70)
const BPCM_SCHEMA_FIELDS = [
  { 
    key: 'STT', 
    label: 'Số thứ tự', 
    type: 'number', 
    required: true, 
    desc: 'Không được trùng nhau',
    aliases: ['STT', 'SO_THU_TU', 'SỐ THỨ TỰ', 'SOTHUTU', 'NO']
  },
  { 
    key: 'MA_KHOA', 
    label: 'Mã khoa / Bàn khám', 
    type: 'string', 
    required: true, 
    desc: 'Mã theo danh mục BYT (vd: K01, K0809, K02.D35)',
    aliases: ['MA_KHOA', 'MAKHOA', 'MÃ KHOA', 'MÃ KHOA / BÀN KHÁM', 'MÃ KHOA/BÀN KHÁM', 'MÃ BÀN KHÁM', 'MA_BAN_KHAM', 'MA KHOA', 'KHOA']
  },
  { 
    key: 'TEN_KHOA', 
    label: 'Tên khoa / Bàn khám', 
    type: 'string', 
    required: true, 
    desc: 'Tên chuyên khoa hoặc khoa lâm sàng',
    aliases: ['TEN_KHOA', 'TENKHOA', 'TÊN KHOA', 'TÊN KHOA / BÀN KHÁM', 'TÊN KHOA/BÀN KHÁM', 'TÊN BÀN KHÁM', 'TEN_BAN_KHAM', 'TEN KHOA', 'TÊN KHOA PHÒNG']
  },
  { 
    key: 'BAN_KHAM', 
    label: 'Số bàn khám', 
    type: 'number', 
    required: true, 
    desc: 'Tối đa 3 chữ số',
    aliases: ['BAN_KHAM', 'BANKHAM', 'BÀN KHÁM', 'SỐ BÀN KHÁM', 'SO_BAN_KHAM', 'SO BAN KHAM', 'SOBANKHAM']
  },
  { 
    key: 'GIUONG_PD', 
    label: 'Giường phê duyệt', 
    type: 'number', 
    required: true, 
    desc: 'Số giường theo giấy phép (tối đa 5 số)',
    aliases: ['GIUONG_PD', 'GIUONGPD', 'GIƯỜNG PHÊ DUYỆT', 'GIƯỜNG PD', 'GIUONG_PHE_DUYET', 'GIUONG PHE DUYET', 'GIUONGPHEDUYET']
  },
  { 
    key: 'GIUONG_TK', 
    label: 'Giường thực kê', 
    type: 'number', 
    required: true, 
    desc: 'Tổng số giường thực tế (tối đa 5 số)',
    aliases: ['GIUONG_TK', 'GIUONGTK', 'GIƯỜNG THỰC KÊ', 'GIƯỜNG TK', 'GIUONG_THUC_KE', 'GIUONG THUC KE', 'GIUONGTHUCKE']
  },
  { 
    key: 'GIUONG_HSTC', 
    label: 'Giường HSTC', 
    type: 'number', 
    required: true, 
    desc: 'Số giường hồi sức tích cực',
    aliases: ['GIUONG_HSTC', 'GIUONGHSTC', 'GIƯỜNG HSTC', 'GIƯỜNG HỒI SỨC TÍCH CỰC', 'GIUONG_HOI_SUC_TICH_CUC', 'GIUONG HOI SUC TICH CUC']
  },
  { 
    key: 'GIUONG_HSCC', 
    label: 'Giường HSCC', 
    type: 'number', 
    required: true, 
    desc: 'Số giường hồi sức cấp cứu',
    aliases: ['GIUONG_HSCC', 'GIUONGHSCC', 'GIƯỜNG HSCC', 'GIƯỜNG HỒI SỨC CẤP CỨU', 'GIUONG_HOI_SUC_CAP_CUU', 'GIUONG HOI SUC CAP CUU']
  },
  { 
    key: 'TU_NGAY', 
    label: 'Từ ngày', 
    type: 'string', 
    required: true, 
    desc: 'Định dạng 8 ký tự: YYYYMMDD',
    aliases: ['TU_NGAY', 'TUNGAY', 'TỪ NGÀY', 'TU NGAY', 'TỪ NGÀY (YYYYMMDD)', 'TỪ NGÀY (YYYYMMDDHHMM)']
  },
  { 
    key: 'DEN_NGAY', 
    label: 'Đến ngày', 
    type: 'string', 
    required: false, 
    desc: 'Định dạng YYYYMMDD hoặc để trống',
    aliases: ['DEN_NGAY', 'DENNGAY', 'ĐẾN NGÀY', 'DEN NGAY', 'ĐẾN NGÀY (YYYYMMDD)', 'ĐẾN NGÀY (YYYYMMDDHHMM)']
  },
  { 
    key: 'MA_CSKCB', 
    label: 'Mã cơ sở KCB', 
    type: 'string', 
    required: true, 
    desc: 'Mã 5 ký tự (vd: 01929)',
    aliases: ['MA_CSKCB', 'MACSKCB', 'MÃ CSKCB', 'MÃ CƠ SỞ KCB', 'MA_CƠ SỞ KCB', 'MA_CO_SO_KCB', 'MA_CS', 'MÃ CS', 'MA CS', 'CƠ SỞ KCB']
  }
];

class DanhMucBPCMEngine {
  constructor(cskcbInfo = {}) {
    this.cskcb = {
      maCskcb: cskcbInfo.maCskcb || '01929',
      tenCskcb: cskcbInfo.tenCskcb || 'Bệnh viện Đa khoa Trung ương',
      username: cskcbInfo.username || '01929_BV',
      maTinh: cskcbInfo.maTinh || '01',
      accessToken: cskcbInfo.accessToken || 'Sk5NakNoSVdKcXdFSUdKdDR0ejBBYlcvb3JUbHY4allGN25WRmI4aEIwOD06MDE5MjlfQlY6MTM0MTI4NTM0NDg1OTI2OTA2',
      tokenId: cskcbInfo.tokenId || '57680f47-e6b8-4103-9126-6d6d1de3935c',
      passwordHash: cskcbInfo.passwordHash || '',
      loaiHs: '70' // Loại hồ sơ 70
    };

    // Dữ liệu mẫu chuẩn ban đầu
    this.items = [
      {
        stt: 1,
        maKhoa: 'K01',
        tenKhoa: 'Khoa Khám Bệnh Ngoại Trú',
        banKham: 12,
        giuongPd: 0,
        giuongTk: 0,
        giuongHstc: 0,
        giuongHscc: 2,
        tuNgay: '20260101',
        denNgay: '',
        maCskcb: this.cskcb.maCskcb
      },
      {
        stt: 2,
        maKhoa: 'K0809',
        tenKhoa: 'Khoa Nội Tiết - Dị Ứng',
        banKham: 2,
        giuongPd: 45,
        giuongTk: 50,
        giuongHstc: 0,
        giuongHscc: 4,
        tuNgay: '20260101',
        denNgay: '',
        maCskcb: this.cskcb.maCskcb
      },
      {
        stt: 3,
        maKhoa: 'K02.D35',
        tenKhoa: 'Khoa Hồi Sức Cấp Cứu - Đơn Nguyên Thận Nhân Tạo',
        banKham: 1,
        giuongPd: 25,
        giuongTk: 30,
        giuongHstc: 10,
        giuongHscc: 15,
        tuNgay: '20260101',
        denNgay: '',
        maCskcb: this.cskcb.maCskcb
      }
    ];

    this.lastValidation = {
      isValid: true,
      totalRows: this.items.length,
      matchedFields: BPCM_SCHEMA_FIELDS.map(f => f.key),
      missingFields: [],
      errors: []
    };
  }

  /**
   * Chuẩn hóa chuỗi so sánh header
   */
  _normalizeStr(str) {
    if (!str) return '';
    return str.toString()
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt khi so sánh
      .replace(/[^A-Z0-9]/g, '');     // Chỉ giữ lại chữ và số
  }

  /**
   * ĐỌC & KIỂM TRA FILE EXCEL (.XLSX, .XLS, .CSV)
   * Tự động dò dòng tiêu đề thông minh và đối soát 11 trường
   */
  async parseAndValidateExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Chuyển worksheet sang mảng JSON các hàng
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          if (!rawRows || rawRows.length < 2) {
            resolve({
              isValid: false,
              fileName: file.name,
              totalRows: 0,
              error: 'File Excel không có dữ liệu hoặc chỉ có tiêu đề!'
            });
            return;
          }

          // QUÉT TỰ ĐỘNG TÌM DÒNG TIÊU ĐỀ (HEADER ROW) TRONG 12 DÒNG ĐẦU TIÊN
          let bestHeaderRowIndex = -1;
          let bestMatchedCount = 0;
          let bestMatchedFields = [];
          const maxScanRows = Math.min(rawRows.length, 12);

          for (let r = 0; r < maxScanRows; r++) {
            const rowCells = rawRows[r] || [];
            const normalizedCells = rowCells.map(c => ({
              raw: (c || '').toString().trim(),
              norm: this._normalizeStr(c)
            }));

            const currentMatched = [];

            BPCM_SCHEMA_FIELDS.forEach(field => {
              const fieldNormKeys = [
                this._normalizeStr(field.key),
                this._normalizeStr(field.label),
                ...(field.aliases || []).map(a => this._normalizeStr(a))
              ];

              const colIndex = normalizedCells.findIndex(cell => {
                if (!cell.norm) return false;
                return fieldNormKeys.some(fnk => cell.norm === fnk || (fnk.length >= 4 && cell.norm.includes(fnk)));
              });

              if (colIndex >= 0) {
                if (!currentMatched.some(cm => cm.colIndex === colIndex)) {
                  currentMatched.push({ field: field.key, colIndex, info: field });
                }
              }
            });

            if (currentMatched.length > bestMatchedCount) {
              bestMatchedCount = currentMatched.length;
              bestMatchedFields = currentMatched;
              bestHeaderRowIndex = r;
            }
          }

          if (bestHeaderRowIndex === -1 || bestMatchedCount < 2) {
            resolve({
              isValid: false,
              fileName: file.name,
              totalRows: 0,
              error: 'Không tìm thấy dòng tiêu đề hợp lệ của danh mục Bộ phận chuyên môn trong file Excel!'
            });
            return;
          }

          // Kiểm tra xem có thiếu trường bắt buộc nào không
          const requiredKeys = BPCM_SCHEMA_FIELDS.filter(f => f.required).map(f => f.key);
          const missingFields = BPCM_SCHEMA_FIELDS.filter(f => f.required && !bestMatchedFields.some(m => m.field === f.key));

          // Parse các dòng dữ liệu bên dưới dòng tiêu đề
          const parsedItems = [];
          const errors = [];
          const startDataRow = bestHeaderRowIndex + 1;

          for (let r = startDataRow; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) continue;

            const getValue = (keyName) => {
              const m = bestMatchedFields.find(f => f.field === keyName);
              if (!m || m.colIndex >= row.length) return '';
              const val = row[m.colIndex];
              return val !== undefined && val !== null ? val.toString().trim() : '';
            };

            const rawStt = getValue('STT');
            // Bỏ qua dòng diễn giải tiếng Việt phụ (nếu có ở hàng kế tiếp tiêu đề, ví dụ STT chứa chữ 'Số thứ tự' hoặc 'Mã lượt khám')
            if (rawStt && isNaN(parseInt(rawStt)) && (rawStt.includes('thứ tự') || rawStt.includes('khám') || rawStt.includes('chính'))) {
              continue;
            }

            const maKhoa = getValue('MA_KHOA').toUpperCase();
            const tenKhoa = getValue('TEN_KHOA');

            // Nếu cả mã khoa và tên khoa đều rỗng thì bỏ qua dòng rác
            if (!maKhoa && !tenKhoa && !rawStt) continue;

            const stt = parseInt(rawStt) || (parsedItems.length + 1);
            const banKham = parseInt(getValue('BAN_KHAM')) || 0;
            const giuongPd = parseInt(getValue('GIUONG_PD')) || 0;
            const giuongTk = parseInt(getValue('GIUONG_TK')) || 0;
            const giuongHstc = parseInt(getValue('GIUONG_HSTC')) || 0;
            const giuongHscc = parseInt(getValue('GIUONG_HSCC')) || 0;
            
            // Xử lý chuẩn hóa ngày tháng 8 ký tự YYYYMMDD (cắt nếu là YYYYMMDDHHMM hoặc định dạng ngày DD/MM/YYYY)
            let rawTuNgay = getValue('TU_NGAY').replace(/[-/:\s]/g, '');
            let tuNgay = '';
            if (rawTuNgay.length >= 8) {
              tuNgay = rawTuNgay.substring(0, 8);
            } else if (!rawTuNgay) {
              tuNgay = '20260101'; // Giá trị mặc định
            } else {
              tuNgay = rawTuNgay.padStart(8, '0');
            }

            let rawDenNgay = getValue('DEN_NGAY').replace(/[-/:\s]/g, '');
            let denNgay = '';
            if (rawDenNgay.length >= 8) {
              denNgay = rawDenNgay.substring(0, 8);
            }

            const maCskcb = getValue('MA_CSKCB') || this.cskcb.maCskcb;

            parsedItems.push({
              stt,
              maKhoa: maKhoa || `K_${stt}`,
              tenKhoa: tenKhoa || `Khoa/Phòng ${stt}`,
              banKham,
              giuongPd,
              giuongTk,
              giuongHstc,
              giuongHscc,
              tuNgay,
              denNgay,
              maCskcb
            });
          }

          if (parsedItems.length === 0) {
            resolve({
              isValid: false,
              fileName: file.name,
              totalRows: 0,
              error: 'Không tìm thấy dòng dữ liệu nào hợp lệ bên dưới dòng tiêu đề!'
            });
            return;
          }

          this.items = parsedItems;
          this.reindex();

          this.lastValidation = {
            isValid: missingFields.length === 0 && errors.length === 0,
            fileName: file.name,
            totalRows: parsedItems.length,
            headerRowFound: bestHeaderRowIndex + 1,
            matchedFields: bestMatchedFields.map(m => m.field),
            missingFields: missingFields,
            errors: missingFields.length > 0 
              ? missingFields.map(f => `Thiếu trường bắt buộc: ${f.key} (${f.label})`)
              : errors
          };

          resolve(this.lastValidation);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  // Đánh lại STT liên tục
  reindex() {
    this.items.forEach((item, index) => {
      item.stt = index + 1;
    });
  }

  /**
   * TẠO NỘI DUNG XML CHUẨN ĐẶC TẢ BHXH (MỤC 4 & MỤC 5)
   */
  generateXML(isSigned = true) {
    const uniqueId = 'Id-' + this._generateGuid();
    const signatureId = 'CHUKYDONVI-' + this._generateGuid();
    const signingTime = new Date().toISOString().replace(/\.\d{3}Z$/, '');

    let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
    xml += `<HSDANHMUC xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
    xml += `  <DANHSACH_DMBOPHANCHUYENMON Id="${uniqueId}">\n`;

    this.items.forEach(item => {
      xml += `    <DMBOPHANCHUYENMON>\n`;
      xml += `      <STT>${item.stt}</STT>\n`;
      xml += `      <MA_KHOA>${this._escapeXml(item.maKhoa)}</MA_KHOA>\n`;
      xml += `      <TEN_KHOA>${this._escapeXml(item.tenKhoa)}</TEN_KHOA>\n`;
      xml += `      <BAN_KHAM>${item.banKham}</BAN_KHAM>\n`;
      xml += `      <GIUONG_PD>${item.giuongPd}</GIUONG_PD>\n`;
      xml += `      <GIUONG_TK>${item.giuongTk}</GIUONG_TK>\n`;
      xml += `      <GIUONG_HSTC>${item.giuongHstc}</GIUONG_HSTC>\n`;
      xml += `      <GIUONG_HSCC>${item.giuongHscc}</GIUONG_HSCC>\n`;
      xml += `      <TU_NGAY>${item.tuNgay}</TU_NGAY>\n`;
      if (item.denNgay) {
        xml += `      <DEN_NGAY>${item.denNgay}</DEN_NGAY>\n`;
      } else {
        xml += `      <DEN_NGAY/>\n`;
      }
      xml += `      <MA_CSKCB>${this._escapeXml(item.maCskcb || this.cskcb.maCskcb)}</MA_CSKCB>\n`;
      xml += `    </DMBOPHANCHUYENMON>\n`;
    });

    xml += `  </DANHSACH_DMBOPHANCHUYENMON>\n`;

    if (isSigned) {
      xml += `  <CHUKYDONVI>\n`;
      xml += `    <Signature Id="${signatureId}" xmlns="http://www.w3.org/2000/09/xmldsig#">\n`;
      xml += `      <SignedInfo>\n`;
      xml += `        <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>\n`;
      xml += `        <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>\n`;
      xml += `        <Reference URI="#Object-${signatureId}">\n`;
      xml += `          <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>\n`;
      xml += `          <DigestValue>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</DigestValue>\n`;
      xml += `        </Reference>\n`;
      xml += `        <Reference URI="#${uniqueId}">\n`;
      xml += `          <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>\n`;
      xml += `          <DigestValue>47deQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=</DigestValue>\n`;
      xml += `        </Reference>\n`;
      xml += `      </SignedInfo>\n`;
      xml += `      <SignatureValue>MEQCIA1jK8d2sUeN...[CHỮ KÝ SỐ PKI CƠ SỞ KCB]...==</SignatureValue>\n`;
      xml += `      <KeyInfo>\n`;
      xml += `        <X509Data>\n`;
      xml += `          <X509SubjectName>CN=${this.cskcb.tenCskcb}, O=BHYT Vietnam, C=VN</X509SubjectName>\n`;
      xml += `          <X509Certificate>MIIF...[CHỨNG THƯ SỐ X509]...==</X509Certificate>\n`;
      xml += `        </X509Data>\n`;
      xml += `      </KeyInfo>\n`;
      xml += `      <Object Id="Object-${signatureId}">\n`;
      xml += `        <SignatureProperties xmlns="">\n`;
      xml += `          <SignatureProperty Target="#${signatureId}" Id="Property-${signatureId}">\n`;
      xml += `            <SigningTime>${signingTime}</SigningTime>\n`;
      xml += `          </SignatureProperty>\n`;
      xml += `        </SignatureProperties>\n`;
      xml += `      </Object>\n`;
      xml += `    </Signature>\n`;
      xml += `  </CHUKYDONVI>\n`;
    }

    xml += `</HSDANHMUC>`;
    return xml;
  }

  /**
   * MÃ HÓA BASE64 FILE XML CHO THAM SỐ `fileHsBase64`
   */
  generateBase64XML() {
    const xml = this.generateXML(true);
    return this._utf8ToBase64(xml);
  }

  /**
   * TẠO FILE EXCEL MẪU CHUẨN 11 CỘT ĐỂ TẢI VỀ
   */
  downloadSampleExcel() {
    const headers = BPCM_SCHEMA_FIELDS.map(f => f.key);
    const sampleRows = this.items.map(i => [
      i.stt,
      i.maKhoa,
      i.tenKhoa,
      i.banKham,
      i.giuongPd,
      i.giuongTk,
      i.giuongHstc,
      i.giuongHscc,
      i.tuNgay,
      i.denNgay,
      i.maCskcb
    ]);

    const worksheetData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DMBOPHANCHUYENMON");

    XLSX.writeFile(wb, `Mau_DM01_BPCMKBCB_${this.cskcb.maCskcb}.xlsx`);
  }

  /**
   * TẢI FILE XML VỀ MÁY
   */
  downloadXMLFile(filename = null) {
    const xmlContent = this.generateXML(true);
    const fname = filename || `DM_BPCM_${this.cskcb.maCskcb}_${this.cskcb.loaiHs}.xml`;
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fname;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * GỬI API HOẶC MÔ PHỎNG TIẾP NHẬN BHYT
   */
  async sendToBHYTGateway() {
    const now = new Date();
    const thoiGian = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const maGiaoDich = `DANHMUC01_${this.cskcb.maCskcb}_${Date.now().toString().slice(-6)}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          maKetQua: "200",
          maGiaoDich: maGiaoDich,
          thongDiep: `Tiếp nhận thành công danh mục ${this.items.length} bộ phận chuyên môn của cơ sở KCB ${this.cskcb.maCskcb}.`,
          thoiGianTiepNhan: thoiGian,
          chiTiet: {
            soBanGhi: this.items.length,
            loaiHs: 70,
            maCskcb: this.cskcb.maCskcb
          }
        });
      }, 700);
    });
  }

  // Tiện ích hỗ trợ
  _generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  _escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  _utf8ToBase64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
}

// Global instance
window.dmBpcmEngine = new DanhMucBPCMEngine();
