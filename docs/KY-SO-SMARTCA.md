# Hướng dẫn Ký số VNPT SmartCA

> Áp dụng cho nhánh `feat/ky-so-online` — ký số Hồ sơ 01/BH trước khi gửi Cổng BHXH,
> xác nhận qua **OTP trên app SmartCA mobile** (theo tài liệu *Tích hợp VNPT-SmartCA v1.1 - 15/05/2024*).

---

## 1. Luồng ký số (đã cài đặt)

```
Băm SHA-256 XML  →  POST /csc/signature/signhash  →  Người ký mở app SmartCA
                                                        nhập PIN/OTP xác nhận
        ↑                                                      ↓
        └── poll /csc/credentials/gettraninfo mỗi 2 giây ←──────┘
                            đến khi tranStatus = 1 SUCCESS
                            → nhận chữ ký (sig / dataSigned)
```

Mã trạng thái giao dịch (`tranStatus`):

| Mã | Ý nghĩa | Ứng xử của app |
|----|---------|----------------|
| `4000` | WAITING_FOR_SIGNER_CONFIRM — chờ OTP | hiển thị timeline "chờ OTP", poll tiếp |
| `1` | SUCCESS — ký thành công | lấy chữ ký, cho phép gửi cổng kèm chữ ký |
| `4001` | EXPIRED — quá 5 phút không xác nhận | yêu cầu ký lại |
| `4002` | SIGNER_REJECTED — từ chối trên app | yêu cầu ký lại |
| `4003` | AUTHORIZE_KEY_FAILED | báo lỗi xác thực khóa |
| `4004` | SIGN_FAILED | báo lỗi ký |

---

## 2. Bản đồ file (cái gì nằm ở đâu)

| File | Vai trò |
|------|---------|
| `src/utils/smartca/types.ts` | Type + hằng số theo đặc tả VNPT (endpoint, mã trạng thái, envelope) |
| `src/utils/smartca/config.ts` | Cấu hình lưu `localStorage` key `smartca-config:v1` (**không** lưu mật khẩu/secret) |
| `src/utils/smartca/hash.ts` | `sha256Base64` bằng Web Crypto (không thêm thư viện) |
| `src/utils/smartca/SmartCaClient.ts` | **Client THẬT** gọi `rmgateway.vnptit.vn` / `gwsca.vnpt.vn` bằng fetch |
| `src/utils/smartca/MockSmartCaClient.ts` | **Client MOCK** — mô phỏng toàn bộ luồng + nút "Giả lập xác nhận OTP" |
| `src/utils/smartca/smartcaService.ts` | Facade chọn Mock/Real + kiểm tra kết nối |
| `src/context/SmartCaContext.tsx` | Phiên đăng nhập toàn app (token chỉ nằm memory + `sessionStorage`) |
| `src/hooks/useSmartCaSigning.ts` | Máy trạng thái ký: `idle → hashing → sending → waiting_confirm → success/...` |
| `src/components/common/SmartCaSignPanel.tsx` | UI ký số (chứng thư, timeline, OTP) |
| `src/components/common/SmartCaSettingsModal.tsx` | UI cấu hình môi trường + đăng nhập + kiểm tra kết nối |
| `src/components/danh-muc/common/DanhMucXmlModal.tsx` | Tab **"Ký Số SmartCA"** trong modal XML (tùy chọn qua prop `enableSmartCa`) |

---

## 3. Chạy thử với MOCK (không cần tài khoản VNPT)

1. Bấm chip **"SmartCA: Mock - chưa đăng nhập"** trên Navbar (góc phải).
2. Mật khẩu nhập **bất kỳ** → Lưu & Đăng nhập.
3. Vào **Hồ sơ → Bộ 1 (01/BH)** → Xuất XML → tab **"Ký Số SmartCA"** → bấm **"Ký Số Hồ Sơ Bằng SmartCA"**.
4. Khi timeline ở bước *chờ OTP*, bấm **"Giả lập xác nhận OTP (như app điện thoại)"**.
5. Ký thành công → quay lại tab API → **"Gửi Lên Cổng BHXH"** — kết quả ghi nhận đã kèm chữ ký.

Kịch bản kiểm thử khác: **"Giả lập từ chối (4002)"**, hoặc chờ quá 5 phút để thấy **4001 EXPIRED**.

---

## 4. Chuyển sang KÝ SỐ THẬT (khi VNPT cấp tài khoản) ⚠️

Không cần sửa code luồng ký — Mock và Real dùng chung interface `SmartCaClient`:

1. **Đăng ký dịch vụ với VNPT** để được cấp `client_id` + `client_secret` (trở thành *Nhà phát triển*).
2. Mở **Cấu hình SmartCA** (chip Navbar) → chọn môi trường:
   - **Demo VNPT**: `https://rmgateway.vnptit.vn` (thử nghiệm)
   - **Production**: `https://gwsca.vnpt.vn` (chính thức)
3. Nhập `client_id`, `client_secret` (chỉ giữ trong bộ nhớ phiên), **username = CCCD người ký**, mật khẩu.
4. Bấm **"Kiểm tra kết nối"** — phải đọc được chứng thư (subjectDN, serial, hạn hiệu lực).
5. **Lưu & Đăng nhập** → tab "Ký Số SmartCA" giờ ký thật: OTP đẩy thẳng vào app SmartCA trên điện thoại người ký.

### Những điểm cần lưu ý khi lên thật

| Vấn đề | Xử lý |
|--------|-------|
| **CORS** | Trình duyệt gọi trực tiếp `rmgateway/gwsca` cần VNPT allowlist origin. Nếu bị chặn → dựng proxy server-side cùng domain (khuyến nghị cho production). |
| **client_secret** | Đang chỉ lưu trong bộ nhớ phiên (mất khi refresh trang). Production nên đưa việc đổi token về proxy để secret không bao giờ xuống trình duyệt. |
| **notifyUrl** | Đặc tả có callback server-to-server; app này dùng polling `gettraninfo` thay thế vì chưa có backend. Khi có server, bổ sung `notifyUrl` trong request `signhash` để nhận kết quả đẩy về. |
| **Giới hạn** | `signhash` tối đa 50 hash/lần, `sign` (file base64) tối đa 10 file/lần. |
| **Gói lượt ký** | Lỗi `SERVICE_PACK_EXEED_OR_INVALID` = hết lượt ký trong gói — liên hệ VNPT mua thêm. |

### Điểm thay dữ liệu thật trong code (đã note sẵn bằng tiếng Việt trong code)

- `src/utils/smartca/smartcaService.ts` — đầu vào duy nhất tạo client Mock/Real.
- `src/utils/hs01TongHopXmlEngine.ts` → `sendHs01ToBhxhGateway(..., signature?)` — hiện mô phỏng
  sandbox cổng BHXH; khi cổng EGW thật yêu cầu hồ sơ đã ký, dùng tham số `signature`
  (tranId, serial, chữ ký) trong payload theo đặc tả cổng.
- `src/components/ho-so/01-tonghop/components/Hs01XmlModal.tsx` — nơi truyền chữ ký vào hàm gửi.
- Tab "Chuỗi Base64 Đã Ký Số" hiện là base64 thường; muốn base64 **đã ký** thật, gọi API
  `sign` (5.2.3) với `dataBase64` thay vì `signhash` rồi thay nội dung tab bằng `dataSigned`.

---

## 5. Mở rộng sang 09/BH & các danh mục khác

Component đã dùng chung — chỉ cần bật prop tại modal của từng module:

```tsx
<DanhMucXmlModal
  // ...props hiện có
  enableSmartCa
  smartCaFileName={`HSDC09BH_${maCskcb}.xml`}
  smartCaDescription="Ky so Ho so Dieu Chinh 09/BH"
/>
```

và trong hàm gửi cổng của module đó nhận thêm `signature?: SmartCaSignatureResult`.
Module Hồ sơ 09/BH (nhánh `feat/ho-so-xuat-toan-09`) sẽ bật tương tự khi merge.
