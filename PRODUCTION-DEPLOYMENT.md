# 生产环境部署完成

## 🎉 部署状态

✅ **部署成功！** 文件上传下载服务已使用PM2成功部署到生产环境。

## 📊 当前运行状态

- **服务名称**: file-upload-download-server
- **运行模式**: PM2 集群模式
- **实例数量**: 12个进程（根据CPU核心数自动调整）
- **运行环境**: production
- **服务端口**: 3001
- **进程管理**: PM2 v6.0.14

## 🌐 访问地址

| 功能 | 地址 | 描述 |
|------|------|------|
| 主页 | http://localhost:3001 | 文件上传下载主界面 |
| 反馈管理 | http://localhost:3001/feedback.html | 反馈数据管理系统 |
| 模板管理 | http://localhost:3001/template.html | JSON模板管理系统 |
| 服务器状态 | http://localhost:3001/status.html | 实时服务器监控 |
| 健康检查 | http://localhost:3001/health | API健康检查 |
| 服务器信息 | http://localhost:3001/info | 详细服务器信息 |

## 🛠️ PM2 管理命令

### 基础命令
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs file-server

# 重启服务（有短暂停机）
pm2 restart file-server

# 重新加载服务（零停机）
pm2 reload file-server

# 停止服务
pm2 stop file-server

# 删除服务
pm2 delete file-server

# 保存当前配置
pm2 save

# 恢复保存的配置
pm2 resurrect
```

### 使用管理脚本
我们提供了便捷的管理脚本：

**PowerShell版本**:
```powershell
# 查看状态
.\pm2-scripts.ps1 status

# 重新加载服务
.\pm2-scripts.ps1 reload

# 查看日志
.\pm2-scripts.ps1 logs
```

**批处理版本**:
```cmd
# 查看状态
pm2-scripts.bat status

# 重新加载服务
pm2-scripts.bat reload

# 查看日志
pm2-scripts.bat logs
```

## 📁 目录结构

```
D:\workspace\itrcp\goview-server\
├── server.js                    # 主服务文件
├── package.json                 # 项目配置
├── ecosystem.config.js          # PM2配置文件
├── pm2-scripts.bat             # Windows批处理管理脚本
├── pm2-scripts.ps1             # PowerShell管理脚本
├── public/                     # 静态文件目录
│   ├── index.html              # 主页面
│   ├── feedback.html           # 反馈管理页面
│   ├── template.html           # 模板管理页面
│   └── status.html             # 状态监控页面
├── uploads/                    # 文件上传存储目录
├── feedback/                   # 反馈数据Excel存储目录
├── templates/                  # 模板JSON存储目录
├── logs/                       # PM2日志目录
│   ├── combined.log            # 合并日志
│   ├── out-*.log              # 标准输出日志
│   └── err-*.log              # 错误日志
└── node_modules/               # 依赖包目录
```

## 🔧 配置信息

### 环境变量
- `NODE_ENV`: production
- `PORT`: 3001
- `UPLOAD_DIR`: uploads
- `MAX_FILE_SIZE`: 10485760 (10MB)
- `MAX_FILES`: 5

### PM2配置
- **集群模式**: 启用
- **实例数**: max (根据CPU核心数)
- **内存限制**: 1GB
- **自动重启**: 启用
- **日志轮转**: 启用

## 📊 监控和日志

### 实时监控
```bash
# 打开PM2监控界面
pm2 monit

# 查看实时日志
pm2 logs file-server --lines 100

# 查看特定进程日志
pm2 logs 0  # 查看进程ID为0的日志
```

### 日志文件位置
- **合并日志**: `./logs/combined.log`
- **输出日志**: `./logs/out-*.log`
- **错误日志**: `./logs/err-*.log`
- **PM2日志**: `C:\Users\[用户名]\.pm2\pm2.log`

### Web监控
访问 http://localhost:3001/status.html 查看：
- 服务运行状态
- 内存使用情况
- 运行时间统计
- 系统信息
- 功能特性列表

## 🚀 性能特性

### 集群优势
- **负载均衡**: 12个进程自动分担请求负载
- **高可用性**: 单个进程崩溃不影响整体服务
- **零停机部署**: 使用 `pm2 reload` 实现无缝更新
- **自动重启**: 进程异常退出时自动重启

### 资源使用
- **CPU**: 多核心并行处理
- **内存**: 每进程约70MB，总计约840MB
- **磁盘**: 日志自动轮转，避免磁盘占满

## 🔒 安全配置

### 生产环境安全
- ✅ 运行在生产模式 (NODE_ENV=production)
- ✅ 文件大小限制 (10MB)
- ✅ CORS跨域保护
- ✅ 错误处理和日志记录
- ✅ 进程隔离和自动重启

### 建议的额外安全措施
- 配置防火墙规则
- 使用HTTPS (需要反向代理)
- 设置访问日志
- 定期备份数据目录

## 📈 扩展建议

### 水平扩展
如需更高性能，可以：
1. 增加服务器实例
2. 使用负载均衡器 (Nginx)
3. 配置数据库存储
4. 使用Redis缓存

### 监控扩展
建议集成：
- 应用性能监控 (APM)
- 日志聚合系统
- 告警通知系统
- 自动化部署流水线

## 🆘 故障排除

### 常见问题

**1. 服务无法启动**
```bash
# 检查端口占用
netstat -ano | findstr :3001

# 查看PM2日志
pm2 logs file-server
```

**2. 内存使用过高**
```bash
# 重启服务释放内存
pm2 restart file-server

# 检查内存使用
pm2 monit
```

**3. 文件上传失败**
- 检查 uploads 目录权限
- 确认磁盘空间充足
- 查看错误日志

### 紧急恢复
```bash
# 停止所有进程
pm2 stop all

# 删除所有进程
pm2 delete all

# 重新启动
pm2 start ecosystem.config.js --env production
```

## 📞 技术支持

如遇到问题，请：
1. 查看 `/status.html` 页面确认服务状态
2. 检查 PM2 日志: `pm2 logs file-server`
3. 查看系统资源使用情况
4. 参考本文档的故障排除部分

---

**部署完成时间**: 2026年1月6日  
**部署环境**: Windows 10/11 + Node.js v22.18.0 + PM2 v6.0.14  
**服务状态**: ✅ 正常运行