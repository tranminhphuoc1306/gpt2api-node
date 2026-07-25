# GPT2API Node

Dựa trên Node.js + Express, dịch vụ proxy ngược OpenAI Codex này hỗ trợ quản lý nhiều tài khoản, tự động làm mới token, cân bằng tải và cung cấp API tương thích OpenAI cùng giao diện quản trị đầy đủ.

## Giao diện xem trước

<table>
  <tr>
    <td width="50%">
      <img src="screenshots/管理员登录.png" alt="Đăng nhập quản trị" />
      <p align="center">Đăng nhập quản trị</p>
    </td>
    <td width="50%">
      <img src="screenshots/仪表盘.png" alt="Bảng điều khiển" />
      <p align="center">Bảng điều khiển</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/API keys.png" alt="Quản lý API Keys" />
      <p align="center">Quản lý API Keys</p>
    </td>
    <td width="50%">
      <img src="screenshots/账号管理.png" alt="Quản lý tài khoản" />
      <p align="center">Quản lý tài khoản</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/数据分析.png" alt="Phân tích dữ liệu" />
      <p align="center">Phân tích dữ liệu</p>
    </td>
    <td width="50%">
      <img src="screenshots/系统设置.png" alt="Cài đặt hệ thống" />
      <p align="center">Cài đặt hệ thống</p>
    </td>
  </tr>
</table>

## Tính năng

- ✅ Proxy ngược OpenAI Codex
- ✅ Giao diện quản trị Web đầy đủ
- ✅ Quản lý nhiều tài khoản và nhập hàng loạt
- ✅ Cơ chế tự động làm mới Token
- ✅ Cân bằng tải (round-robin / random / least-used)
- ✅ Quản lý và xác thực API Key
- ✅ Thống kê yêu cầu và phân tích dữ liệu
- ✅ Hỗ trợ phản hồi luồng và không luồng
- ✅ Giao diện tương thích OpenAI API
- ✅ Xóa tài khoản hàng loạt
- ✅ Ghi nhận hoạt động theo thời gian thực

## Bắt đầu nhanh

### Cách 1: Triển khai Docker (khuyến nghị)

Sử dụng Docker Compose để triển khai nhanh:

```bash
# Clone dự án
git clone https://github.com/lulistart/gpt2api-node.git
cd gpt2api-node

# Khởi động dịch vụ
docker-compose up -d

# Xem log
docker-compose logs -f
```

Dịch vụ sẽ chạy tại `http://localhost:3000`.

### Cách 2: Triển khai cục bộ

#### 1. Cài đặt phụ thuộc

```bash
cd gpt2api-node
npm install
```

#### 2. Khởi tạo cơ sở dữ liệu

```bash
npm run init-db
```

Tài khoản quản trị mặc định:
- Tên đăng nhập: `admin`
- Mật khẩu: `admin123`

#### 3. Khởi động dịch vụ

```bash
npm start
```

Chế độ phát triển (tự động khởi động lại):

```bash
npm run dev
```

#### 4. Truy cập quản trị

Mở trình duyệt tại: `http://localhost:3000/admin`

Sau khi đăng nhập bằng tài khoản mặc định, hãy đổi mật khẩu ngay lập tức.

## Chức năng quản trị

### Bảng điều khiển
- Tổng quan hệ thống và thống kê thời gian thực
- Số lượng API Keys
- Số lượng tài khoản Token
- Số lượng yêu cầu hôm nay và tỷ lệ thành công
- Ghi nhận hoạt động gần đây

### Quản lý API Keys
- Tạo và quản lý API Keys
- Xem thống kê sử dụng
- Kích hoạt/vô hiệu hóa API Key

### Quản lý tài khoản
- Nhập Token hàng loạt (hỗ trợ tệp JSON)
- Thêm tài khoản thủ công
- Xóa tài khoản hàng loạt
- Xem hạn mức và tình trạng sử dụng của tài khoản
- Làm mới hạn mức tài khoản
- Cấu hình chiến lược cân bằng tải

### Phân tích dữ liệu
- Biểu đồ xu hướng yêu cầu
- Phân bố sử dụng mô hình
- Thống kê chi tiết tài khoản
- Nhật ký yêu cầu API

### Cài đặt hệ thống
- Thay đổi mật khẩu quản trị
- Cấu hình chiến lược cân bằng tải

## Chiến lược cân bằng tải

Hỗ trợ ba chiến lược:

1. **round-robin**: sử dụng lần lượt mỗi tài khoản
2. **random**: chọn ngẫu nhiên một tài khoản khả dụng
3. **least-used**: chọn tài khoản có ít yêu cầu nhất

Có thể cấu hình trên trang quản trị hoặc bằng biến môi trường.

## API

### Endpoint chat completions

**Đường dẫn**: `POST /v1/chat/completions`

**Header yêu cầu**:
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Ví dụ yêu cầu**:

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.3-codex",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": false
  }'
```

**Yêu cầu streaming**:

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.3-codex",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
```

### Danh sách mô hình

**Đường dẫn**: `GET /v1/models`

```bash
curl http://localhost:3000/v1/models
```

### Kiểm tra sức khỏe

**Đường dẫn**: `GET /health`

```bash
curl http://localhost:3000/health
```

## Mô hình hỗ trợ

- `gpt-5.3-codex` - GPT 5.3 Codex (mới nhất)
- `gpt-5.2` - GPT 5.2
- `gpt-5.2-codex` - GPT 5.2 Codex
- `gpt-5.1` - GPT 5.1
- `gpt-5.1-codex` - GPT 5.1 Codex
- `gpt-5.1-codex-mini` - GPT 5.1 Codex Mini (nhanh hơn, rẻ hơn)
- `gpt-5.1-codex-max` - GPT 5.1 Codex Max
- `gpt-5` - GPT 5
- `gpt-5-codex` - GPT 5 Codex
- `gpt-5-codex-mini` - GPT 5 Codex Mini

## Sử dụng Cherry Studio

Cherry Studio là ứng dụng desktop hỗ trợ nhiều dịch vụ AI. Cấu hình như sau:

### 1. Tạo API Key

1. Truy cập quản trị: `http://localhost:3000/admin`
2. Vào trang **API Keys**
3. Nhấn **Tạo API Key**
4. Sao chép API Key mới tạo (chỉ hiển thị một lần)

### 2. Cấu hình Cherry Studio

1. Mở Cherry Studio
2. Vào **Cài đặt** → **Nhà cung cấp mô hình**
3. Thêm nhà cung cấp **OpenAI tương thích** mới
4. Điền cấu hình:
   - **Tên**: GPT2API Node (hoặc tên tùy chỉnh)
   - **Địa chỉ API**: `http://localhost:3000/v1`
   - **API Key**: dán API Key
   - **Mô hình**: chọn hoặc nhập tên mô hình, ví dụ `gpt-5.3-codex`

### 3. Bắt đầu sử dụng

Sau khi đăng ký cấu hình, chọn nhà cung cấp và mô hình rồi bắt đầu chat.

## Ví dụ sử dụng

### Python

```python
import openai

client = openai.OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="gpt-5.3-codex",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### JavaScript/Node.js

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3000/v1',
  apiKey: 'YOUR_API_KEY'
});

const response = await client.chat.completions.create({
  model: 'gpt-5.3-codex',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(response.choices[0].message.content);
```

## Quản lý Token

### Nhập hàng loạt

1. Chuẩn bị tệp JSON với định dạng:

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

2. Vào trang quản lý tài khoản và nhấn **Nhập JSON**
3. Chọn tệp hoặc dán nội dung JSON
4. Xem trước và xác nhận nhập

### Thêm thủ công

Trong trang quản lý tài khoản, nhấn **Thêm thủ công** rồi điền thông tin cần thiết.

### Tự động làm mới

Dịch vụ sẽ tự động kiểm tra token hết hạn và làm mới khi cần.

## Cấu hình biến môi trường

Tạo file `.env`:

```env
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production
LOAD_BALANCE_STRATEGY=round-robin
MODELS_FILE=./models.json
```

## Cấu trúc dự án

```
gpt2api-node/
├── src/
│   ├── index.js              # Tệp server chính
│   ├── tokenManager.js       # Module quản lý Token
│   ├── proxyHandler.js       # Module xử lý proxy
│   ├── config/
│   │   └── database.js       # Cấu hình database
│   ├── models/
│   │   └── index.js          # Mô hình dữ liệu
│   ├── routes/
│   │   ├── auth.js           # Route xác thực
│   │   ├── apiKeys.js        # Route API Keys
│   │   ├── tokens.js         # Route Tokens
│   │   ├── stats.js          # Route thống kê
│   │   └── settings.js       # Route cài đặt
│   ├── middleware/
│   │   └── auth.js           # Middleware xác thực
│   └── scripts/
│       └── initDatabase.js   # Script khởi tạo DB
├── public/
│   └── admin/
│       ├── login.html
│       ├── index.html
│       └── js/
│           └── admin.js
├── database/
│   └── app.db                # SQLite database
├── models.json
├── package.json
└── README.md
```

## Lưu ý

1. **Bảo mật**:
   - Đổi mật khẩu quản trị ngay lần đầu vào hệ thống
   - Giữ API Keys an toàn
   - Sử dụng HTTPS trong môi trường sản xuất

2. **Yêu cầu mạng**: Cần truy cập `chatgpt.com` và `auth.openai.com`

3. **Hiệu lực token**: Token tự động làm mới, nhưng nếu `refresh_token` hết hạn thì phải nhập token mới.

4. **Giới hạn đồng thời**: Chú ý hạn mức yêu cầu của tài khoản OpenAI.

## Khắc phục sự cố

### Không truy cập được quản trị

Đảm bảo dịch vụ đang chạy và truy cập `http://localhost:3000/admin`

### Khởi tạo database thất bại

Xóa file `database/app.db` và chạy lại `npm run init-db`

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

## Bảo trì

1. **Sao lưu database thường xuyên**
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

## Nhật ký cập nhật

### v2.0.0 (2026-02-17)
- ✅ Thêm chức năng xóa tài khoản hàng loạt
- ✅ Thêm ghi nhận hoạt động gần đây trên bảng điều khiển
- ✅ Thêm liên kết dự án GitHub
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

## Hỗ trợ

- GitHub: https://github.com/lulistart/gpt2api-node
- Issues: https://github.com/lulistart/gpt2api-node/issues

## Giấy phép

MIT License
