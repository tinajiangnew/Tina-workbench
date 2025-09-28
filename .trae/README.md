# Supabase MCP 配置说明

## 项目概述
本项目已配置专属的 Supabase MCP 服务器，实现项目级别的数据库连接和管理。

## 配置文件说明

### 1. MCP 服务器配置
- **文件**: `.trae/mcp_servers.json`
- **用途**: 定义 Supabase MCP 服务器连接参数
- **模式**: 只读模式（readonly）

### 2. 项目配置
- **文件**: `.trae/project.json`
- **用途**: Trae IDE 项目级配置
- **功能**: 启用 MCP 集成和 Supabase 连接

### 3. 详细配置
- **文件**: `.trae/mcp_config.json`
- **用途**: MCP 服务器详细配置和权限设置
- **安全**: 限制为只读操作

### 4. 环境变量
- **文件**: `.env.local`
- **用途**: 存储项目专属的 Supabase 凭据
- **安全**: 已添加到 .gitignore，不会提交到版本控制

## 安全特性

### 只读模式
- ✅ 允许: SELECT, DESCRIBE, EXPLAIN, SHOW
- ❌ 禁止: INSERT, UPDATE, DELETE, CREATE, DROP, ALTER

### 项目隔离
- 配置仅在当前项目生效
- 不影响其他项目的 MCP 设置
- 独立的环境变量管理

## 使用方法

1. **启动 Trae IDE**: MCP 服务器将自动启动
2. **数据库查询**: 使用自然语言与 Supabase 数据库交互
3. **安全保障**: 所有操作限制在只读模式

## 项目信息
- **项目名称**: personal-workspace
- **Supabase 项目**: supqfaoyuoswfthddrue
- **MCP 模式**: 只读 (readonly)
- **配置版本**: 1.0.0

## 注意事项
- 请勿将 `.env.local` 文件提交到版本控制
- 如需修改权限，请编辑 `.trae/mcp_config.json`
- 配置更改后需要重启 Trae IDE 生效