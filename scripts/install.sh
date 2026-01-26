#!/bin/bash
# LCYF Claude Code - macOS/Linux 安装脚本
# 用法: ./scripts/install.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 输出函数
success() { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 显示帮助
show_help() {
    cat << EOF
LCYF Claude Code - 安装脚本

用法:
    ./scripts/install.sh           # 安装到全局 ~/.claude/
    ./scripts/install.sh --uninstall # 卸载

选项:
    --uninstall  卸载已安装的组件
    --help       显示帮助信息
EOF
}

# 解析参数
UNINSTALL=false
for arg in "$@"; do
    case $arg in
        --uninstall)
            UNINSTALL=true
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
    esac
done

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLAUDE_DIR="$HOME/.claude"

info "LCYF Claude Code 安装程序 v2.0.0"
info "项目目录: $PROJECT_ROOT"
info "目标目录: $CLAUDE_DIR"

# 卸载
if [ "$UNINSTALL" = true ]; then
    info "开始卸载..."

    # 删除 agents
    AGENT_FILES=(
        "01-规划专家.md" "02-架构专家.md" "03-Java开发专家.md"
        "04-模块协调专家.md" "05-代码审查专家.md" "06-安全审查专家.md"
        "07-测试专家.md" "08-学习代理.md"
    )
    for file in "${AGENT_FILES[@]}"; do
        if [ -f "$CLAUDE_DIR/agents/$file" ]; then
            rm -f "$CLAUDE_DIR/agents/$file"
            info "删除: $CLAUDE_DIR/agents/$file"
        fi
    done

    # 删除 commands
    rm -f "$CLAUDE_DIR/commands/lcyf-"*.md 2>/dev/null || true
    info "删除: lcyf-*.md commands"

    # 删除 rules
    RULE_FILES=(
        "00-总则.md" "01-安全规范.md" "02-编码风格.md" "03-测试要求.md"
        "04-Git工作流.md" "05-性能优化.md" "06-Java编码规范.md"
        "07-SpringBoot最佳实践.md" "08-MyBatis规范.md" "09-API设计规范.md"
        "10-数据库设计规范.md" "11-模块依赖规范.md"
    )
    for file in "${RULE_FILES[@]}"; do
        if [ -f "$CLAUDE_DIR/rules/$file" ]; then
            rm -f "$CLAUDE_DIR/rules/$file"
            info "删除: $CLAUDE_DIR/rules/$file"
        fi
    done

    # 删除 skills
    SKILL_DIRS=("workflows" "java-full-stack" "modular-monolith" "continuous-learning" "verification-loop")
    for dir in "${SKILL_DIRS[@]}"; do
        if [ -d "$CLAUDE_DIR/skills/$dir" ]; then
            rm -rf "$CLAUDE_DIR/skills/$dir"
            info "删除: $CLAUDE_DIR/skills/$dir"
        fi
    done

    success "卸载完成!"
    exit 0
fi

# 安装
info "开始安装..."

# 创建目录结构
for dir in agents commands rules skills; do
    mkdir -p "$CLAUDE_DIR/$dir"
done

# 复制 agents
info "复制 Agents..."
cp "$PROJECT_ROOT/agents/"*.md "$CLAUDE_DIR/agents/"
success "Agents 复制完成 (8个)"

# 复制 commands
info "复制 Commands..."
cp "$PROJECT_ROOT/commands/"*.md "$CLAUDE_DIR/commands/"
success "Commands 复制完成 (13个)"

# 复制 rules
info "复制 Rules..."
cp "$PROJECT_ROOT/rules/"*.md "$CLAUDE_DIR/rules/"
success "Rules 复制完成 (12个)"

# 复制 skills
info "复制 Skills..."
for skill_dir in "$PROJECT_ROOT/skills/"*/; do
    skill_name=$(basename "$skill_dir")
    mkdir -p "$CLAUDE_DIR/skills/$skill_name"
    cp -r "$skill_dir"* "$CLAUDE_DIR/skills/$skill_name/"
    info "  $skill_name/"
done
success "Skills 复制完成 (5个)"

# 显示 hooks 配置提示
warn "Hooks 配置需要手动合并到 ~/.claude/settings.json"
info "Hooks 配置文件: $PROJECT_ROOT/hooks/hooks.json"

# 完成
echo ""
success "=============================================="
success "LCYF Claude Code v2.0.0 安装完成!"
success "=============================================="
echo ""
info "已安装组件:"
info "  - 8 个 Agents"
info "  - 13 个 Commands"
info "  - 12 个 Rules"
info "  - 5 个 Skills"
echo ""
info "使用方法:"
info "  1. 打开 Claude Code"
info "  2. 输入 /lcyf-新功能 开始开发"
info "  3. 输入 /lcyf-代码审查 进行代码审查"
echo ""
info "文档: $PROJECT_ROOT/docs/快速开始.md"
