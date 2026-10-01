DỊCH VỤ VNPT-SMARTCA
Tài liệu đặc tả và hướng dẫn tích hợp
VNPT, 2024
Tòa nhà Vinaphone, đường Xuân Tảo, Xuân La, Tây Hồ, Hà Nội
Version 1.1Dịch vụ VNPT-SmartCA
VNPT, 2024 1
Copyright 2024 Công ty Công Nghệ Thông Tin VNPT
Lô 2A, làng Quốc tế Thăng Long
Cầu Giấy, Hà Nội
Điện thoại 18001260
Website https://smartca.vnpt.vn
Email smartca@vnpt.vn
Phiên bản tài liệu 1.1
Ngày phát hành 15-05-2024
Trạng thái tài liệu Hoàn thànhDịch vụ VNPT-SmartCA
VNPT, 2024 2
Lịch sử sửa đổi
Ngày sửa đổi Người thực hiện Nội dung
22/08/2021 Bùi Sĩ Tuấn Initial document
15/05/2024 Bùi Sĩ Tuân Cập nhật bảng mã lỗiDịch vụ VNPT-SmartCA
VNPT, 2024 3
1 Giới thiệu.....................................................................................................................................4
1.1 Thông tin tài liệu................................................................................................................................ 4
1.2 Quy ước sử dụng ............................................................................................................................... 4
2 Giao thức API ...............................................................................................................................5
3 Token Authorization......................................................................................................................5
3.1 Authorization code ............................................................................................................................ 5
3.2 Resource Owner Password Credentials............................................................................................. 9
4 Định nghĩa tham số ..................................................................................................................... 11
4.1 Request............................................................................................................................................ 12
4.2 Response.......................................................................................................................................... 12
4.3 Mã trả về thường gặp...................................................................................................................... 13
5 Chi tiết API ................................................................................................................................ 13
5.1 User.................................................................................................................................................. 13
5.1.1 Userinfo.................................................................................................................................. 13
5.2 Credential and Signature ................................................................................................................. 14
5.2.1 List credential ......................................................................................................................... 14
5.2.2 Credential Info........................................................................................................................ 15
5.2.3 Sign ......................................................................................................................................... 17
5.2.4 Sign hash................................................................................................................................. 18
5.2.5 Get Transaction Info............................................................................................................... 19
6 Xác nhận giao dịch trên app mobile ........................................................... Error! Bookmark not defined.
6.1. Kích hoạt tài khoản thuê bao...............................................................Error! Bookmark not defined.
6.2. Xác nhận giao dịch ký số ......................................................................Error! Bookmark not defined.
7 Code mẫu tích hợp ...................................................................................................................... 21Dịch vụ VNPT-SmartCA
VNPT, 2024 4
1 Giới thiệu
Cảm ơn quý khách đã tin tưởng sử dụng Dịch vụ VNPT SmartCA.
Vui lòng liên hệ với chúng tôi nếu có bất cứ câu hỏi hoặc góp ý nào liên quan đến dịch vụ.
1.1 Thông tin tài liệu
Tài liệu này mô tả phân hệ VNPT-SmartCA API Gateway, cổng dịch vụ cho phép đối tác kết nối và thực hiện các nghiệp vụ
liên quan đến chữ ký số thông qua giao diện web service.
1.2 Quy ước sử dụng
Trong tài liệu này chúng tôi sử dụng các quy ước sau nhằm giúp việc trình bày được rõ ràng và thuận tiện hơn trong việc
nắm bắt nội dung:
Quy ước Ý nghĩa Ví dụ
Courier New Đoạn code “RequestID”: “5b483845-35b6-48c9-b9a6-
3a4024271271”
Bold Nội dung cần nhấn mạnh …yêu cầu phương thức POST.
code Tham số hoặc giá trị tham số, kết quả response_type=code
Các nội dung cần lưu ý sẽ được trình bày với định dạng như sau:Dịch vụ VNPT-SmartCA
VNPT, 2024 5
Nội dung cần lưu ý
2 Giao thức API
Phân hệ Gateway API được cung cấp qua giao thứ HTTPs và yêu cầu phương thức POST.
Tham số sử dụng cho tất cả request vào protected resource service có định dạng application/json.
Demo Production
Địa chỉ authorization service https://rmgateway.vnptit.vn/auth/authorize https://gwsca.vnpt.vn/auth/authorize
Địa chỉ yêu cầu access_token https://rmgateway.vnptit.vn/auth/token https://gwsca.vnpt.vn/auth/token
Địa chỉ protected resource service https://rmgateway.vnptit.vn https://gwsca.vnpt.vn
3 Token Authorization
Nhằm bảo vệ chữ ký số cùng các thông tin của người dùng, đồng thời xác thực người dùng, xác thực ứng dụng bên thứ 3
thực hiện giao dịch. VNPT SmartCA ứng dụng mô hình xác thực dựa trên token (Token base Authorization).
Hệ thống xác thực được xây dựng theo giao thức Oauth2 (RFC 6479) cung cấp 2 mô hình xác thực:
• Authorization code
• Resource Owner Password Credentials
Người dùng (chủ sở hữu chữ ký số tập trung) được định danh bởi cặp thông tin uid, password.
Ứng dụng muốn lấy các thông tin người dùng hoặc gửi yêu cầu ký số bắt buộc phải có sự đồng ý của người dùng. Sau khi
xác thực thông tin tài khoản với VNPT SmartCA, người dùng sẽ đồng ý cấp quyền để ứng dụng có thể đọc các thông tin
public cũng như gửi yêu cầu ký số.
Sau khi đối tác (khách hàng doanh nghiệp) đăng ký sử dụng API sẽ trở thành Nhà phát triển, cho
phép đăng ký và quản lý các ứng dụng được phép kết nối tới API.
3.1 Authorization code
Phù hợp với tất cả các ứng dụng web hoặc native application. Người dùng sẽ xác thực trực tiếp với VNPT SmartCA và đồng
ý cấp quyền để ứng dụng sử dụng Protected resource của mình (gửi yêu cầu ký số).Dịch vụ VNPT-SmartCA
VNPT, 2024 6
Bước 1: Ứng dụng gửi yêu cầu Authorization code tới VNPT-SmartCA
Authorize request:
• URL DEMO: https://rmgateway.vnptit.vn/auth/authorize
• URL PRODUCTION: https://gwsca.vnpt.vn/auth/authorize
• HTTP Method: POST
• HTTP Content-Type: x-www-form-urldencoded
• HTTP Body parameter:
Key Type Description
response_type String Yêu cầu giá trị là code
client_id String Định danh ứng dụng client
state String
Giá trị sẽ được trả nguyên vẹn khi redirect về từ dịch vụ. Có thể sử dụng với 2
mục đích
• Lưu dữ liệu người dùng ngay cả khi bị redirect
• Chống tấn công CSRF
redirect_uri String Callback url để dịch vụ gọi lại gửi giá trị authorization_code (yêu cầu cấu hình
trước)
scope String Yêu cầu giá trị là sign offline_accessDịch vụ VNPT-SmartCA
VNPT, 2024 7
VNPT SmartCA trả về cho ứng dụng một redirect response yêu cầu ứng dụng chuyển hướng người dùng đến trang đăng
nhập của VNPT SmartCA
Bước 2: Ứng dụng chuyển hướng người dùng đến trang đăng nhập của VNPT SmartCA, người dùng đăng nhập sử dụng tài
khoản VNPT SmartCA và cấp quyền truy cập cho ứng dụng.
Bước 3: VNPT-SmartCA sẽ trả giá trị gọi hàm callback của ứng dụng thông qua tham số redirect_uri dưới dạng
• URL: <redirect_uri>?code=<access_token_exchange_value>&state=<client_values>
• HTTP Method: GET
Tham số code trả về dùng để trao đổi access_token trên hệ thống VNPT SmartCA, tham số state dùng để kiểm tra với tham
số đã truyền trong request ở bước trước.
• Tham số code chỉ có hiệu lực trong thời gian 15 giây kể từ khi response được
gửi về ứng dụng.
• redirect_uri yêu cầu trùng với uri đã đăng ký
Bước 4: Ứng dụng sử dụng tham số code để yêu cầu access_token
Token request:
• URL DEMO: https://rmgateway.vnptit.vn/auth/token
• PRODUCTION: https://gwsca.vnpt.vn/auth/token
• HTTP Method: POST
• HTTP Content-Type: x-www-form-urldencoded
• HTTP Body paramter:
Key Type DescriptionDịch vụ VNPT-SmartCA
VNPT, 2024 8
grant_type String Yêu cầu giá trị là authorization_code
client_id String Định danh ứng dụng client
client_secret String Chuỗi giá trị bí mật tương ứng với ứng dụng client
code String Giá trị trả về từ bước 3
redirect_uri String Callback url để dịch gọi lại gửi giá trị access_token (yêu cầu cấu hình trước)
Bước 5: VNPT-SmartCA trả về response chứa access_token, refresh_token và các thông tin bổ sung cho ứng dụng
Token response:
• HTTP Content-Type: application/json: charset=utf-8
• HTTP Body response:
Key Type Description
access_token String Giá trị access_token định dạng JWT
refresh_token String Giá trị refresh_token dùng để yêu cầu access_token mới khi hết hạn.
token_type String Định dạng token. Mặc định là bearer
expires_in String Thời gian hiện lực của access_token tính bằng giây
scope String Thông tin các access mà access token này được cấp
• Mẫu response
{
"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
"refresh_token": "821085395545EE7E2A51C01814C564316CFEB826511DFA0C995CCF2E114DBD1D"
"token_type": "bearer",
"expires_in": 3599,
"scope": "email offline_access openid profile sign"
}
Bước 6: Dùng refresh_token (có timelife là 3 tháng) để lấy access_token và refresh_token mới
Token request:
• URL DEMO: https://rmgateway.vnptit.vn/auth/token
• PRODUCTION: https://gwsca.vnpt.vn/auth/token
• HTTP Method: POST
• HTTP Content-Type: x-www-form-urldencoded
• HTTP Body paramter:
Key Type Description
grant_type String Yêu cầu giá trị là refresh_tokenDịch vụ VNPT-SmartCA
VNPT, 2024 9
client_id String Định danh ứng dụng client
client_secret String Chuỗi giá trị bí mật tương ứng với ứng dụng client
refresh_token String Giá trị của refresh_token được trả từ Bước 5
scope String Yêu cầu giá trị là sign offline_access
Token response:
• HTTP Content-Type: application/json: charset=utf-8
• HTTP Body response:
Key Type Description
access_token String Giá trị access_token định dạng JWT
refresh_token String Giá trị refresh_token dùng để yêu cầu access_token mới khi hết hạn.
token_type String Định dạng token. Mặc định là bearer
expires_in String Thời gian hiện lực của access_token tính bằng giây
scope String Thông tin các access mà access token này được cấp
• Mẫu response
{
"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
"refresh_token": "821085395545EE7E2A51C01814C564316CFEB826511DFA0C995CCF2E114DBD1D"
"token_type": "bearer",
"expires_in": 3600,
"scope": "email offline_access openid profile sign"
}
3.2 Resource Owner Password Credentials
Thông tin đăng nhập vào hệ thống VNPT SmartCA của người dùng được gửi thông qua ứng dụng phía đối tác.Dịch vụ VNPT-SmartCA
VNPT, 2024 10
Được triển khai trong trường hợp tài khoản trên hệ thống VNPT SmartCA được đồng bộ với tài khoản ứng dụng phía đối tác
(khác nhau thông tin đăng nhập).
Để sử dụng hình thức phân quyền này, đối tác cần chứng minh được sự an toàn của ứng dụng với VNPT.
Token request:
• URL DEMO: https://rmgateway.vnptit.vn/auth/token
• URL PRODUCTION: https://gwsca.vnpt.vn/auth/token
• HTTP Method: POST
• HTTP Content-Type: x-www-form-urldencoded
• HTTP Body:
Key Type Description
grant_type String Yêu cầu giá trị là password
client_id String Định danh ứng dụng client
client_secret String Chuỗi giá trị bí mật tương ứng với ứng dụng client
username String Personal ID đã gửi vào trong email người dùng
password String Mật khẩu đăng nhập tài khoản người dùngDịch vụ VNPT-SmartCA
VNPT, 2024 11
• Tất cả tham số trên là bắt buộc.
• Tham số grant_type bắt buộc đặt giá trị “password”.
• Thông tin Client Authentication (client_id, client_secret).
Token response:
• HTTP Content-Type: application/json: charset=utf-8
• HTTP Body response:
Key Type Description
access_token String Giá trị access_token định dạng JWT
refresh_token String Giá trị refresh_token dùng để yêu cầu access_token mới khi hết hạn.
token_type String Định dạng token. Mặc định là bearer
expires_in String Thời gian hiện lực của access_token tính bằng giây
scope String Thông tin các access mà access token này được cấp
• Mẫu response
{
"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
"refresh_token": "821085395545EE7E2A51C01814C564316CFEB826511DFA0C995CCF2E114DBD1D"
"token_type": "bearer",
"expires_in": 3600,
"scope": "email offline_access openid profile sign"
• Các lỗi thường gặp
Sai thông tin App client
• HTTP Status code: 400 Bad Request
• HTTP Content-Type: application/json: charset=utf-8
• HTTP Body response:
{
"error": "invalid_client"
}
Sai thông tin tài khoản
• HTTP Status code: 400 Bad Request
• HTTP Content-Type: application/json: charset=utf-8
• HTTP Body response:
{
"error": "invalid_grant",Dịch vụ VNPT-SmartCA
VNPT, 2024 12
"error_description": "Incorrect password, you have 3 attempts left. If you enter
incorrectly more than 5 times, your account will be locked for 5 minutes."
}
Sai thông tin api scopes
• HTTP Status code: 400 Bad Request
• HTTP Content-Type: application/json: charset=utf-8
• HTTP Body response:
{
"error": "invalid_scope"
} 4
Định nghĩa tham số
4.1 Request
• HTTP Content-Type: application/json; charset=utf-8
• HTTP Header: Authorization : Bearer <access_token>
• HTTP Body:
Với request yêu cầu account login, bổ sung thêm header property sau:
Key=Authorization
Value=Bearer <access_token>
4.2 Response
• HTTP Content-Type: application/json: charset=utf-8
• HTTP Response Body:
Key Type Description
code Integer Mã kết quả trả về
codeDesc String Mô tả mã kết quả
message String Nội dung chi tiết kết quả xử lý
content object Dữ liệu trả về cho từ api định dạng json object hoặc json array.
• Mẫu response body
{
"code": 0,
"codeDesc": "SUCCESS",Dịch vụ VNPT-SmartCA
VNPT, 2024 13
"message": "Success",
"content": [
"0cf6f04a-81ff-49a7-bc70-e27edb4759f9"
]
}
4.3 Mã trả về thường gặp
Các giá trị thường gặp cho thuộc tính ResponseCode
STT Mã trả về Ý nghĩa
1 Success
5 Chi tiết API
5.1 User
5.1.1 Userinfo
• Mục đích: Lấy thông tin tài khoản người dùng
• URL DEMO: https://rmgateway.vnptit.vn/identityapi/userinfo/info
• URL PRODUCTION: https://gwsca.vnpt.vn/identityapi/userinfo/info
• Authorize: Bearer token
• Tham số Paramter: Không yêu cầu
• Request mẫu
{ }
• Response Content
Key Type Description
accType int
Loại thuê bao
0: Khách hàng cá nhân
1: Khách hàng doanh nghiệp
2: Cá nhân trong doanh nghiệp
3: Onetime CA
uidPre string Loại giấy tờ (CMND, CCCD, …)
uid string Số CMND, CCCD
email string Địa chỉ email của thuê bao
phone string Số điện thoại của thuê baoDịch vụ VNPT-SmartCA
VNPT, 2024 14
• ResponseCode
Value Name Description
0 SUCCESS Success
30000 CLIENT_INPUT_INVALID Có tham số không hợp lệ trong request
(xem chi tiết trong trường message)
50000 SERVAR_INTERNAL_ERROR Xảy ra lỗi không xác định hoặc ngoại lệ
chưa được kiểm soát
60000 CREDENTIAL_NOT_EXIST Không tồn tại credential trên hệ thống
60001 CREDENTIAL_NOT_MATCH_IDENTITY Credential không thuộc sở hữu của tài
khoản
64000 CREDENTIAL_SIGN_FILE_UNSUPPORT_FILETYPE Định dạng file yêu cầu ký số chưa được
hỗ trợ
65000 SERVICE_PACK_EXEED_OR_INVALID Gói cước không hợp lệ hoặc hết lượt ký
62010 SIGNATURE_DATA_REQUEST_INVALID_FORMAT Tham số cấu hình ký nâng cấp không
hợp lệ
63002 CREDENTIAL_SIGN_FILE_UPLOAD_FAILED Có lỗi khi ghi file cần ký lên hệ thống lưu
trữ tập trung
62000 SIGNATURE_TRANSACTION_NOT_FOUND Không tồn tại giao dịch ký số đang tìm
kiếm trên hệ thống
62001
SIGNATURE_TRANSACTION_NOT_MATCH_IDENTITY Giao dịch đang yêu cầu lấy thông tin
không thuộc tài khoản trong
access_token
• Response mẫu
{
"code": 0,
"codeDesc": "SUCCESS",
"message": "Success",
"content": [
"0cf6f04a-81ff-49a7-bc70-e27edb4759f9"
]
}
5.2 Credential and Signature
5.2.1 List credential
• Mục đích: Lấy danh sách credential của thuê bao.
• URL DEMO: https://rmgateway.vnptit.vn/csc/credentials/list
• URL PRODUCTION: https://gwsca.vnpt.vn/csc/credentials/listDịch vụ VNPT-SmartCA
VNPT, 2024 15
• Authorize: Bearer token
• Tham số Paramter: Không yêu cầu
• Request mẫu
{ }
• Response thành công
Trả lại danh sách ID credential của thuê bao
{
"code": 0,
"codeDesc": null,
"message": null,
"content": [
"5d5c0a0f-59b8-498c-9e8e-c3e9b8f1e718"
]
}
• Các trường hợp lỗi thường gặp
5.2.2 Credential Info
• Mục đích: Lấy thông tin credential của thuê bao (thông tin chứng thư, thông tin khóa ký)
• URL DEMO: https://rmgateway.vnptit.vn/csc/credentials/info
• URL PRODUCTION: https://gwsca.vnpt.vn/csc/credentials/info
• Authorize: Bearer token
• Tham số Paramter:
Key Type Description
credentialId string (Required) ID credential của thuê bao
certificates string
(Required) Kiểu trả về chứng thư số của thuê bao

- none: Không trả về trong kết quả
- single: Chỉ trả về chứng thư số của thuê bao
- chain: Trả về danh sách chứng thư bao gồm của
  thuê bao và của CA
  certInfo boolean (Optional) Có trả về thông tin chứng thư hoặc không
  authInfo boolean (Optional) Có trả về thông tin kiểu xác thực của thuê bao hoặc không
  • Request mẫu
  {
  "credentialId": "5d5c0a0f-59b8-498c-9e8e-c3e9b8f1e718",
  "certificates": "chain",
  "certInfo": true,
  "authInfo": trueDịch vụ VNPT-SmartCA
  VNPT, 2024 16
  }
  • Response thành công
  {
  "key": {
  "status": "ENABLED",
  "alg": [
  "1.2.840.113549.1.1.1"
  ],
  "len": 2048
  },
  "cert": {
  "status": "VALID",
  "serialNumber": "54010101c89f68327fba49dc613ece93",
  "subjectDN": "C=VN,ST=Quảng Nam,L=Huyện Bắc Trà My,CN=Bùi Sĩ
  Tuấn,UID=CCCD:038093015572",
  "issuerDN": "C=VN,O=VIETNAM POSTS AND TELECOMMUNICATIONS GROUP,CN=VNPT SmartCA
  RS",
  "certificates": [
  "MIIFODCCBCCgAwIBAgIQVAEBAcifaD...",
  "MIIGNDCCBBygAwIBAgIRAPwGDYBv11...",
  "MIIG/DCCBOSgAwIBAgIRAJWSu4zurV..."
  ],
  "validFrom": "20240514073200Z",
  "validTo": "20241113051100Z"
  },
  "authMode": "oauth2code",
  "scal": "SCAL2",
  "multisign": 1,
  "status": "VALID",
  "servicePacks": [
  {
  "servicePackId": "33cca660-f707-45ad-babb-4d9886a7a122",
  "name": "Gói lượt ký cá nhân 038093015572",
  "admin": {
  "credentialId": null,
  "id": "72b9d416-a488-47b5-bd81-d6d75c2eff19",
  "uid": "038093015572",
  "fullName": "Bùi Sĩ Tuấn",
  "email": "tuanbs208@gmail.com",
  "phone": "0947156062"
  },
  "type": 0,
  "status": 0
  }
  ],
  "signType": 0,
  "defaultServicePackId": "33cca660-f707-45ad-babb-4d9886a7a122"
  }
  • Các trường hợp lỗi thường gặp
  Không tồn tại credential theo thông tin tìm kiếm
  • HTTP Status code: 400 Bad Request
  • HTTP Content-Type: application/json: charset=utf-8
  • HTTP Body response:
  {
  "code": 60000,
  "codeDesc": "CREDENTIAL_NOT_EXIST",
  "message": "no_credential_match_id_0cf6f04a-81ff-49a7-bc70-e27edb4759f8",Dịch vụ VNPT-SmartCA
  VNPT, 2024 17
  "content": null
  }
  Credential không thuộc tài khoản trong access_token
  • HTTP Status code: 400 Bad Request
  • HTTP Content-Type: application/json: charset=utf-8
  • HTTP Body response:
  {
  "code": 60001,
  "codeDesc": "CREDENTIAL_NOT_MATCH_IDENTITY",
  "message": "Credential not match user",
  "content": null
  }
  5.2.3 Sign
  • Mục đích: Gửi yêu cầu ký hash. Sau khi gửi yêu cầu thành công, thuê bao sẽ nhận được notification trên mobile
  app. Hệ thống phía đối tác sử dụng api get transaction info để kiểm tra trạng thái của giao dịch.
  • URL DEMO: https://rmgateway.vnptit.vn/csc/signature/sign
  • URL PRODUCTION: https://gwsca.vnpt.vn/csc/signature/sign
  • Tham số Paramter:
  Key Type Description
  credentialId string (Required) ID credential của thuê bao
  refTranId string (Optional) ID giao dịch phía đối tác
  notifyUrl string
  (Optional) Sau khi thuê bao xác nhận giao dịch ký số, SmartCA sẽ gọi URL
  này 01 lần duy nhất ở server side to server side. Đối tác cần build URL này
  để nhận kết quả từ SmartCA (HTTP POST).
  Dữ liệu định dạng application/json:
  {
  tranId = (string)“ID giao dịch ký số của SmartCA”,
  refTranId = (string)<ID giao dịch phía đối tác>,
  status = (byte)<Trạng thái giao dịch ký số>
  }
  description string (Optional) Mô tả thông tin giao dịch
  datas List (Required) Danh sách file yêu cầu ký số (tối đa 10)
  • Request mẫu
  {
  "credentialId": "5d5c0a0f-59b8-498c-9e8e-c3e9b8f1e718",
  "refTranId": "e442f592-f892-43dd-8a4b-d6339679f27f",
  "notifyUrl": https://localhost/kyso/callback,
  "description": "Pdf sign file sample",
  "datas": [
  {Dịch vụ VNPT-SmartCA
  VNPT, 2024 18
  "name": "sample.pdf",
  "dataBase64": " JVBERi0xLjUNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFs…"
  }
  ]
  }
  • ResponseCode
  Value Description
  1 Success
  • Response mẫu
  {
  "code": 0,
  "codeDesc": "SUCCESS",
  "message": "Chờ người dùng xác nhận",
  "content": {
  "tranId": "1e516e32-5091-4cf2-be36-e002cf08e013"
  }
  }
  5.2.4 Sign hash
  • Mục đích: Gửi yêu cầu ký hash. Sau khi gửi yêu cầu thành công, thuê bao sẽ nhận được notification trên mobile
  app. Hệ thống phía đối tác sử dụng api get transaction info để kiểm tra trạng thái của giao dịch.
  • URL DEMO: https://rmgateway.vnptit.vn/csc/signature/signhash
  • URL PRODUCTION: https://gwsca.vnpt.vn/csc/signature/signhash
  • Authorize: Bearer token
  • Tham số Paramter:
  Key Type Description
  credentialId string (Required) ID credential của thuê bao
  refTranId string (Required) ID giao dịch phía đối tác
  notifyUrl string
  (Optional) Sau khi thuê bao xác nhận giao dịch ký số, SmartCA sẽ gọi URL
  này 01 lần duy nhất ở server side to server side. Đối tác cần build URL này
  để nhận kết quả từ SmartCA (HTTP POST).
  Dữ liệu định dạng application/json:
  {
  tranId = (string)“ID giao dịch ký số của SmartCA”,
  refTranId = (string)<ID giao dịch phía đối tác>,
  status = (byte)<Trạng thái giao dịch ký số>
  }
  description string (Optional) Mô tả thông tin giao dịch
  datas List (Required) Danh sách hash yêu cầu ký số (tối đa 50)
  • Request mẫuDịch vụ VNPT-SmartCA
  VNPT, 2024 19
  {
  "credentialId": "5d5c0a0f-59b8-498c-9e8e-c3e9b8f1e718",
  "refTranId": "e442f592-f892-43dd-8a4b-d6339679f27f",
  "notifyUrl": "https://localhost/kyso/callback",
  "description": "Pdf signhash sample",
  "datas": [
  {
  "name": "sample.pdf",
  "hash": "y4ahlQA4RZxb1Fh7V6dfK84ga3nnEecSdroDx1LmLGE="
  },
  {
  "name": "sample.docx",
  "hash": "W3siRGF0YSI6ICI3QTRiamJPU3dCTEVyS0ZHdlRvZTI2T0ZTR2M9In1d"
  }
  ]
  }
  • ResponseCode
  Value Description
  1 Success
  • Response mẫu
  {
  "code": 0,
  "codeDesc": "SUCCESS",
  "message": "Chờ người dùng xác nhận",
  "content": {
  "tranId": "1e516e32-5091-4cf2-be36-e002cf08e013"
  }
  }
  5.2.5 Get Transaction Info
  • Mục đích: Kiểm tra trạng thái giao dịch trong khi chờ thuê bao xác nhận trên mobile app.
  • URL DEMO: https://rmgateway.vnptit.vn/csc/credentials/gettraninfo
  • URL PRODUCTION: https://gwsca.vnpt.vn/csc/credentials/gettraninfo
  • Authorize: Bearer token
  • Tham số Paramter:
  Key Type Description
  tranId String (Required) ID giao dịch trả về từ api signhash
  • Request mẫu
  {
  "tranId": "1e516e32-5091-4cf2-be36-e002cf08e013"
  }Dịch vụ VNPT-SmartCA
  VNPT, 2024 20
  • ResponseCode
  Value Description
  0 Success.
  • Response mẫu
  {
  "code": 0,
  "codeDesc": "SUCCESS",
  "message": "success",
  "content": {
  "refTranId": "e442f592-f892-43dd-8a4b-d6339679f27f",
  "documents": [
  {
  "name": "sample.pdf",
  "type": "pdf",
  "size": "30KB",
  "data": "y4ahlQA4RZxb1Fh7V6dfK84ga3nnEecSdroDx1LmLGE=",
  "hash": "y4ahlQA4RZxb1Fh7V6dfK84ga3nnEecSdroDx1LmLGE=",
  "sig": null,
  "dataSigned": null,
  "url": null
  },
  {
  "name": "sample.pdf",
  "type": "pdf",
  "size": "30KB",
  "data": "y4ahlQA4RZxb1Fh7V6dfK84ga3nnEecSdroDx1LmLGE=",
  "hash": "y4ahlQA4RZxb1Fh7V6dfK84ga3nnEecSdroDx1LmLGE=",
  "sig": null,
  "dataSigned": null,
  "url": null
  }
  ],
  "tranId": "1e516e32-5091-4cf2-be36-e002cf08e013",
  "sub": "879f198d-bce0-4617-892f-c6c7a8c79fb7",
  "credentialId": "5d5c0a0f-59b8-498c-9e8e-c3e9b8f1e718",
  "tranType": 3,
  "tranTypeDesc": "SIGNHASH",
  "tranStatus": 4000,
  "tranStatusDesc": "WAITING_FOR_SIGNER_CONFIRM",
  "reqTime": "2021-08-22T10:18:34.87Z"
  }
  }
  Trạng thái của Transaction được mô tả (tranStatusDesc = tranStatus) như sau:
  SUCCESS = 1,
  WAITING_FOR_SIGNER_CONFIRM = 4000,
  EXPIRED = 4001,
  SIGNER_REJECTED = 4002,
  AUTHORIZE_KEY_FAILED = 4003,
  SIGN_FAILED = 4004Dịch vụ VNPT-SmartCA
  VNPT, 2024 21
  6 Code mẫu tích hợp
  https://drive.google.com/drive/folders/15XKfk_PV4eiLpa4xvZlV2EnSEBBfIsV0?usp=sharing
