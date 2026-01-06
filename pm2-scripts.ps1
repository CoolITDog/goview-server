# PM2 管理脚本 (PowerShell版本)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "reload", "status", "logs", "monitor", "delete", "save", "resurrect")]
    [string]$Command
)

switch ($Command) {
    "start" {
        Write-Host "启动文件服务器..." -ForegroundColor Green
        pm2 start ecosystem.config.js --env production
    }
    "stop" {
        Write-Host "停止文件服务器..." -ForegroundColor Yellow
        pm2 stop file-server
    }
    "restart" {
        Write-Host "重启文件服务器..." -ForegroundColor Blue
        pm2 restart file-server
    }
    "reload" {
        Write-Host "重新加载文件服务器（零停机）..." -ForegroundColor Cyan
        pm2 reload file-server
    }
    "status" {
        Write-Host "查看服务器状态..." -ForegroundColor White
        pm2 status
    }
    "logs" {
        Write-Host "查看服务器日志..." -ForegroundColor Magenta
        pm2 logs file-server --lines 50
    }
    "monitor" {
        Write-Host "打开监控界面..." -ForegroundColor DarkGreen
        pm2 monit
    }
    "delete" {
        Write-Host "删除文件服务器进程..." -ForegroundColor Red
        pm2 delete file-server
    }
    "save" {
        Write-Host "保存PM2配置..." -ForegroundColor DarkBlue
        pm2 save
    }
    "resurrect" {
        Write-Host "恢复PM2进程..." -ForegroundColor DarkCyan
        pm2 resurrect
    }
}

Write-Host "`n操作完成！" -ForegroundColor Green