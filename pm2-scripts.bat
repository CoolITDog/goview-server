@echo off
REM PM2 管理脚本

if "%1"=="start" (
    echo 启动文件服务器...
    pm2 start ecosystem.config.js --env production
    goto end
)

if "%1"=="stop" (
    echo 停止文件服务器...
    pm2 stop file-server
    goto end
)

if "%1"=="restart" (
    echo 重启文件服务器...
    pm2 restart file-server
    goto end
)

if "%1"=="reload" (
    echo 重新加载文件服务器...
    pm2 reload file-server
    goto end
)

if "%1"=="status" (
    echo 查看服务器状态...
    pm2 status
    goto end
)

if "%1"=="logs" (
    echo 查看服务器日志...
    pm2 logs file-server --lines 50
    goto end
)

if "%1"=="monitor" (
    echo 打开监控界面...
    pm2 monit
    goto end
)

if "%1"=="delete" (
    echo 删除文件服务器进程...
    pm2 delete file-server
    goto end
)

if "%1"=="save" (
    echo 保存PM2配置...
    pm2 save
    goto end
)

if "%1"=="resurrect" (
    echo 恢复PM2进程...
    pm2 resurrect
    goto end
)

echo 用法: pm2-scripts.bat [命令]
echo.
echo 可用命令:
echo   start      - 启动服务器
echo   stop       - 停止服务器
echo   restart    - 重启服务器
echo   reload     - 重新加载服务器（零停机）
echo   status     - 查看状态
echo   logs       - 查看日志
echo   monitor    - 打开监控界面
echo   delete     - 删除进程
echo   save       - 保存配置
echo   resurrect  - 恢复进程

:end