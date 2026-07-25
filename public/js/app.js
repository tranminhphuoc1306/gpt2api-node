// Biến toàn cục
let messages = [];
let currentModel = 'gpt-5.3-codex';

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', async () => {
  await loadStatus();
  await loadModels();
});

// Tải trạng thái dịch vụ
async function loadStatus() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    
    if (data.status === 'ok') {
      document.getElementById('serviceStatus').textContent = 'Đang chạy';
      document.getElementById('accountEmail').textContent = data.token.email || data.token.account_id || 'Không xác định';
      
      if (data.token.expired) {
        const expireDate = new Date(data.token.expired);
        document.getElementById('tokenExpire').textContent = expireDate.toLocaleString('zh-CN');
      }
    }
  } catch (error) {
    console.error('Tải trạng thái thất bại:', error);
    document.getElementById('serviceStatus').textContent = 'Ngoại tuyến';
    document.getElementById('serviceStatus').classList.remove('text-primary');
    document.getElementById('serviceStatus').classList.add('text-error');
  }
}

// Tải danh sách mô hình
async function loadModels() {
  try {
    const response = await fetch('/v1/models');
    const data = await response.json();
    
    const select = document.getElementById('modelSelect');
    select.innerHTML = '';
    
    data.data.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.id;
      select.appendChild(option);
    });
    
    if (data.data.length > 0) {
      currentModel = data.data[0].id;
      select.value = currentModel;
    }
    
    select.addEventListener('change', (e) => {
      currentModel = e.target.value;
    });
  } catch (error) {
    console.error('Tải danh sách mô hình thất bại:', error);
  }
}

// Gửi tin nhắn
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Thêm tin nhắn của người dùng
  messages.push({ role: 'user', content: message });
  appendMessage('user', message);
  input.value = '';
  
  // Hiển thị trạng thái tải
  const loadingId = appendMessage('assistant', 'Đang suy nghĩ...', true);
  
  try {
    const response = await fetch('/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: currentModel,
        messages: messages,
        stream: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Loại bỏ tin nhắn tải
    document.getElementById(loadingId).remove();
    
    // Xử lý phản hồi streaming
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let messageId = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content;
            
            if (content) {
              assistantMessage += content;
              
              if (!messageId) {
                messageId = appendMessage('assistant', assistantMessage);
              } else {
                updateMessage(messageId, assistantMessage);
              }
            }
          } catch (e) {
            // Bỏ qua lỗi phân tích
          }
        }
      }
    }
    
    // Lưu tin nhắn trợ lý
    if (assistantMessage) {
      messages.push({ role: 'assistant', content: assistantMessage });
    }
    
  } catch (error) {
    console.error('Gửi tin nhắn thất bại:', error);
    document.getElementById(loadingId).remove();
    appendMessage('system', 'Lỗi: ' + error.message);
  }
}

// Thêm tin nhắn vào khu vực chat
function appendMessage(role, content, isLoading = false) {
  const container = document.getElementById('chatMessages');
  
  // Xóa văn bản chào mừng khi thêm tin nhắn đầu tiên
  if (container.children.length === 1 && container.children[0].classList.contains('text-center')) {
    container.innerHTML = '';
  }
  
  const messageId = 'msg-' + Date.now() + '-' + Math.random();
  const messageDiv = document.createElement('div');
  messageDiv.id = messageId;
  messageDiv.className = 'chat chat-message ' + (role === 'user' ? 'chat-end' : 'chat-start');
  
  let avatarClass = 'bg-primary';
  let avatarText = 'U';
  
  if (role === 'assistant') {
    avatarClass = 'bg-secondary';
    avatarText = 'AI';
  } else if (role === 'system') {
    avatarClass = 'bg-error';
    avatarText = '!';
  }
  
  messageDiv.innerHTML = `
    <div class="chat-image avatar">
      <div class="w-10 rounded-full ${avatarClass} flex items-center justify-center text-white font-bold">
        ${avatarText}
      </div>
    </div>
    <div class="chat-bubble ${role === 'user' ? 'chat-bubble-primary' : role === 'system' ? 'chat-bubble-error' : ''}">
      ${isLoading ? '<span class="loading loading-dots loading-sm"></span>' : escapeHtml(content)}
    </div>
  `;
  
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
  
  return messageId;
}

// Cập nhật nội dung tin nhắn
function updateMessage(messageId, content) {
  const messageDiv = document.getElementById(messageId);
  if (messageDiv) {
    const bubble = messageDiv.querySelector('.chat-bubble');
    bubble.textContent = content;
  }
  
  const container = document.getElementById('chatMessages');
  container.scrollTop = container.scrollHeight;
}

// Xóa trò chuyện
function clearChat() {
  messages = [];
  const container = document.getElementById('chatMessages');
  container.innerHTML = '<div class="text-center text-base-content/50 py-8">Bắt đầu trò chuyện!</div>';
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Hiển thị cài đặt
function showSettings() {
  alert('Chức năng cài đặt đang phát triển...');
}

// Hiển thị trạng thái
async function showStatus() {
  await loadStatus();
  alert('Trạng thái đã được làm mới!');
}

// Hiển thị danh sách mô hình
async function showModels() {
  try {
    const response = await fetch('/v1/models');
    const data = await response.json();
    
    const modelList = data.data.map(m => m.id).join('\n');
    alert('Các mô hình khả dụng:\n\n' + modelList);
  } catch (error) {
    alert('Lấy danh sách mô hình thất bại: ' + error.message);
  }
}
