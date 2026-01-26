# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-26

### Added

#### Agents
- **java-reviewer** - Java code review specialist for Spring Boot best practices
- **api-designer** - API design expert for RESTful specifications
- **db-optimizer** - Database optimization specialist for MySQL performance
- **module-coordinator** - Module dependency management and interface contract verification

#### Skills
- **java-dev** - Spring Boot, Mybatis-plus, exception handling, transaction management
- **database-design** - MySQL optimization, index strategy, pagination
- **api-design** - RESTful rules, unified response structure, OpenAPI documentation
- **module-design** - Dependency management, interface design, breaking change detection
- **lcyf-workflow** - EARS requirement design, technical design, task breakdown

#### Commands
- **lcyf-new-feature** - Complete feature development workflow (requirement → design → implementation → review)
- **lcyf-review** - Java code quality review
- **lcyf-db-review** - Database design review
- **lcyf-api-review** - API design review
- **lcyf-module-check** - Module dependency and interface contract check

#### Rules
- **java-coding-standards.md** - Java naming and style conventions
- **spring-boot-best-practices.md** - Spring Boot annotation and configuration rules
- **database-design-rules.md** - Database table design and index standards
- **api-design-rules.md** - RESTful API design standards

#### Documentation
- **README.md** - Project overview and quick start
- **docs/INSTALLATION.md** - Detailed installation guide
- **docs/USAGE.md** - Comprehensive usage guide
- **CHANGELOG.md** - This file

#### Project Structure
- `.claude-plugin/` - Plugin configuration (plugin.json, marketplace.json)
- `agents/` - Agent definitions
- `skills/` - Skill modules with documentation
- `commands/` - Custom command definitions
- `rules/` - Coding standards and best practices
- `hooks/` - Automation hooks (structure only)
- `templates/` - Code templates (structure only)
- `contexts/` - Context mode definitions (structure only)
- `scripts/` - Setup and utility scripts (structure only)
- `examples/` - Example configurations
- `tests/` - Test suite (structure only)

#### Configuration Files
- `package.json` - NPM package definition
- `.gitignore` - Git ignore rules
- `.claude-plugin/plugin.json` - Claude Code plugin metadata
- `.claude-plugin/marketplace.json` - Plugin marketplace configuration

### Technical Details

#### Supported Stack
- Java 17+
- Spring Boot 3.5.x
- Mybatis-plus 3.x
- MySQL 8.0+
- Redis 7.x
- Maven/Gradle

#### Feature Set
- Complete development workflow from requirements to implementation
- Automated code quality and security checks
- TDD methodology enforcement (minimum 80% test coverage)
- Multi-module dependency management
- Database design optimization
- API design validation
- Security vulnerability detection

#### Integration
- Claude Code Plugin compatibility
- Marketplace integration ready
- Git version control support
- Node.js script automation

---

## Planned Features (v1.1.0)

- [ ] Complete agent implementations
- [ ] Full skill content documentation
- [ ] Hooks and automation scripts
- [ ] Code template library
- [ ] Security checklist automation
- [ ] Performance profiling agent

---

## Planned Features (v1.2.0)

- [ ] Continuous learning functionality
- [ ] Knowledge base accumulation
- [ ] Design decision recording (ADR)
- [ ] Pattern extraction from sessions
- [ ] Performance optimization

---

## Notes

### v1.0.0 Status

This is the initial release (v1.0.0) which includes:
- Core framework and directory structure
- Agent and skill definitions (outlines)
- Command and rule definitions (outlines)
- Comprehensive documentation
- Plugin and marketplace configuration

Full implementation of agents, skills, and automation scripts will be completed in subsequent releases.

### Architecture

The project is based on [everything-claude-code](https://github.com/affaan-m/everything-claude-code) framework and extends it with lcyf-specific agents, skills, and workflows.

### Compatibility

- Minimum Claude Code CLI version: 0.8.0
- Minimum Node.js version: 18.0.0
- Platform support: Windows, macOS, Linux

---

## Migration Guide

### From everything-claude-code

If you were using everything-claude-code:

1. Install lcyf-claude-code
2. Configure project `.claude/CLAUDE.md` to use lcyf components
3. Agents and skills from everything-claude-code still work (inherited)
4. Use lcyf-specific commands for Java development

### Backward Compatibility

lcyf-claude-code maintains compatibility with everything-claude-code:
- All base agents (planner, tdd-guide, code-reviewer) are available
- All base rules and skills can be inherited
- Custom agents and skills can be added alongside lcyf components

---

## Development

### Contributing

Contributions are welcome! Please follow the contribution guidelines in CONTRIBUTING.md.

### Issues and Feedback

Report issues and provide feedback at: [GitHub Issues](https://github.com/a623556943/lcyf-claude-code/issues)

---

## License

MIT License - See LICENSE file for details

---

**Latest Release: v1.0.0 (2026-01-26)**
