# Node.js 文件上传下载服务

一个简单的Node.js服务，支持文件上传、下载、列表查看和删除功能。

## 功能特性

- ✅ 单文件上传
- ✅ 多文件上传
- ✅ 文件下载
- ✅ 文件列表查看
- ✅ 文件删除
- ✅ 反馈数据提交
- ✅ 反馈数据Excel导出
- ✅ 反馈数据查看和管理
- ✅ 模板数据保存和管理
- ✅ 模板数据编辑和重命名
- ✅ JSON格式验证和格式化
- ✅ 文件大小限制 (10MB)
- ✅ 友好的Web界面
- ✅ CORS支持
- ✅ 健康检查接口
- ✅ Docker 支持
- ✅ PM2 集群模式

## 文档

- 📖 [API 接口文档](./API.md) - 详细的接口调用说明和示例
- 🚀 [部署文档](./DEPLOYMENT.md) - 本地、生产环境和云服务器部署指南

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量（可选）
```bash
cp .env.example .env
# 编辑 .env 文件设置你的配置
```

### 3. 启动服务
```bash
# 生产模式
npm start

# 开发模式 (需要安装nodemon)
npm run dev
```

### 4. 访问服务
- Web界面: http://localhost:3001
- 反馈管理: http://localhost:3001/feedback.html
- 模板管理: http://localhost:3001/template.html
- API接口: http://localhost:3001/upload

## API接口

### 文件管理
- **POST** `/upload` - 单文件上传
- **POST** `/upload-multiple` - 多文件上传
- **GET** `/files` - 获取文件列表
- **GET** `/download/:filename` - 下载文件
- **DELETE** `/delete/:filename` - 删除文件

### 反馈数据管理
- **POST** `/feedback` - 提交反馈数据
- **GET** `/feedback/list` - 获取反馈数据文件列表
- **GET** `/feedback/download/:filename` - 下载反馈Excel文件
- **GET** `/feedback/view/:date` - 查看特定日期反馈数据

### 模板管理
- **POST** `/template` - 保存模板
- **GET** `/template/list` - 获取模板列表
- **GET** `/template/:id` - 根据ID获取模板数据
- **PUT** `/template/:id` - 编辑模板数据
- **PATCH** `/template/:id/name` - 修改模板名称
- **DELETE** `/template/:id` - 删除模板

### 系统管理
- **GET** `/health` - 健康检查

详细的API文档请查看 [API.md](./API.md)

## 部署选项

### PM2 部署
```bash
npm run pm2:start
```

### Docker 部署
```bash
npm run docker:compose
```

### 云服务器部署
详细步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 项目结构
```
├── server.js              # 主服务文件
├── package.json           # 项目配置
├── ecosystem.config.js    # PM2 配置
├── Dockerfile            # Docker 配置
├── docker-compose.yml    # Docker Compose 配置
├── healthcheck.js        # 健康检查脚本
├── .env.example          # 环境变量示例
├── public/
│   ├── index.html        # 文件管理Web界面
│   ├── feedback.html     # 反馈数据管理界面
│   └── template.html     # 模板管理界面
├── uploads/              # 文件存储目录 (自动创建)
├── feedback/             # 反馈数据Excel存储目录 (自动创建)
├── templates/            # 模板数据JSON存储目录 (自动创建)
├── logs/                 # 日志目录 (自动创建)
├── API.md               # API接口文档
├── DEPLOYMENT.md        # 部署文档
└── README.md            # 说明文档
```

## 配置说明

- 默认端口: 3001 (可通过环境变量 PORT 修改)
- 文件大小限制: 10MB (可通过环境变量 MAX_FILE_SIZE 修改)
- 文件存储目录: ./uploads/ (可通过环境变量 UPLOAD_DIR 修改)
- 多文件上传限制: 最多5个文件 (可通过环境变量 MAX_FILES 修改)

## 使用示例

### 使用curl保存模板
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"templateName":"我的模板","templateData":{"name":"示例","config":{"theme":"default"}}}' \
  http://localhost:3001/template
```

### 使用curl提交反馈
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"系统建议","description":"希望增加批量上传功能"}' \
  http://localhost:3001/feedback
```

### 使用curl上传文件
```bash
curl -X POST -F "file=@example.txt" http://localhost:3001/upload
```

### 使用curl下载文件
```bash
curl -O http://localhost:3001/download/filename.txt
```

### 前端集成示例
详细的前端集成示例请查看 [API.md](./API.md#集成示例)

## 许可证

MIT License