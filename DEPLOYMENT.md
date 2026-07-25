# GPT2API Node - Tài liệu triển khai

## 🎉 Chức năng hệ thống

### Chức năng chính
- ✅ Dịch vụ proxy ngược OpenAI Codex
- ✅ Giao diện quản trị Web đầy đủ
- ✅ Quản lý nhiều tài khoản và thao tác hàng loạt
- ✅ Cơ chế tự động làm mới Token
- ✅ Cân bằng tải (round-robin / random / least-used)
- ✅ Quản lý và xác thực API Key
- ✅ Thống kê yêu cầu và phân tích dữ liệu
- ✅ Ghi nhận hoạt động theo thời gian thực

### Chức năng quản trị

#### 1. Bảng điều khiển
- Tổng quan hệ thống và thống kê thời gian thực
- Số lượng API Keys
- Số lượng tài khoản Token
- Số yêu cầu hôm nay và tỷ lệ thành công
- Ghi nhận hoạt động gần đây (API request, thêm tài khoản...)

#### 2. Quản lý API Keys
- Tạo và quản lý API Keys
- Xem thống kê sử dụng
- Kích hoạt / vô hiệu hóa API Key
- Xóa API Key

#### 3. Quản lý tài khoản
- **Nhập Token hàng loạt** (hỗ trợ JSON và nhiều tệp)
- **Xóa tài khoản hàng loạt** (hỗ trợ chọn nhiều)
- Thêm tài khoản thủ công
- Xem hạn mức và tình trạng sử dụng
- Làm mới hạn mức tài khoản (từng cái hoặc tất cả)
- Cấu hình chiến lược cân bằng tải
- Hiển thị tổng số tài khoản theo thời gian thực

#### 4. Phân tích dữ liệu
- Biểu đồ xu hướng yêu cầu (dựa trên dữ liệu thực tế)
- Phân bố sử dụng mô hình
- Thống kê chi tiết tài khoản (có thanh cuộn)
- Nhật ký yêu cầu API (có thanh cuộn)
- Hỗ trợ lọc theo khoảng thời gian (24 giờ / 7 ngày / 30 ngày)

#### 5. Cài đặt hệ thống
- Thay đổi mật khẩu quản trị
- Cấu hình chiến lược cân bằng tải
- Liên kết dự án GitHub

## 🚀 Triển khai nhanh

### 1. Yêu cầu môi trường
- Node.js 16+
- npm hoặc yarn

### 2. Cài đặt

```bash
# Clone dự án
git clone https://github.com/lulistart/gpt2api-node.git
cd gpt2api-node

# Cài đặt phụ thuộc
npm install

# Khởi tạo cơ sở dữ liệu
npm run init-db

# Khởi động dịch vụ
npm start
```

### 3. Truy cập quản trị

Mở trình duyệt: `http://localhost:3000/admin`

Tài khoản quản trị mặc định:
- Tên đăng nhập: `admin`
- Mật khẩu: `admin123`

**Quan trọng**: đổi mật khẩu ngay lần đầu đăng nhập!

## 📁 Cấu trúc dự án

```
gpt2api-node/
├── src/
│   ├── config/
│   │   └── database.js          # Cấu hình và khởi tạo database
│   ├── middleware/
│   │   └── auth.js              # Middleware xác thực
│   ├── models/
│   │   └── index.js             # Mô hình dữ liệu (User, ApiKey, Token, ApiLog)
│   ├── routes/
│   │   ├── auth.js              # Route xác thực (đăng nhập, đăng xuất, đổi mật khẩu)
│   │   ├── apiKeys.js           # Route quản lý API Keys
│   │   ├── tokens.js            # Route quản lý Tokens (bao gồm xóa hàng loạt)
│   │   ├── stats.js             # Route thống kê (bao gồm hoạt động gần đây)
│   │   └── settings.js          # Route cài đặt
│   ├── scripts/
│   │   └── initDatabase.js      # Script khởi tạo database
│   ├── index.js                 # Tệp khởi động chính
│   ├── tokenManager.js          # Module quản lý Token
│   └── proxyHandler.js          # Module xử lý proxy
├── public/
│   └── admin/
│       ├── login.html           # Trang đăng nhập
│       ├── index.html           # Trang quản trị
│       └── js/
│           └── admin.js         # Script quản trị
├── database/
│   └── app.db                   # SQLite database
├── models.json
├── package.json
└── README.md
```

## 🔧 Cấu hình

### Biến môi trường

Tạo file `.env`:

```env
PORT=3000
SESSION_SECRET=your-random-secret-key-change-in-production
LOAD_BALANCE_STRATEGY=round-robin
MODELS_FILE=./models.json
DATABASE_PATH=./database/app.db
```

### Chiến lược cân bằng tải

Hỗ trợ ba chiến lược:

1. **round-robin**: luân phiên sử dụng từng tài khoản
2. **random**: chọn ngẫu nhiên tài khoản khả dụng
3. **least-used**: chọn tài khoản có ít yêu cầu nhất

Có thể cấu hình bằng biến môi trường hoặc trong giao diện quản trị.

## 📊 Cấu trúc cơ sở dữ liệu

### Bảng users
- Lưu thông tin tài khoản quản trị
- Các trường: id, username, password_hash, created_at

### Bảng api_keys
- Quản lý API Key
- Các trường: id, name, key, is_active, usage_count, last_used_at, created_at

### Bảng tokens
- Lưu thông tin tài khoản OpenAI Token
- Các trường: id, name, email, account_id, access_token, refresh_token, id_token, expired_at, last_refresh_at, is_active, total_requests, success_requests, failed_requests, quota_total, quota_used, quota_remaining, created_at

### Bảng api_logs
- Nhật ký yêu cầu API
- Các trường: id, api_key_id, token_id, model, endpoint, status_code, error_message, created_at

## 🔐 Gợi ý bảo mật

### Cài đặt cho môi trường sản xuất

1. **Đổi mật khẩu mặc định**
   - Đổi ngay lần đầu đăng nhập
   - Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, chữ hoa chữ thường, số, ký tự đặc biệt)

2. **Thiết lập biến môi trường**
   ```bash
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

3. **Kích hoạt HTTPS**
   - Sử dụng Nginx hoặc Caddy làm reverse proxy
   - Cấu hình chứng chỉ SSL
   - Thiết lập `cookie.secure = true`

4. **Cấu hình tường lửa**
   - Chỉ mở cổng cần thiết
   - Giới hạn truy cập quản trị theo IP nếu cần

5. **Sao lưu định kỳ**
   - Sao lưu file `database/app.db`
   - Sao lưu cấu hình biến môi trường

### Ví dụ Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🎯 Hướng dẫn sử dụng

### 1. Tạo API Key

1. Đăng nhập quản trị
2. Vào trang **API Keys**
3. Nhấn **Tạo API Key**
4. Nhập tên (không bắt buộc)
5. Sao chép API Key vừa tạo

### 2. Nhập tài khoản Token

#### Nhập hàng loạt JSON

1. Chuẩn bị tệp JSON:
```json
[
  {
    "access_token": "your_access_token",
    "refresh_token": "your_refresh_token",
    "id_token": "your_id_token",
    "account_id": "account_id",
    "email": "email@example.com",
    "name": "Tên tài khoản"
  }
]
```

2. Vào trang **Quản lý tài khoản**
3. Nhấn **Nhập JSON**
4. Chọn tệp hoặc dán nội dung JSON
5. Xem trước và xác nhận

#### Thêm thủ công

1. Vào trang **Quản lý tài khoản**
2. Nhấn **Thêm thủ công**
3. Điền Access Token và Refresh Token
4. Nhấn **Thêm**

### 3. Xóa tài khoản hàng loạt

1. Vào trang **Quản lý tài khoản**
2. Chọn tài khoản cần xóa
3. Nhấn **Xóa đã chọn**
4. Xác nhận

### 4. Sử dụng API

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.3-codex",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## 🐛 Khắc phục sự cố

### Không truy cập được quản trị

1. Kiểm tra dịch vụ đã chạy: `npm start`
2. Kiểm tra cổng: `netstat -ano | findstr :3000`
3. Kiểm tra tường lửa

### Khởi tạo database thất bại

```bash
rm database/app.db
npm run init-db
```

### Token làm mới thất bại

1. Kiểm tra mạng
2. Xác nhận `refresh_token` còn hiệu lực
3. Nhập lại token mới

### Yêu cầu API thất bại

1. Kiểm tra API Key
2. Đảm bảo có tài khoản Token khả dụng
3. Xem log yêu cầu
4. Kiểm tra tài khoản có bị vô hiệu hóa

### Biểu đồ xu hướng hiển thị sai

- Dữ liệu biểu đồ dựa trên bảng `api_logs`
- Nếu không có dữ liệu, biểu đồ có thể trống
- Gửi vài yêu cầu API rồi refresh trang

## 📝 Bảo trì

1. **Sao lưu database định kỳ**
   ```bash
   cp database/app.db database.app.db.backup.$(date +%Y%m%d)
   ```

2. **Theo dõi log**
   - Xem đầu ra terminal
   - Kiểm tra nhật ký yêu cầu

3. **Cập nhật phụ thuộc**
   ```bash
   npm update
   ```

4. **Dọn dẹp log cũ**
   - Xóa các bản ghi cũ trong bảng `api_logs`

## 🔄 Cập nhật

### v2.0.0 (2026-02-17)
- ✅ Thêm chức năng xóa tài khoản hàng loạt
- ✅ Thêm ghi nhận hoạt động gần đây trên bảng điều khiển
- ✅ Thêm liên kết GitHub
- ✅ Chuyển hướng root về màn hình quản trị
- ✅ Sửa danh sách mô hình (loại gpt-5.3-codex-spark không tồn tại)
- ✅ Tối ưu đầu ra log terminal
- ✅ Hiển thị tổng số tài khoản trên trang quản lý
- ✅ Thêm thanh cuộn cho thống kê chi tiết và nhật ký yêu cầu
- ✅ Sửa biểu đồ xu hướng yêu cầu để sử dụng dữ liệu thực tế

### v1.0.0
- ✅ Hệ thống quản trị cơ bản
- ✅ Quản lý API Keys
- ✅ Quản lý Tokens
- ✅ Thống kê dữ liệu

## 📞 Hỗ trợ

- GitHub: https://github.com/lulistart/gpt2api-node
- Issues: https://github.com/lulistart/gpt2api-node/issues

## 📄 Giấy phép

MIT License
