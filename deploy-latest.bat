@echo off
setlocal

cd /d "%~dp0"

echo ==========================================
echo   One-click Deploy: GitHub Pages
echo ==========================================

for /f %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="" (
  echo [ERROR] 当前目录不是有效的 Git 仓库或 Git 不可用。
  goto :error
)

if /I not "%CURRENT_BRANCH%"=="main" (
  echo [ERROR] 当前分支是 %CURRENT_BRANCH%，请先切换到 main 后再部署。
  goto :error
)

git diff --quiet
if errorlevel 1 (
  echo [ERROR] 检测到未提交改动，请先提交或暂存后再部署。
  goto :error
)

git diff --cached --quiet
if errorlevel 1 (
  echo [ERROR] 检测到已暂存但未提交改动，请先提交后再部署。
  goto :error
)

echo [1/3] 拉取 main 最新代码...
git pull --ff-only origin main
if errorlevel 1 goto :error

echo [2/3] 构建生产产物...
call npm run build
if errorlevel 1 goto :error

echo [3/3] 发布到 GitHub Pages...
call npm run deploy
if errorlevel 1 goto :error

echo.
echo [SUCCESS] 部署完成，请刷新线上页面查看最新版本。
echo URL: https://coderzhangjun.github.io/my-ai-chat/
goto :end

:error
echo.
echo [FAILED] 部署失败，请根据上方日志排查后重试。
exit /b 1

:end
endlocal
exit /b 0
