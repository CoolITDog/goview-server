# 部署文档

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- 操作系统：Windows/Linux/macOS

## 本地部署

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd file-upload-download-server
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env` 文件（可选）：
```env
PORT=3001
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
MAX_FILES=5
```

### 4. 启动服务
```bash
# 生产模式
npm start

# 开发模式
npm run dev
```

## 生产环境部署

### 使用 PM2 部署

#### 1. 安装 PM2
```bash
npm install -g pm2
```

#### 2. 创建 PM2 配置文件
创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'file-server',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

#### 3. 启动服务
```bash
# 开发环境
pm2 start ecosystem.config.js

# 生产环境
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs file-server

# 健康检查
访问 http://localhost:3001/health

# 启动服务（windows不支持）
pm2 startup
# 保存当前PM2配置，再手动重启 （Windows启动方式）
pm2 save

# 重启服务
pm2 restart file-server

# 停止服务
pm2 stop file-server
```

### 使用 Docker 部署

#### 1. 创建 Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads logs

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

#### 2. 创建 docker-compose.yml
```yaml
version: '3.8'

services:
  file-server:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 3. 构建和运行
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

## 云服务器部署

### 阿里云 ECS 部署步骤

1. **购买 ECS 实例**
   - 选择合适的配置（推荐2核4G以上）
   - 安装 CentOS 7+ 或 Ubuntu 18.04+

2. **安装 Node.js**
```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 或使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

3. **配置防火墙**
```bash
# CentOS
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# Ubuntu
sudo ufw allow 3001
```

4. **部署应用**
```bash
# 上传代码
scp -r ./file-upload-download-server user@your-server-ip:/home/user/

# 连接服务器
ssh user@your-server-ip

# 进入项目目录
cd /home/user/file-upload-download-server

# 安装依赖
npm install --production

# 使用 PM2 启动
npm install -g pm2
pm2 start server.js --name file-server
pm2 startup
pm2 save
```

### 腾讯云 CVM 部署

类似阿里云 ECS，主要步骤相同。

### AWS EC2 部署

1. **启动 EC2 实例**
   - 选择 Amazon Linux 2 或 Ubuntu
   - 配置安全组开放 3001 端口

2. **连接实例并部署**
```bash
# 连接实例
ssh -i your-key.pem ec2-user@your-instance-ip

# 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18

# 部署应用（同上）
```

## 监控和日志

### 健康检查端点
添加到 `server.js`：
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 日志配置
使用 winston 进行日志管理：
```bash
npm install winston
```

### 性能监控
推荐使用：
- PM2 Monitor
- New Relic
- DataDog
- 阿里云监控

## 安全配置

### 1. 环境变量
```env
NODE_ENV=production
PORT=3001
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=https://your-frontend-domain.com
JWT_SECRET=your-jwt-secret
```

### 2. HTTPS 配置
```javascript
// 在生产环境中使用 HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. 文件类型限制
```javascript
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};
```

## 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查找占用端口的进程
netstat -tulpn | grep :3001
# 或
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

2. **文件上传失败**
- 检查 uploads 目录权限
- 检查磁盘空间
- 检查文件大小限制

3. **内存不足**
```bash
# 增加 Node.js 内存限制
node --max-old-space-size=4096 server.js
```

4. **PM2 进程异常**
```bash
# 重启所有进程
pm2 restart all

# 清理日志
pm2 flush

# 重新加载配置
pm2   ecosystem.config.js
```