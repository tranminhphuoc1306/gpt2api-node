# GPT2API Node

A reverse proxy service for OpenAI Codex built with Node.js + Express, supporting multi-account management, automatic token refresh, load balancing, an OpenAI-compatible API interface, and a full admin panel.

## Interface Preview

<table>
  <tr>
    <td width="50%">
      <img src="screenshots/管理员登录.png" alt="Admin Login" />
      <p align="center">Admin Login</p>
    </td>
    <td width="50%">
      <img src="screenshots/仪表盘.png" alt="Dashboard" />
      <p align="center">Dashboard</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/API keys.png" alt="API Keys Management" />
      <p align="center">API Keys Management</p>
    </td>
    <td width="50%">
      <img src="screenshots/账号管理.png" alt="Account Management" />
      <p align="center">Account Management</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/数据分析.png" alt="Data Analysis" />
      <p align="center">Data Analysis</p>
    </td>
    <td width="50%">
      <img src="screenshots/系统设置.png" alt="System Settings" />
      <p align="center">System Settings</p>
    </td>
  </tr>
</table>

## Features

- ✅ OpenAI Codex reverse proxy
- ✅ Full web admin panel
- ✅ Multi-account management and bulk import
- ✅ Automatic token refresh mechanism
- ✅ Load balancing (round-robin / random / least-used)
- ✅ API Key management and authentication
- ✅ Request statistics and data analysis
- ✅ Supports streaming and non-streaming responses
- ✅ OpenAI-compatible API interface
- ✅ Bulk account deletion
- ✅ Real-time activity logs

## Quick Start

### Option 1: Docker Deployment (Recommended)

Use Docker Compose to deploy quickly:

```bash
# Clone the project
git clone https://github.com/lulistart/gpt2api-node.git
cd gpt2api-node

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f
```

The service will run at `http://localhost:3000`.

### Option 2: Local Deployment

#### 1. Install dependencies

```bash
cd gpt2api-node
npm install
```

#### 2. Initialize the database

```bash
npm run init-db
```

Default admin account:
- Username: `admin`
- Password: `admin123`

#### 3. Start the service

```bash
npm start
```

Development mode (auto-restart):

```bash
npm run dev
```

#### 4. Access the admin panel

Open your browser at: `http://localhost:3000/admin`

After logging in with the default account, change the password immediately.

## Admin Panel Features

### Dashboard
- System overview and real-time statistics
- API Keys count
- Token account count
- Today request count and success rate
- Recent activity logs

### API Keys Management
- Create and manage API Keys
- View usage statistics
- Enable/disable API Keys

### Account Management
- Bulk import Token accounts (JSON file supported)
- Add accounts manually
- Bulk delete accounts
- View account quota and usage
- Refresh account quotas
- Configure load balancing strategy

### Data Analysis
- Request trend charts
- Model usage distribution
- Detailed account statistics
- API request logs

### System Settings
- Change admin password
- Load balancing strategy settings

## Load Balancing Strategy

Supports three strategies:

1. **round-robin**: use each account sequentially
2. **random**: randomly select an available account
3. **least-used**: choose the account with the fewest requests

Can be configured in the admin page or via environment variables.

## API Endpoints

### Chat completions endpoint

**Endpoint**: `POST /v1/chat/completions`

**Request headers**:
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Example request**:

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

**Streaming request**:

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

### Model list

**Endpoint**: `GET /v1/models`

```bash
curl http://localhost:3000/v1/models
```

### Health check

**Endpoint**: `GET /health`

```bash
curl http://localhost:3000/health
```

## Supported models

- `gpt-5.3-codex` - GPT 5.3 Codex (latest)
- `gpt-5.2` - GPT 5.2
- `gpt-5.2-codex` - GPT 5.2 Codex
- `gpt-5.1` - GPT 5.1
- `gpt-5.1-codex` - GPT 5.1 Codex
- `gpt-5.1-codex-mini` - GPT 5.1 Codex Mini (faster and cheaper)
- `gpt-5.1-codex-max` - GPT 5.1 Codex Max
- `gpt-5` - GPT 5
- `gpt-5-codex` - GPT 5 Codex
- `gpt-5-codex-mini` - GPT 5 Codex Mini

## Using Cherry Studio

Cherry Studio is a desktop client supporting multiple AI services. Configuration steps:

### 1. Create an API Key

1. Visit the admin panel: `http://localhost:3000/admin`
2. Go to the **API Keys** page
3. Click **Create API Key**
4. Copy the generated API Key (shown only once)

### 2. Configure Cherry Studio

1. Open Cherry Studio
2. Go to **Settings** → **Model Providers**
3. Add a new **OpenAI compatible** provider
4. Fill in:
   - **Name**: GPT2API Node (or custom name)
   - **API URL**: `http://localhost:3000/v1`
   - **API Key**: paste the generated API Key
   - **Model**: select or enter the model name like `gpt-5.3-codex`

### 3. Start using

After configuring, select the provider and model and start chatting.

## Examples

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

## Token management

### Bulk import

1. Prepare a JSON file with this format:

```json
[
  {
    "access_token": "your_access_token",
    "refresh_token": "your_refresh_token",
    "id_token": "your_id_token",
    "account_id": "account_id",
    "email": "email@example.com",
    "name": "Account Name"
  }
]
```

2. In the admin panel account management page, click **Import JSON**
3. Choose a file or paste JSON content
4. Preview and confirm import

### Manual add

Click **Manual Add** on the account management page and fill in the required fields.

### Auto refresh

The service automatically detects expired tokens and refreshes them as needed.

## Environment variables

Create a `.env` file:

```env
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production
LOAD_BALANCE_STRATEGY=round-robin
MODELS_FILE=./models.json
```

## Project structure

```
gpt2api-node/
├── src/
│   ├── index.js              # main server file
│   ├── tokenManager.js       # Token management module
│   ├── proxyHandler.js       # proxy handler module
│   ├── config/
│   │   └── database.js       # database configuration
│   ├── models/
│   │   └── index.js          # data models
│   ├── routes/
│   │   ├── auth.js           # auth routes
│   │   ├── apiKeys.js        # API Keys routes
│   │   ├── tokens.js         # Tokens routes
│   │   ├── stats.js          # stats routes
│   │   └── settings.js       # settings routes
│   ├── middleware/
│   │   └── auth.js           # auth middleware
│   └── scripts/
│       └── initDatabase.js   # database init script
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

## Notes

1. **Security**:
   - Change admin password immediately after first login
   - Keep API Keys secure
   - Use HTTPS in production

2. **Network requirements**: Must be able to access `chatgpt.com` and `auth.openai.com`

3. **Token validity**: Tokens are auto-refreshed, but if a `refresh_token` expires, you need to import a new token.

4. **Concurrency limits**: Be mindful of OpenAI account request limits.

## Troubleshooting

### Cannot access admin panel

Ensure the service is running and visit `http://localhost:3000/admin`

### Database initialization failed

Delete `database/app.db` and rerun `npm run init-db`.

### Token refresh failed

1. Check network connection
2. Verify the `refresh_token` is still valid
3. Re-import a new token

### API request failed

1. Check the API Key
2. Ensure available Token accounts exist
3. Review request logs
4. Check whether accounts are disabled

### Trend chart display issues

- Chart data is based on real records in the `api_logs` table
- If there are no requests, charts may appear empty
- Send some API requests and refresh the page

## Maintenance suggestions

1. **Backup the database regularly**
   ```bash
   cp database/app.db database.app.db.backup.$(date +%Y%m%d)
   ```

2. **Monitor logs**
   - Check terminal output
   - Review request logs

3. **Update dependencies**
   ```bash
   npm update
   ```

4. **Clean up old logs**
   - Periodically remove old records from the `api_logs` table

## Release notes

### v2.0.0 (2026-02-17)
- ✅ Added bulk account deletion
- ✅ Added recent activity logs on the dashboard
- ✅ Added GitHub project link
- ✅ Redirected root path to admin panel
- ✅ Fixed model list (removed non-existent gpt-5.3-codex-spark)
- ✅ Optimized terminal log output
- ✅ Displayed total account count on account management page
- ✅ Added scrollbars to detailed stats and request logs
- ✅ Fixed request trend chart to use real data

### v1.0.0
- ✅ Basic admin system
- ✅ API Keys management
- ✅ Tokens management
- ✅ Data statistics

## Support

- GitHub: https://github.com/lulistart/gpt2api-node
- Issues: https://github.com/lulistart/gpt2api-node/issues

## License

MIT License
