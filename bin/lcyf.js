#!/usr/bin/env node
/**
 * LCYF Claude Code CLI
 * Java团队智能开发系统命令行工具
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const VERSION = '2.0.0';
const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// 命令处理
const commands = {
  // 显示版本
  version: () => {
    console.log(`lcyf-claude-code v${VERSION}`);
  },

  // 显示帮助
  help: () => {
    console.log(`
LCYF Claude Code - Java团队智能开发系统 v${VERSION}

用法:
  lcyf <command> [options]

命令:
  init [path]     初始化项目配置
  install         安装组件到 ~/.claude/
  uninstall       卸载已安装的组件
  status          显示安装状态
  validate        验证配置
  docs            打开文档
  version         显示版本号
  help            显示帮助

示例:
  lcyf init                    # 在当前目录初始化
  lcyf init ./my-project       # 在指定目录初始化
  lcyf install                 # 安装组件
  lcyf status                  # 查看状态

更多信息: https://github.com/a623556943/lcyf-claude-code
`);
  },

  // 安装组件
  install: () => {
    log.info(`开始安装 LCYF Claude Code v${VERSION}...`);

    // 创建目录
    const dirs = ['agents', 'commands', 'rules', 'skills'];
    dirs.forEach(dir => {
      const targetDir = path.join(CLAUDE_DIR, dir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        log.info(`创建目录: ${targetDir}`);
      }
    });

    // 复制文件
    const components = [
      { name: 'Agents', src: 'agents', pattern: /\.md$/ },
      { name: 'Commands', src: 'commands', pattern: /\.md$/ },
      { name: 'Rules', src: 'rules', pattern: /\.md$/ },
    ];

    components.forEach(({ name, src, pattern }) => {
      const srcDir = path.join(PROJECT_ROOT, src);
      const destDir = path.join(CLAUDE_DIR, src);

      if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir).filter(f => pattern.test(f));
        files.forEach(file => {
          fs.copyFileSync(
            path.join(srcDir, file),
            path.join(destDir, file)
          );
        });
        log.success(`${name} 复制完成 (${files.length}个)`);
      }
    });

    // 复制 skills（目录）
    const skillsSrc = path.join(PROJECT_ROOT, 'skills');
    const skillsDest = path.join(CLAUDE_DIR, 'skills');
    if (fs.existsSync(skillsSrc)) {
      const skillDirs = fs.readdirSync(skillsSrc).filter(f =>
        fs.statSync(path.join(skillsSrc, f)).isDirectory()
      );
      skillDirs.forEach(dir => {
        const srcPath = path.join(skillsSrc, dir);
        const destPath = path.join(skillsDest, dir);
        copyDirSync(srcPath, destPath);
      });
      log.success(`Skills 复制完成 (${skillDirs.length}个)`);
    }

    log.warn('Hooks 配置需要手动合并到 ~/.claude/settings.json');

    console.log('\n');
    log.success('='.repeat(50));
    log.success(`LCYF Claude Code v${VERSION} 安装完成!`);
    log.success('='.repeat(50));
    console.log(`
使用方法:
  1. 打开 Claude Code
  2. 输入 /lcyf-新功能 开始开发
  3. 输入 /lcyf-代码审查 进行代码审查
`);
  },

  // 卸载组件
  uninstall: () => {
    log.info('开始卸载...');

    // 删除 agents
    const agentFiles = [
      '01-规划专家.md', '02-架构专家.md', '03-Java开发专家.md',
      '04-模块协调专家.md', '05-代码审查专家.md', '06-安全审查专家.md',
      '07-测试专家.md', '08-学习代理.md'
    ];
    deleteFiles(path.join(CLAUDE_DIR, 'agents'), agentFiles);

    // 删除 commands
    const commandsDir = path.join(CLAUDE_DIR, 'commands');
    if (fs.existsSync(commandsDir)) {
      const commandFiles = fs.readdirSync(commandsDir).filter(f => f.startsWith('lcyf-'));
      deleteFiles(commandsDir, commandFiles);
    }

    // 删除 rules
    const ruleFiles = [
      '00-总则.md', '01-Java开发规范.md', '02-API设计规范.md',
      '03-Git工作流.md', '04-性能优化.md'
    ];
    deleteFiles(path.join(CLAUDE_DIR, 'rules'), ruleFiles);

    // 删除 skills
    const skillDirs = ['workflows', 'java-full-stack', 'modular-monolith', 'continuous-learning', 'verification-loop'];
    skillDirs.forEach(dir => {
      const skillPath = path.join(CLAUDE_DIR, 'skills', dir);
      if (fs.existsSync(skillPath)) {
        fs.rmSync(skillPath, { recursive: true });
        log.info(`删除: ${skillPath}`);
      }
    });

    log.success('卸载完成!');
  },

  // 显示状态
  status: () => {
    console.log(`\nLCYF Claude Code v${VERSION} 状态\n`);

    const checkDir = (name, dir, pattern) => {
      const fullPath = path.join(CLAUDE_DIR, dir);
      if (!fs.existsSync(fullPath)) {
        console.log(`  ${colors.red}✗${colors.reset} ${name}: 未安装`);
        return 0;
      }
      const files = fs.readdirSync(fullPath).filter(f => pattern.test(f));
      console.log(`  ${colors.green}✓${colors.reset} ${name}: ${files.length}个`);
      return files.length;
    };

    console.log('已安装组件:');
    const agents = checkDir('Agents', 'agents', /^\d+-.*\.md$/);
    const commands = checkDir('Commands', 'commands', /^lcyf-.*\.md$/);
    const rules = checkDir('Rules', 'rules', /^\d+-.*\.md$/);

    // 检查 skills
    const skillsPath = path.join(CLAUDE_DIR, 'skills');
    const expectedSkills = ['workflows', 'java-full-stack', 'modular-monolith', 'continuous-learning', 'verification-loop'];
    const installedSkills = expectedSkills.filter(s => fs.existsSync(path.join(skillsPath, s)));
    console.log(`  ${installedSkills.length > 0 ? colors.green + '✓' : colors.red + '✗'}${colors.reset} Skills: ${installedSkills.length}个`);

    console.log(`\n配置目录: ${CLAUDE_DIR}`);
    console.log(`项目目录: ${PROJECT_ROOT}\n`);
  },

  // 验证配置
  validate: () => {
    log.info('正在验证配置...\n');

    let hasError = false;

    // 检查项目文件
    const requiredFiles = [
      'CLAUDE.md',
      'package.json',
      'agents',
      'commands',
      'rules',
      'skills',
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(PROJECT_ROOT, file);
      if (fs.existsSync(filePath)) {
        log.success(`${file} 存在`);
      } else {
        log.error(`${file} 缺失`);
        hasError = true;
      }
    });

    // 检查组件数量
    console.log('\n组件统计:');
    const counts = {
      agents: fs.readdirSync(path.join(PROJECT_ROOT, 'agents')).filter(f => f.endsWith('.md')).length,
      commands: fs.readdirSync(path.join(PROJECT_ROOT, 'commands')).filter(f => f.endsWith('.md')).length,
      rules: fs.readdirSync(path.join(PROJECT_ROOT, 'rules')).filter(f => f.endsWith('.md')).length,
      skills: fs.readdirSync(path.join(PROJECT_ROOT, 'skills')).filter(f =>
        fs.statSync(path.join(PROJECT_ROOT, 'skills', f)).isDirectory()
      ).length,
    };

    console.log(`  Agents: ${counts.agents}`);
    console.log(`  Commands: ${counts.commands}`);
    console.log(`  Rules: ${counts.rules}`);
    console.log(`  Skills: ${counts.skills}`);

    console.log('\n');
    if (hasError) {
      log.error('验证失败，请检查缺失的文件');
      process.exit(1);
    } else {
      log.success('所有配置验证通过!');
    }
  },

  // 初始化项目
  init: (targetPath) => {
    const targetDir = targetPath ? path.resolve(targetPath) : process.cwd();
    log.info(`初始化项目: ${targetDir}`);

    // 创建 .lcyf 目录
    const lcyfDir = path.join(targetDir, '.lcyf');
    if (!fs.existsSync(lcyfDir)) {
      fs.mkdirSync(lcyfDir, { recursive: true });
    }

    // 创建配置文件
    const configPath = path.join(lcyfDir, 'config.json');
    const config = {
      version: VERSION,
      project: {
        name: path.basename(targetDir),
        javaVersion: '17',
        buildTool: 'maven',
      },
      features: {
        continuousLearning: true,
        autoVerification: true,
        codeReview: true,
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log.success(`配置文件已创建: ${configPath}`);

    // 复制 CLAUDE.md 到项目根目录
    const claudeMdSrc = path.join(PROJECT_ROOT, 'CLAUDE.md');
    const claudeMdDest = path.join(targetDir, 'CLAUDE.md');
    if (fs.existsSync(claudeMdSrc) && !fs.existsSync(claudeMdDest)) {
      fs.copyFileSync(claudeMdSrc, claudeMdDest);
      log.success(`CLAUDE.md 已复制到项目根目录`);
    }

    // 更新 .gitignore
    const gitignorePath = path.join(targetDir, '.gitignore');
    const lcyfIgnore = '\n# LCYF Claude Code\n.lcyf/learned-patterns/\n.lcyf/instincts/\n';
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      if (!content.includes('.lcyf/')) {
        fs.appendFileSync(gitignorePath, lcyfIgnore);
        log.success('.gitignore 已更新');
      }
    } else {
      fs.writeFileSync(gitignorePath, lcyfIgnore);
      log.success('.gitignore 已创建');
    }

    console.log('\n');
    log.success('项目初始化完成!');
    console.log(`
下一步:
  1. 运行 'lcyf install' 安装组件到 ~/.claude/
  2. 在 Claude Code 中打开项目
  3. 输入 /lcyf-新功能 开始开发
`);
  },

  // 打开文档
  docs: () => {
    const docsPath = path.join(PROJECT_ROOT, 'docs', '快速开始.md');
    log.info(`文档位置: ${docsPath}`);

    // 尝试用默认程序打开
    const platform = os.platform();
    try {
      if (platform === 'win32') {
        execSync(`start "" "${docsPath}"`, { stdio: 'ignore' });
      } else if (platform === 'darwin') {
        execSync(`open "${docsPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`xdg-open "${docsPath}"`, { stdio: 'ignore' });
      }
    } catch (e) {
      log.warn('无法自动打开文档，请手动打开上述路径');
    }
  },
};

// 工具函数
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src);
  entries.forEach(entry => {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function deleteFiles(dir, files) {
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log.info(`删除: ${filePath}`);
    }
  });
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'version':
    case '-v':
    case '--version':
      commands.version();
      break;
    case 'help':
    case '-h':
    case '--help':
      commands.help();
      break;
    case 'install':
      commands.install();
      break;
    case 'uninstall':
      commands.uninstall();
      break;
    case 'status':
      commands.status();
      break;
    case 'validate':
      commands.validate();
      break;
    case 'init':
      commands.init(args[1]);
      break;
    case 'docs':
      commands.docs();
      break;
    default:
      log.error(`未知命令: ${command}`);
      console.log("运行 'lcyf help' 查看可用命令");
      process.exit(1);
  }
}

main();
