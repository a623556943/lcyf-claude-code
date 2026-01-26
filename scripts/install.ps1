# LCYF Claude Code - Windows 安装脚本
# 用法: .\scripts\install.ps1

param(
    [switch]$Global,
    [switch]$Uninstall,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# 颜色输出函数
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warn { param($Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# 显示帮助
if ($Help) {
    Write-Host @"
LCYF Claude Code - 安装脚本

用法:
    .\scripts\install.ps1           # 安装到全局 ~/.claude/
    .\scripts\install.ps1 -Global   # 同上
    .\scripts\install.ps1 -Uninstall # 卸载

选项:
    -Global     安装到全局 Claude Code 配置目录
    -Uninstall  卸载已安装的组件
    -Help       显示帮助信息
"@
    exit 0
}

# 获取脚本所在目录的父目录（项目根目录）
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ClaudeDir = Join-Path $env:USERPROFILE ".claude"

Write-Info "LCYF Claude Code 安装程序 v2.0.0"
Write-Info "项目目录: $ProjectRoot"
Write-Info "目标目录: $ClaudeDir"

# 卸载
if ($Uninstall) {
    Write-Info "开始卸载..."

    # 删除 agents
    $AgentFiles = @(
        "01-规划专家.md", "02-架构专家.md", "03-Java开发专家.md",
        "04-模块协调专家.md", "05-代码审查专家.md", "06-安全审查专家.md",
        "07-测试专家.md", "08-学习代理.md"
    )
    foreach ($file in $AgentFiles) {
        $path = Join-Path $ClaudeDir "agents\$file"
        if (Test-Path $path) {
            Remove-Item $path -Force
            Write-Info "删除: $path"
        }
    }

    # 删除 commands
    $CommandDir = Join-Path $ClaudeDir "commands"
    Get-ChildItem -Path $CommandDir -Filter "lcyf-*.md" -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item $_.FullName -Force
        Write-Info "删除: $($_.FullName)"
    }

    # 删除 rules
    $RuleFiles = @(
        "00-总则.md", "01-安全规范.md", "02-编码风格.md", "03-测试要求.md",
        "04-Git工作流.md", "05-性能优化.md", "06-Java编码规范.md",
        "07-SpringBoot最佳实践.md", "08-MyBatis规范.md", "09-API设计规范.md",
        "10-数据库设计规范.md", "11-模块依赖规范.md"
    )
    foreach ($file in $RuleFiles) {
        $path = Join-Path $ClaudeDir "rules\$file"
        if (Test-Path $path) {
            Remove-Item $path -Force
            Write-Info "删除: $path"
        }
    }

    # 删除 skills
    $SkillDirs = @("workflows", "java-full-stack", "modular-monolith", "continuous-learning", "verification-loop")
    foreach ($dir in $SkillDirs) {
        $path = Join-Path $ClaudeDir "skills\$dir"
        if (Test-Path $path) {
            Remove-Item $path -Recurse -Force
            Write-Info "删除: $path"
        }
    }

    Write-Success "卸载完成!"
    exit 0
}

# 安装
Write-Info "开始安装..."

# 创建目录结构
$Dirs = @("agents", "commands", "rules", "skills")
foreach ($dir in $Dirs) {
    $path = Join-Path $ClaudeDir $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Info "创建目录: $path"
    }
}

# 复制 agents
Write-Info "复制 Agents..."
$SourceAgents = Join-Path $ProjectRoot "agents"
Get-ChildItem -Path $SourceAgents -Filter "*.md" | ForEach-Object {
    $dest = Join-Path $ClaudeDir "agents\$($_.Name)"
    Copy-Item $_.FullName $dest -Force
    Write-Info "  $($_.Name)"
}
Write-Success "Agents 复制完成 (8个)"

# 复制 commands
Write-Info "复制 Commands..."
$SourceCommands = Join-Path $ProjectRoot "commands"
Get-ChildItem -Path $SourceCommands -Filter "*.md" | ForEach-Object {
    $dest = Join-Path $ClaudeDir "commands\$($_.Name)"
    Copy-Item $_.FullName $dest -Force
    Write-Info "  $($_.Name)"
}
Write-Success "Commands 复制完成 (13个)"

# 复制 rules
Write-Info "复制 Rules..."
$SourceRules = Join-Path $ProjectRoot "rules"
Get-ChildItem -Path $SourceRules -Filter "*.md" | ForEach-Object {
    $dest = Join-Path $ClaudeDir "rules\$($_.Name)"
    Copy-Item $_.FullName $dest -Force
    Write-Info "  $($_.Name)"
}
Write-Success "Rules 复制完成 (12个)"

# 复制 skills
Write-Info "复制 Skills..."
$SourceSkills = Join-Path $ProjectRoot "skills"
Get-ChildItem -Path $SourceSkills -Directory | ForEach-Object {
    $dest = Join-Path $ClaudeDir "skills\$($_.Name)"
    if (-not (Test-Path $dest)) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
    }
    Copy-Item "$($_.FullName)\*" $dest -Recurse -Force
    Write-Info "  $($_.Name)/"
}
Write-Success "Skills 复制完成 (5个)"

# 显示 hooks 配置提示
Write-Warn "Hooks 配置需要手动合并到 ~/.claude/settings.json"
Write-Info "Hooks 配置文件: $ProjectRoot\hooks\hooks.json"

# 完成
Write-Host ""
Write-Success "=============================================="
Write-Success "LCYF Claude Code v2.0.0 安装完成!"
Write-Success "=============================================="
Write-Host ""
Write-Info "已安装组件:"
Write-Info "  - 8 个 Agents"
Write-Info "  - 13 个 Commands"
Write-Info "  - 12 个 Rules"
Write-Info "  - 5 个 Skills"
Write-Host ""
Write-Info "使用方法:"
Write-Info "  1. 打开 Claude Code"
Write-Info "  2. 输入 /lcyf-新功能 开始开发"
Write-Info "  3. 输入 /lcyf-代码审查 进行代码审查"
Write-Host ""
Write-Info "文档: $ProjectRoot\docs\快速开始.md"
