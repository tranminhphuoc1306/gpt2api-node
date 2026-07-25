const fs = require('fs');
const paths = [
  'public/admin/login.html',
  'public/admin/index.html',
  'public/admin/js/admin.js',
  'public/js/app.js'
];
const replacements = [
  // admin/login.html fixes
  ['第一次登录后请立即修改密码', 'Vui lòng thay đổi mật khẩu ngay sau lần đăng nhập đầu tiên'],
  ['网络错误: ', 'Lỗi mạng: '],
  ['请输入用户名', 'Vui lòng nhập tên đăng nhập'],
  ['请输入密码', 'Vui lòng nhập mật khẩu'],
  ['登录中...', 'Đang đăng nhập...'],
  ['Lỗi mạng: ', 'Lỗi mạng: '],
  ['Đăng nhập thất bại', 'Đăng nhập thất bại'],

  // admin/index.html fixes
  ['<!-- 图表区域 -->', '<!-- Khu vực biểu đồ -->'],
  ['请求次数', 'Số lần yêu cầu'],
  ['<!-- API 请求日志 -->', '<!-- Nhật ký yêu cầu API -->'],
  ['修改Mật khẩu', 'Thay đổi mật khẩu'],
  ['当前Mật khẩu', 'Mật khẩu hiện tại'],
  ['新Mật khẩu', 'Mật khẩu mới'],
  ['确认新Mật khẩu', 'Xác nhận mật khẩu mới'],
  ['Mật khẩu长度至少 6 位', 'Mật khẩu phải có ít nhất 6 ký tự'],
  ['账户Tên', 'Tên tài khoản'],
  ['粘贴 Nội dung JSON', 'Dán nội dung JSON'],
  ['账户Tên', 'Tên tài khoản'],
  ['例如：主账户', 'Ví dụ: tài khoản chính'],
  ['Tạo', 'Tạo'],
  ['Hủy bỏ', 'Hủy bỏ'],

  // admin/js/admin.js fixes
  ['// 检查认证Trạng thái', '// Kiểm tra trạng thái xác thực'],
  ['认证检查Thất bại:', 'Kiểm tra xác thực thất bại:'],
  ['加载统计数据Thất bại:', 'Tải dữ liệu thống kê thất bại:'],
  ['// 加载Hoạt động gần đây记录', '// Tải hoạt động gần đây'],
  ['加载Hoạt động gần đâyThất bại:', 'Tải hoạt động gần đây thất bại:'],
  ['// 计算Thời gian差', '// Tính khoảng thời gian'],
  ['// 显示对应页面', '// Hiển thị trang tương ứng'],
  ['// 切换Quản lý tài khoản标签', '// Chuyển tab quản lý tài khoản'],
  ['API 密钥 管理', 'Quản lý API Key'],
  ['Tokens 账户管理', 'Quản lý Tokens'],
  ['API 请求统计和分析', 'Thống kê và phân tích API'],
  ['系统配置和偏好设置', 'Cấu hình hệ thống và tùy chọn'],
  ['启用', 'Kích hoạt'],
  ['禁用', 'Vô hiệu hóa'],
  ['删除', 'Xóa'],
  ['TạoThất bại:', 'Tạo thất bại:'],
  ['删除Thất bại:', 'Xóa thất bại:'],
  ['// 更新账号总数显示', '// Cập nhật hiển thị tổng số tài khoản'],
  ['// 计算Hạn mức百分比', '// Tính phần trăm hạn mức'],
  ['// Hạn mức显示颜色', '// Xác định màu hạn mức'],
  ['// Hạn mức显示文本', '// Xác định văn bản hạn mức'],
  ['% 已用', '% đã sử dụng'],
  ['title="刷新Hạn mức"', 'title="Làm mới hạn mức"'],
  ['共 ${totalTokens} 个账号，第 ${currentPage}/${totalPages} 页', 'Tổng ${totalTokens} tài khoản, trang ${currentPage}/${totalPages}'],
  ['上一页', 'Trang trước'],
  ['下一页', 'Trang sau'],
  ['// 监听文件选择', '// Lắng nghe lựa chọn tệp'],
  ['// 如果只有一个文件，直接读取', '// Nếu chỉ một tệp, đọc trực tiếp'],
  ['alert(\'文件读取Thất bại: \' + e.target.error);', 'alert(\'Đọc tệp thất bại: \' + e.target.error);'],
  ['// 多个文件，合并成数组', '// Nhiều tệp, gộp thành mảng'],
  ['Bắt đầu đọc ${totalFiles} 个文件...', 'Bắt đầu đọc ${totalFiles} tệp...'],
  ['Tệp ${file.name}  chứa ${data.length}  token', 'Tệp ${file.name} chứa ${data.length} token'],
  ['Tệp ${file.name}  chứa 1  token', 'Tệp ${file.name} chứa 1 token'],
  ['Tệp ${file.name} 解析Thất bại:', 'Tệp ${file.name} phân tích thất bại:'],
  ['Tệp ${file.name} 读取Thất bại:', 'Tệp ${file.name} đọc thất bại:'],
  ['请先选择文件或粘贴 Nội dung JSON', 'Vui lòng chọn tệp hoặc dán nội dung JSON trước'],
  ['JSON 格式错误：未找到有效的 token 数据\n\n每 token 必须 chứa access_token 和 refresh_token 字段', 'Định dạng JSON sai: không tìm thấy dữ liệu token hợp lệ\n\nMỗi token phải chứa access_token và refresh_token'],
  ['JSON 解析Thất bại：', 'Phân tích JSON thất bại:'],
  ['请先Xem trước导入数据', 'Vui lòng xem trước dữ liệu nhập trước'],
  ['导入Thành công！\nThành công：${data.success || 0} 个\nThất bại：${data.failed || 0} 个', 'Nhập thành công!\nThành công: ${data.success || 0} tài khoản\nThất bại: ${data.failed || 0} tài khoản'],
  ['导入Thất bại:', 'Nhập thất bại:'],
  ['Token 添加Thành công！', 'Thêm Token thành công!'],
  ['添加Thất bại:', 'Thêm thất bại:'],
  ['删除Thất bại: ' , 'Xóa thất bại: '],
  ['额度已更新\n总Hạn mức: ', 'Hạn mức đã được cập nhật\nTổng hạn mức: '],
  ['\n已使用: ', '\nĐã sử dụng: '],
  ['\n剩余: ', '\nCòn lại: '],
  ['刷新Hạn mứcThất bại:', 'Làm mới hạn mức thất bại:'],
  ['确定要刷新所有账号的Hạn mức吗？这可能需要一些Thời gian。', 'Bạn có chắc muốn làm mới hạn mức tất cả tài khoản không? Việc này có thể mất một thời gian.'],
  ['批量刷新完成\nThành công: ${data.success || 0} 个\nThất bại: ${data.failed || 0} 个', 'Làm mới hàng loạt hoàn tất\nThành công: ${data.success || 0} tài khoản\nThất bại: ${data.failed || 0} tài khoản'],
  ['批量刷新Thất bại:', 'Làm mới hàng loạt thất bại:'],
  ['确定要Xóa mục đã chọn的 ${selectedTokens.size} 个账号吗？此Thao tác不可恢复！', 'Bạn có chắc muốn xóa ${selectedTokens.size} tài khoản đã chọn không? Hành động này không thể phục hồi!'],
  ['批量删除完成\nThành công: ${data.success || 0} 个\nThất bại: ${data.failed || 0} 个', 'Xóa hàng loạt hoàn tất\nThành công: ${data.success || 0} tài khoản\nThất bại: ${data.failed || 0} tài khoản'],
  ['批量删除Thất bại:', 'Xóa hàng loạt thất bại:'],
  ['// 加载图表', '// Tải biểu đồ'],
  ['// 加载Mô hình统计', '// Tải thống kê mô hình'],
  ['// 加载日志', '// Tải nhật ký'],
  ['// 更新按钮样式', '// Cập nhật kiểu nút'],
  ['// 重新加载数据', '// Tải lại dữ liệu'],
  ['label: \'请求数\'', 'label: \'Số yêu cầu\''],
  ['// Phân phối sử dụng mô hình饼图', '// Biểu đồ phân phối sử dụng mô hình'],
  ['加载图表Thất bại:', 'Tải biểu đồ thất bại:'],
  ['加载账号统计Thất bại:', 'Tải thống kê tài khoản thất bại:'],
  ['加载日志Thất bại:', 'Tải nhật ký thất bại:'],
  ['if (!confirm(\'确定要退出Đăng nhập吗？\')) return;', 'if (!confirm(\'Bạn có chắc muốn đăng xuất không?\')) return;'],
  ['alert(\'复制Thất bại，请手动复制\')', 'alert(\'Sao chép thất bại, vui lòng sao chép thủ công\')'],
  ['加载负载均衡策略Thất bại:', 'Tải chiến lược cân bằng tải thất bại:'],
  ['更新Thất bại: ', 'Cập nhật thất bại: '],
  ['// ==================== 修改密码 ====================', '// ==================== Thay đổi mật khẩu ===================='],
  ['alert(\'两次输入的新Mật khẩu不一致\')', 'alert(\'Mật khẩu mới nhập lại không khớp\')'],
  ['alert(\'Mật khẩu长度至少 6 位\')', 'alert(\'Mật khẩu phải có ít nhất 6 ký tự\')'],
  ['alert(\'Mật khẩu修改Thành công，请重新Đăng nhập\')', 'alert(\'Đổi mật khẩu thành công, vui lòng đăng nhập lại\')'],
  ['alert(\'修改Thất bại: \' + (data.error || \'Không xác định错误\'))', 'alert(\'Thay đổi thất bại: \' + (data.error || \'Không xác định lỗi\'))'],
  ['alert(\'修改Thất bại: \' + error.message)', 'alert(\'Thay đổi thất bại: \' + error.message)'],

  // app.js fixes
  ['// 加载服务Trạng thái', '// Tải trạng thái dịch vụ'],
  ['console.error(\'加载Trạng tháiThất bại:\', error);', 'console.error(\'Tải trạng thái thất bại:\', error);'],
  ['// 加载Mô hình列表', '// Tải danh sách mô hình'],
  ['console.error(\'加载Mô hìnhThất bại:\', error);', 'console.error(\'Tải danh sách mô hình thất bại:\', error);'],
  ['// 发送消息', '// Gửi tin nhắn'],
  ['// 添加用户消息', '// Thêm tin nhắn của người dùng'],
  ['// 显示加载Trạng thái', '// Hiển thị trạng thái tải'],
  ['// 移除加载消息', '// Loại bỏ tin nhắn tải'],
  ['// 处理流式响应', '// Xử lý phản hồi streaming'],
  ['// 忽略解析错误', '// Bỏ qua lỗi phân tích'],
  ['// 保存助手消息', '// Lưu tin nhắn trợ lý'],
  ['console.error(\'发送消息Thất bại:\', error);', 'console.error(\'Gửi tin nhắn thất bại:\', error);'],
  ['appendMessage(\'system\', \'错误: \' + error.message);', 'appendMessage(\'system\', \'Lỗi: \' + error.message);'],
  ['// 添加消息到聊天区域', '// Thêm tin nhắn vào khu vực chat'],
  ['// 首次添加消息时清除欢迎文本', '// Xóa văn bản chào mừng khi thêm tin nhắn đầu tiên'],
  ['// 更新消息内容', '// Cập nhật nội dung tin nhắn'],
  ['// 清空聊天', '// Xóa trò chuyện'],
  ['// HTML 转义', '// Escape HTML'],
  ['// 显示设置', '// Hiển thị cài đặt'],
  ['// 显示Trạng thái', '// Hiển thị trạng thái'],
  ['alert(\'Trạng thái已刷新！\')', 'alert(\'Trạng thái đã được làm mới!\')'],
  ['// 显示Mô hình列表', '// Hiển thị danh sách mô hình'],
  ['alert(\'可用Mô hình:\n\n\' + modelList);', 'alert(\'Các mô hình khả dụng:\n\n\' + modelList);'],
  ['alert(\'获取Mô hình列表Thất bại: \' + error.message);', 'alert(\'Lấy danh sách mô hình thất bại: \' + error.message);']
];

for (const filepath of paths) {
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;
  for (const [oldText, newText] of replacements) {
    if (content.includes(oldText)) {
      content = content.split(oldText).join(newText);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated', filepath);
  }
}

const re = /[\u4e00-\u9fff]+/g;
for (const filepath of paths) {
  const content = fs.readFileSync(filepath, 'utf8');
  const matches = new Set((content.match(re) || []));
  if (matches.size > 0) {
    console.log('Remaining Chinese in', filepath, ':', [...matches].sort().join('; '));
  }
}
