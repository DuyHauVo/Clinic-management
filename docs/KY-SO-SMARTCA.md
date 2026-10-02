# Hướng dẫn Ký số VNPT SmartCA (Môi Trường Production & Demo)

> Áp dụng cho ký số chữ ký số từ xa (Remote Signing) bằng **VNPT SmartCA**,
> xác nhận qua **App SmartCA mobile** (theo tài liệu *Đặc tả & Hướng dẫn Tích hợp VNPT-SmartCA v1.1 - 15/05/2024*).

---

## 1. Luồng ký số Q1 (Đang vận hành thực tế)

```
Băm SHA-256 XML  →  POST /csc/signature/signhash  →  Người ký mở App SmartCA
                                                         xác thực FaceID / PIN
        ↑                                                      ↓
        └── poll /csc/credentials/gettraninfo mỗi 2 giây ←──────┘
                            đến khi tranStatus = 1 SUCCESS
                            → nhận chữ ký số (sig / dataSigned)
```

Mã trạng thái giao dịch (`tranStatus`):

| Mã | Ý nghĩa | Ứng xử của app |
|----|---------|----------------|
| `4000` | WAITING_FOR_SIGNER_CONFIRM — chờ duyệt trên App | Hiển thị đồng hồ đếm ngược, tự động polling kiểm tra trạng thái |
| `1` | SUCCESS — ký thành công | Lấy chuỗi chữ ký số, ghép vào cấu trúc XMLDSig |
| `4001` | EXPIRED — quá thời gian không xác nhận | Báo hết hạn giao dịch, yêu cầu gửi lại |
| `4002` | SIGNER_REJECTED — người dùng từ chối trên app | Thông báo từ chối ký số |
| `4003` | AUTHORIZE_KEY_FAILED | Báo lỗi xác thực khóa |
| `4004` | SIGN_FAILED | Báo lỗi ký số từ gateway |

---

## 2. Cấu hình môi trường Production (.env)

Hệ thống đã loại bỏ hoàn toàn môi trường Mock, chỉ sử dụng kết nối Cổng thật:

```properties
# Môi trường SmartCA: production | demo
VITE_SMARTCA_ENV=production
VITE_SMARTCA_CLIENT_ID=OURMED_CLINIC_SP_2026
VITE_SMARTCA_CLIENT_SECRET=vnpt_sec_xxxxxx
VITE_SMARTCA_DEFAULT_CCCD=048392773829

# Cổng Giám định BHYT
VITE_BHXH_ENV=production
VITE_BHXH_BASE_URL=/api-bhxh
VITE_BHXH_USERNAME=
VITE_BHXH_PASSWORD=
```

---

## 3. Bản đồ tập tin

| Tập tin | Vai trò |
|---|---|
| `src/types/smartcaTypes.ts` | Khai báo chuẩn Endpoint (`https://gwsca.vnpt.vn`), mã lỗi và types |
| `src/services/smartca/SmartCaClient.ts` | HTTP Client gọi trực tiếp VNPT Gateway qua fetch |
| `src/services/smartca/smartcaHandlers.ts` | Xử lý băm XML, khởi tạo ký Q1 và nhúng thẻ Signature |
| `src/services/smartca/smartcaConfig.ts` | Quản lý cấu hình kết nối Production từ `.env` |
| `src/hooks/useSmartCaSignQ1.ts` | Hook điều phối quy trình ký, polling và đếm ngược |
| `src/components/common/GlobalSmartCaSignModal.tsx` | Giao diện ký số toàn cục & gửi Cổng BHXH |
