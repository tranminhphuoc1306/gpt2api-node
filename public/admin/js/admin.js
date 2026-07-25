// Biến toàn cục
let currentPage = 'dashboard';

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadStats();
  await loadApiKeys();
  await loadRecentActivity();
});

// Kiểm tra trạng thái xác thực
async function checkAuth() {
  try {
    const response = await fetch('/admin/auth/check');
    if (!response.ok) {
      window.location.href = '/admin/login.html';
    }
  } catch (error) {
    console.error('Kiểm tra xác thực thất bại:', error);
    window.location.href = '/admin/login.html';
  }
}

// Tải dữ liệu thống kê
async function loadStats() {
  try {
    const response = await fetch('/admin/stats');
    const data = await response.json();
    
    document.getElementById('apiKeysCount').textContent = data.apiKeys || 0;
    document.getElementById('tokensCount').textContent = data.tokens || 0;
    document.getElementById('todayRequests').textContent = data.todayRequests || 0;
    document.getElementById('successRate').textContent = (data.successRate || 100) + '%';
  } catch (error) {
    console.error('Tải dữ liệu thống kê thất bại:', error);
  }
}

// Tải hoạt động gần đây
async function loadRecentActivity() {
  try {
    const response = await fetch('/admin/stats/recent-activity?limit=10');
    const activities = await response.json();
    
    const container = document.getElementById('recentActivity');
    
    if (activities.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-info-circle mr-2"></i>Chưa có hoạt động</div>';
      return;
    }
    
    container.innerHTML = activities.map(activity => {
      const timeAgo = getTimeAgo(activity.time);
      return `
        <div class="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <i class="fas ${activity.icon} ${activity.color} text-sm"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">${escapeHtml(activity.title)}</p>
            <p class="text-xs text-gray-500 mt-0.5">${escapeHtml(activity.description)}</p>
          </div>
          <div class="flex-shrink-0">
            <span class="text-xs text-gray-400">${timeAgo}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Tải hoạt động gần đây thất bại:', error);
  }
}

// Tính khoảng thời gian
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Không xác định';
  
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 1000); // giây
  
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)}  phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}  giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}  ngày trước`;
  return time.toLocaleDateString('zh-CN');
}

// Chuyển trang
function switchPage(event, page) {
  event.preventDefault();
  currentPage = page;
  
  // Cập nhật kiểu điều hướng
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active', 'text-white');
    item.classList.add('text-gray-700');
  });
  event.currentTarget.classList.add('active');
  event.currentTarget.classList.remove('text-gray-700');
  
  // Ẩn tất cả trang
  document.getElementById('dashboardPage').classList.add('hidden');
  document.getElementById('apikeysPage').classList.add('hidden');
  document.getElementById('accountsPage').classList.add('hidden');
  document.getElementById('analyticsPage').classList.add('hidden');
  document.getElementById('settingsPage').classList.add('hidden');
  
  // Cập nhật tiêu đề trang
  const titles = {
    dashboard: { title: 'Bảng điều khiển', desc: 'Tổng quan hệ thống và dữ liệu thời gian thực' },
    apikeys: { title: 'API Keys', desc: 'Quản lý API Key' },
    accounts: { title: 'Quản lý tài khoản', desc: 'Quản lý Tokens' },
    analytics: { title: 'Phân tích dữ liệu', desc: 'Thống kê và phân tích API' },
    settings: { title: 'Cài đặt hệ thống', desc: 'Cấu hình hệ thống và tùy chọn' }
  };
  
  document.getElementById('pageTitle').textContent = titles[page].title;
  document.getElementById('pageDesc').textContent = titles[page].desc;
  
  // Hiển thị trang tương ứng
  if (page === 'dashboard') {
    document.getElementById('dashboardPage').classList.remove('hidden');
  } else if (page === 'apikeys') {
    document.getElementById('apikeysPage').classList.remove('hidden');
    loadApiKeys();
  } else if (page === 'accounts') {
    document.getElementById('accountsPage').classList.remove('hidden');
    loadTokens();
    loadLoadBalanceStrategy();
  } else if (page === 'analytics') {
    document.getElementById('analyticsPage').classList.remove('hidden');
    loadAnalytics();
  } else if (page === 'settings') {
    document.getElementById('settingsPage').classList.remove('hidden');
  }
}

// Chuyển tab quản lý tài khoản
// Đã loại bỏ, không cần nữa

// ==================== Quản lý API Keys ====================

async function loadApiKeys() {
  try {
    const response = await fetch('/admin/api-keys');
    const data = await response.json();
    
    const tbody = document.getElementById('apiKeysTable');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Chưa có API Key</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(key => `
      <tr class="border-b border-gray-100 hover:bg-gray-50">
        <td class="py-4 px-4 text-sm text-gray-900">${escapeHtml(key.name || '-')}</td>
        <td class="py-4 px-4">
          <code class="text-xs bg-gray-100 px-2 py-1 rounded">${escapeHtml(key.key.substring(0, 20))}...</code>
          <button onclick="copyToClipboard('${escapeHtml(key.key)}')" class="ml-2 text-gray-400 hover:text-gray-600">
            <i class="fas fa-copy"></i>
          </button>
        </td>
        <td class="py-4 px-4 text-sm text-gray-600">${key.usage_count || 0}</td>
        <td class="py-4 px-4 text-sm text-gray-600">${key.last_used_at ? new Date(key.last_used_at).toLocaleString('zh-CN') : '-'}</td>
        <td class="py-4 px-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${key.is_active ? 'Kích hoạt' : 'Vô hiệu hóa'}
          </span>
        </td>
        <td class="py-4 px-4">
          <button onclick="toggleApiKey(${key.id}, ${key.is_active})" class="text-sm text-gray-600 hover:text-gray-900 mr-3">
            ${key.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </button>
          <button onclick="deleteApiKey(${key.id})" class="text-sm text-red-600 hover:text-red-800">
            Xóa
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Tải API Keys thất bại:', error);
  }
}

function showCreateApiKeyModal() {
  document.getElementById('createApiKeyModal').classList.remove('hidden');
}

async function handleCreateApiKey(event) {
  event.preventDefault();
  
  const name = document.getElementById('apiKeyName').value;
  
  try {
    const response = await fetch('/admin/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('createApiKeyModal').classList.add('hidden');
      document.getElementById('apiKeyName').value = '';
      alert('API Key TạoThành công！\n\n' + data.key + '\n\nVui lòng lưu kỹ, Key này sẽ không hiển thị lại!');
      await loadApiKeys();
      await loadStats();
    } else {
      alert('Tạo thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Tạo thất bại: ' + error.message);
  }
}

async function toggleApiKey(id, currentStatus) {
  try {
    const response = await fetch(`/admin/api-keys/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    
    if (response.ok) {
      await loadApiKeys();
      await loadStats();
    }
  } catch (error) {
    alert('Thao tácThất bại: ' + error.message);
  }
}

async function deleteApiKey(id) {
  if (!confirm('Bạn có chắc muốn xóa API Key này không?')) return;
  
  try {
    const response = await fetch(`/admin/api-keys/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await loadApiKeys();
      await loadStats();
    }
  } catch (error) {
    alert('XóaThất bại: ' + error.message);
  }
}

// ==================== Quản lý Tokens ====================

let currentTokenPage = 1;
let tokenPageSize = 20;
let totalTokens = 0;
let selectedTokens = new Set();

async function loadTokens(page = 1) {
  try {
    currentTokenPage = page;
    selectedTokens.clear();
    updateBatchDeleteButton();
    
    const response = await fetch(`/admin/tokens?page=${page}&limit=${tokenPageSize}`);
    const result = await response.json();
    
    const data = result.data || [];
    const pagination = result.pagination || {};
    totalTokens = pagination.total || 0;
    
    // Cập nhật hiển thị tổng số tài khoản
    const totalCountEl = document.getElementById('totalTokensCount');
    if (totalCountEl) {
      totalCountEl.textContent = totalTokens;
    }
    
    const tbody = document.getElementById('tokensTable');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-gray-500">Chưa có Token</td></tr>';
      updateTokenPagination(0, 0);
      return;
    }
    
    tbody.innerHTML = data.map(token => {
      // Tính phần trăm hạn mức
      const quotaTotal = token.quota_total || 0;
      const quotaUsed = token.quota_used || 0;
      const quotaRemaining = token.quota_remaining || 0;
      const quotaPercent = quotaTotal > 0 ? Math.round((quotaUsed / quotaTotal) * 100) : 0;
      
      // Xác định màu hạn mức
      let quotaColor = 'text-green-600';
      if (quotaPercent > 80) quotaColor = 'text-red-600';
      else if (quotaPercent > 50) quotaColor = 'text-yellow-600';
      
      // Xác định văn bản hạn mức
      let quotaText = '-';
      if (quotaTotal > 0) {
        quotaText = `<div class="text-xs ${quotaColor}">
          <div class="font-medium">${quotaRemaining.toLocaleString()} / ${quotaTotal.toLocaleString()}</div>
          <div class="text-gray-500">${quotaPercent}% đã sử dụng</div>
        </div>`;
      }
      
      return `
      <tr class="border-b border-gray-100 hover:bg-gray-50">
        <td class="py-4 px-4">
          <input type="checkbox" class="token-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" value="${token.id}" onchange="toggleTokenSelection(${token.id})" />
        </td>
        <td class="py-4 px-4 text-sm text-gray-900">${escapeHtml(token.name || '-')}</td>
        <td class="py-4 px-4">${quotaText}</td>
        <td class="py-4 px-4 text-sm font-medium text-gray-900">${token.total_requests || 0}</td>
        <td class="py-4 px-4 text-sm text-green-600">${token.success_requests || 0}</td>
        <td class="py-4 px-4 text-sm text-red-600">${token.failed_requests || 0}</td>
        <td class="py-4 px-4 text-sm text-gray-600">${token.expired_at ? new Date(token.expired_at).toLocaleString('zh-CN') : '-'}</td>
        <td class="py-4 px-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${token.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${token.is_active ? 'Kích hoạt' : 'Vô hiệu hóa'}
          </span>
        </td>
        <td class="py-4 px-4">
          <button onclick="refreshTokenQuota(${token.id})" class="text-sm text-blue-600 hover:text-blue-800 mr-2" title="Làm mới hạn mức">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button onclick="toggleToken(${token.id}, ${token.is_active})" class="text-sm text-gray-600 hover:text-gray-900 mr-2">
            ${token.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </button>
          <button onclick="deleteToken(${token.id})" class="text-sm text-red-600 hover:text-red-800">
            Xóa
          </button>
        </td>
      </tr>
      `;
    }).join('');
    
    updateTokenPagination(pagination.page, pagination.totalPages);
  } catch (error) {
    console.error('Tải Tokens thất bại:', error);
  }
}

function updateTokenPagination(currentPage, totalPages) {
  const paginationEl = document.getElementById('tokenPagination');
  if (!paginationEl) return;
  
  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }
  
  let html = '<div class="flex items-center justify-between mt-4">';
  html += `<div class="text-sm text-gray-600">Tổng ${totalTokens} tài khoản, trang ${currentPage}/${totalPages}</div>`;
  html += '<div class="flex space-x-2">';
  
  // Trang trước
  if (currentPage > 1) {
    html += `<button onclick="loadTokens(${currentPage - 1})" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Trang trước</button>`;
  } else {
    html += `<button disabled class="px-3 py-1 border border-gray-200 rounded text-gray-400 cursor-not-allowed">Trang trước</button>`;
  }
  
  // Trang số
  const maxPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages, startPage + maxPages - 1);
  
  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }
  
  if (startPage > 1) {
    html += `<button onclick="loadTokens(1)" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">1</button>`;
    if (startPage > 2) {
      html += `<span class="px-2 py-1">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      html += `<button class="px-3 py-1 bg-blue-500 text-white rounded">${i}</button>`;
    } else {
      html += `<button onclick="loadTokens(${i})" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">${i}</button>`;
    }
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="px-2 py-1">...</span>`;
    }
    html += `<button onclick="loadTokens(${totalPages})" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">${totalPages}</button>`;
  }
  
  // Trang sau
  if (currentPage < totalPages) {
    html += `<button onclick="loadTokens(${currentPage + 1})" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Trang sau</button>`;
  } else {
    html += `<button disabled class="px-3 py-1 border border-gray-200 rounded text-gray-400 cursor-not-allowed">Trang sau</button>`;
  }
  
  html += '</div></div>';
  paginationEl.innerHTML = html;
}

function showCreateTokenModal() {
  document.getElementById('createTokenModal').classList.remove('hidden');
}

function showImportTokenModal() {
  document.getElementById('importTokenModal').classList.remove('hidden');
  
  // Lắng nghe lựa chọn tệp
  document.getElementById('tokenFileInput').addEventListener('change', handleFileSelect);
}

function closeImportModal() {
  document.getElementById('importTokenModal').classList.add('hidden');
  document.getElementById('tokenFileInput').value = '';
  document.getElementById('tokenJsonContent').value = '';
  document.getElementById('importPreview').classList.add('hidden');
}

function handleFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  // Nếu chỉ một tệp, đọc trực tiếp
  if (files.length === 1) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('tokenJsonContent').value = e.target.result;
    };
    reader.onerror = function(e) {
      alert('Đọc tệp thất bại: ' + e.target.error);
    };
    reader.readAsText(files[0]);
    return;
  }
  
  // Nhiều tệp, gộp thành mảng
  let allTokens = [];
  let filesRead = 0;
  const totalFiles = files.length;
  
  console.log(`Bắt đầu đọc ${totalFiles} tệp...`);
  
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        console.log(`Đọc tệp ${index + 1}/${totalFiles}: ${file.name}`);
        const data = JSON.parse(e.target.result);
        // Nếu là mảng, mở rộng; nếu là đối tượng, thêm một phần tử
        if (Array.isArray(data)) {
          allTokens = allTokens.concat(data);
          console.log(`Tệp ${file.name} chứa ${data.length} token`);
        } else {
          allTokens.push(data);
          console.log(`Tệp ${file.name} chứa 1 token`);
        }
      } catch (error) {
        console.error(`Tệp ${file.name} phân tích thất bại:`, error);
        alert(`Tệp ${file.name} phân tích thất bại: ${error.message}`);
      }
      
      filesRead++;
      // Sau khi tất cả tệp đã được đọc xong, cập nhật vùng văn bản
      if (filesRead === totalFiles) {
        console.log(`Tất cả tệp đã đọc xong, tổng cộng ${allTokens.length} token`);
        document.getElementById('tokenJsonContent').value = JSON.stringify(allTokens, null, 2);
      }
    };
    reader.onerror = function(e) {
      console.error(`Tệp ${file.name} đọc thất bại:`, e.target.error);
      alert(`Tệp ${file.name} đọc thất bại`);
      filesRead++;
      if (filesRead === totalFiles && allTokens.length > 0) {
        document.getElementById('tokenJsonContent').value = JSON.stringify(allTokens, null, 2);
      }
    };
    reader.readAsText(file);
  });
}

let importData = null;

function previewImport() {
  const jsonContent = document.getElementById('tokenJsonContent').value.trim();
  
  if (!jsonContent) {
    alert('Vui lòng chọn tệp hoặc dán nội dung JSON trước');
    return;
  }
  
  try {
    importData = JSON.parse(jsonContent);
    
    if (!Array.isArray(importData)) {
      importData = [importData];
    }
    
    // Xác minh định dạng dữ liệu
    const validTokens = importData.filter(token => {
      return token.access_token && token.refresh_token;
    });
    
    if (validTokens.length === 0) {
      alert('Định dạng JSON sai: không tìm thấy dữ liệu token hợp lệ\n\nMỗi token phải chứa access_token và refresh_token');
      return;
    }
    
    // Hiển thị xem trước
    document.getElementById('importCount').textContent = validTokens.length;
    const listEl = document.getElementById('importList');
    listEl.innerHTML = validTokens.map((token, index) => `
      <li class="flex items-center space-x-2">
        <i class="fas fa-check-circle text-green-500"></i>
        <span>${index + 1}. ${escapeHtml(token.name || token.email || token.account_id || 'Token ' + (index + 1))}</span>
      </li>
    `).join('');
    
    document.getElementById('importPreview').classList.remove('hidden');
    importData = validTokens;
    
  } catch (error) {
    alert('Phân tích JSON thất bại:' + error.message);
  }
}

async function handleImportTokens() {
  if (!importData || importData.length === 0) {
    alert('Vui lòng xem trước dữ liệu nhập trước');
    return;
  }
  
  if (!confirm(`Bạn có chắc muốn nhập ${importData.length} tài khoản không?`)) {
    return;
  }
  
  try {
    const response = await fetch('/admin/tokens/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens: importData })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`Nhập thành công!\nThành công: ${data.success || 0}\nThất bại: ${data.failed || 0}`);
      closeImportModal();
      await loadTokens();
      await loadStats();
    } else {
      alert('Nhập thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Nhập thất bại: ' + error.message);
  }
}

async function handleCreateToken(event) {
  event.preventDefault();
  
  const name = document.getElementById('tokenName').value;
  const access_token = document.getElementById('accessToken').value;
  const refresh_token = document.getElementById('refreshToken').value;
  
  try {
    const response = await fetch('/admin/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, access_token, refresh_token })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('createTokenModal').classList.add('hidden');
      document.getElementById('tokenName').value = '';
      document.getElementById('accessToken').value = '';
      document.getElementById('refreshToken').value = '';
      alert('Thêm Token thành công!');
      await loadTokens();
      await loadStats();
    } else {
      alert('Thêm thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Thêm thất bại: ' + error.message);
  }
}

async function toggleToken(id, currentStatus) {
  try {
    const response = await fetch(`/admin/tokens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    
    if (response.ok) {
      await loadTokens();
      await loadStats();
    }
  } catch (error) {
    alert('Thao tácThất bại: ' + error.message);
  }
}

async function deleteToken(id) {
  if (!confirm('Bạn có chắc muốn xóa Token này không?')) return;
  
  try {
    const response = await fetch(`/admin/tokens/${id}`, { method: 'DELETE' });
    if (response.ok) {
      await loadTokens(currentTokenPage);
      await loadStats();
    }
  } catch (error) {
    alert('XóaThất bại: ' + error.message);
  }
}

async function refreshTokenQuota(id) {
  try {
    const response = await fetch(`/admin/tokens/${id}/quota`, { method: 'POST' });
    const data = await response.json();
    
    if (response.ok) {
      await loadTokens(currentTokenPage);
      if (data.quota) {
        alert(`Hạn mức đã cập nhật\nTổng hạn mức: ${data.quota.total.toLocaleString()}\nĐã sử dụng: ${data.quota.used.toLocaleString()}\nCòn lại: ${data.quota.remaining.toLocaleString()}`);
      }
    } else {
      alert('Làm mới hạn mức thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Làm mới hạn mức thất bại: ' + error.message);
  }
}

async function refreshAllQuotas() {
  if (!confirm('Bạn có chắc muốn làm mới hạn mức tất cả tài khoản không? Việc này có thể mất một thời gian.')) {
    return;
  }
  
  try {
    const response = await fetch('/admin/tokens/quota/refresh-all', { method: 'POST' });
    const data = await response.json();
    
    if (response.ok) {
      await loadTokens(currentTokenPage);
      alert(`Làm mới hàng loạt hoàn tất\nThành công: ${data.success || 0}\nThất bại: ${data.failed || 0}`);
    } else {
      alert('Làm mới hàng loạt thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Làm mới hàng loạt thất bại: ' + error.message);
  }
}

// ==================== Chức năng xóa hàng loạt ====================

function toggleTokenSelection(id) {
  if (selectedTokens.has(id)) {
    selectedTokens.delete(id);
  } else {
    selectedTokens.add(id);
  }
  updateBatchDeleteButton();
  updateSelectAllCheckbox();
}

function toggleSelectAll() {
  const checkbox = document.getElementById('selectAllTokens');
  const checkboxes = document.querySelectorAll('.token-checkbox');
  
  if (checkbox.checked) {
    checkboxes.forEach(cb => {
      const id = parseInt(cb.value);
      selectedTokens.add(id);
      cb.checked = true;
    });
  } else {
    selectedTokens.clear();
    checkboxes.forEach(cb => {
      cb.checked = false;
    });
  }
  
  updateBatchDeleteButton();
}

function updateSelectAllCheckbox() {
  const checkbox = document.getElementById('selectAllTokens');
  const checkboxes = document.querySelectorAll('.token-checkbox');
  
  if (checkboxes.length === 0) {
    checkbox.checked = false;
    return;
  }
  
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkbox.checked = allChecked;
}

function updateBatchDeleteButton() {
  const btn = document.getElementById('batchDeleteBtn');
  const countSpan = document.getElementById('selectedCount');
  
  if (selectedTokens.size > 0) {
    btn.classList.remove('hidden');
    countSpan.textContent = selectedTokens.size;
  } else {
    btn.classList.add('hidden');
  }
}

async function batchDeleteTokens() {
  if (selectedTokens.size === 0) {
    alert('Vui lòng chọn tài khoản để xóa trước');
    return;
  }
  
  if (!confirm(`Bạn có chắc muốn xóa ${selectedTokens.size} tài khoản đã chọn không? Hành động này không thể phục hồi!`)) {
    return;
  }
  
  try {
    const ids = Array.from(selectedTokens);
    const response = await fetch('/admin/tokens/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`Xóa hàng loạt hoàn tất\nThành công: ${data.success || 0}\nThất bại: ${data.failed || 0}`);
      selectedTokens.clear();
      await loadTokens(currentTokenPage);
      await loadStats();
    } else {
      alert('Xóa hàng loạt thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Xóa hàng loạt thất bại: ' + error.message);
  }
}

// ==================== Quản lý nhật ký ====================

async function loadAnalytics() {
  // Tải dữ liệu thống kê
  await loadAnalyticsStats();
  // Tải biểu đồ
  await loadCharts();
  // Tải thống kê mô hình
  await loadModelStats();
  // Tải nhật ký
  await loadLogs();
}

let currentTimeRange = '24h';

function changeTimeRange(range) {
  currentTimeRange = range;
  
  // Cập nhật kiểu nút
  document.querySelectorAll('.time-range-btn').forEach(btn => {
    btn.classList.remove('bg-blue-500', 'text-white');
    btn.classList.add('text-gray-700', 'hover:bg-gray-100');
  });
  event.target.classList.add('bg-blue-500', 'text-white');
  event.target.classList.remove('text-gray-700', 'hover:bg-gray-100');
  
  // Tải lại dữ liệu
  loadAnalytics();
}

async function loadAnalyticsStats() {
  try {
    const response = await fetch(`/admin/stats/analytics?range=${currentTimeRange}`);
    const data = await response.json();
    
    document.getElementById('totalRequests').textContent = data.totalRequests || 0;
    document.getElementById('successRequests').textContent = data.successRequests || 0;
    document.getElementById('failedRequests').textContent = data.failedRequests || 0;
    document.getElementById('avgResponseTime').textContent = (data.avgResponseTime || 0) + 'ms';
  } catch (error) {
    console.error('Tải dữ liệu thống kê thất bại:', error);
  }
}

let requestTrendChart = null;
let modelDistributionChart = null;

async function loadCharts() {
  try {
    const response = await fetch(`/admin/stats/charts?range=${currentTimeRange}`);
    const data = await response.json();
    
    // Biểu đồ xu hướng số lượng yêu cầu
    const trendCtx = document.getElementById('requestTrendChart').getContext('2d');
    if (requestTrendChart) {
      requestTrendChart.destroy();
    }
    requestTrendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: data.trendLabels || [],
        datasets: [{
          label: 'Số yêu cầu',
          data: data.trendData || [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Biểu đồ phân phối sử dụng mô hình
    const distCtx = document.getElementById('modelDistributionChart').getContext('2d');
    if (modelDistributionChart) {
      modelDistributionChart.destroy();
    }
    modelDistributionChart = new Chart(distCtx, {
      type: 'pie',
      data: {
        labels: data.modelLabels || [],
        datasets: [{
          data: data.modelData || [],
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#ec4899'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  } catch (error) {
    console.error('Tải biểu đồ thất bại:', error);
  }
}

async function loadModelStats() {
  try {
    const response = await fetch(`/admin/stats/accounts?range=${currentTimeRange}`);
    const data = await response.json();
    
    const tbody = document.getElementById('accountStatsTable');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Chưa có dữ liệu</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(account => `
      <tr class="border-b border-gray-100 hover:bg-gray-50">
        <td class="py-4 px-4 text-sm font-medium text-gray-900">${escapeHtml(account.name)}</td>
        <td class="py-4 px-4 text-sm text-gray-600">${account.requests}</td>
        <td class="py-4 px-4">
          <span class="text-sm font-medium ${account.successRate >= 95 ? 'text-green-600' : account.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}">
            ${account.successRate}%
          </span>
        </td>
        <td class="py-4 px-4 text-sm text-gray-600">${account.avgResponseTime}ms</td>
        <td class="py-4 px-4 text-sm text-gray-500">${account.lastUsed ? new Date(account.lastUsed).toLocaleString('zh-CN') : '-'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Tải thống kê tài khoản thất bại:', error);
  }
}

async function loadLogs() {
  try {
    const response = await fetch(`/admin/stats/logs?limit=50&range=${currentTimeRange}`);
    const data = await response.json();
    
    const tbody = document.getElementById('logsTable');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Chưa có nhật ký</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(log => `
      <tr class="border-b border-gray-100 hover:bg-gray-50">
        <td class="py-3 px-4 text-xs text-gray-600">${new Date(log.created_at).toLocaleString('zh-CN')}</td>
        <td class="py-3 px-4 text-xs text-gray-600">${log.api_key_name || log.api_key_id || '-'}</td>
        <td class="py-3 px-4 text-xs text-gray-600">${escapeHtml(log.model || '-')}</td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.status_code >= 200 && log.status_code < 300 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${log.status_code}
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-gray-600">${log.response_time || '-'}ms</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Tải nhật ký thất bại:', error);
  }
}

// ==================== Hàm tiện ích ====================

async function handleLogout() {
  if (!confirm('Bạn có chắc muốn đăng xuất không?')) return;
  
  try {
    await fetch('/admin/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login.html';
  } catch (error) {
    window.location.href = '/admin/login.html';
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Đã sao chép vào khay nhớ tạm!');
  }).catch(() => {
    alert('Sao chép thất bại, vui lòng sao chép thủ công');
  });
}

// ==================== Quản lý chiến lược cân bằng tải ====================

async function loadLoadBalanceStrategy() {
  try {
    const response = await fetch('/admin/settings/load-balance-strategy');
    const data = await response.json();
    
    const select = document.getElementById('loadBalanceStrategy');
    if (select && data.strategy) {
      select.value = data.strategy;
    }
  } catch (error) {
    console.error('Tải chiến lược cân bằng tải thất bại:', error);
  }
}

async function changeLoadBalanceStrategy() {
  const select = document.getElementById('loadBalanceStrategy');
  const strategy = select.value;
  
  try {
    const response = await fetch('/admin/settings/load-balance-strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Chiến lược cân bằng tải đã cập nhật thành: ' + (strategy === 'round-robin' ? 'Luân phiên' : strategy === 'random' ? 'Ngẫu nhiên' : 'Ít sử dụng nhất'));
    } else {
      alert('Cập nhật thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Cập nhật thất bại: ' + error.message);
  }
}

// ==================== Thay đổi mật khẩu ====================

function showChangePasswordModal() {
  document.getElementById('changePasswordModal').classList.remove('hidden');
}

function closeChangePasswordModal() {
  document.getElementById('changePasswordModal').classList.add('hidden');
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

async function handleChangePassword(event) {
  event.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (newPassword !== confirmPassword) {
    alert('Mật khẩu mới nhập lại không khớp');
    return;
  }
  
  if (newPassword.length < 6) {
    alert('Mật khẩu phải có ít nhất 6 ký tự');
    return;
  }
  
  try {
    const response = await fetch('/admin/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Đổi mật khẩu thành công, vui lòng đăng nhập lại');
      closeChangePasswordModal();
      window.location.href = '/admin/login.html';
    } else {
      alert('Thay đổi thất bại: ' + (data.error || 'Không xác định lỗi'));
    }
  } catch (error) {
    alert('Thay đổi thất bại: ' + error.message);
  }
}

// ==================== Hàm tiện ích ====================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
