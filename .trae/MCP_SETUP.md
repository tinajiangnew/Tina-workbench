# Supabase MCP 服务器配置指南

## 概述

本项目已配置专属的 Supabase MCP (Model Context Protocol) 服务器，允许 AI 助手直接与您的 Supabase 数据库交互。

## 项目信息

- **项目名称**: personal-workspace
- **操作系统**: Windows
- **Project Reference**: supqfaoyuoswfthddrue
- **配置模式**: 只读模式（read-only）
- **配置日期**: 2024-12-19

## 文件结构

```
.trae/
├── mcp_config.json           # 主配置文件（包含实际令牌）
├── mcp_config.template.json  # 配置模板（安全版本）
├── .env.mcp                  # 环境变量文件
└── MCP_SETUP.md             # 本说明文档
```

## 配置详情

### 1. MCP 服务器配置

当前配置使用 Supabase 官方 MCP 服务器：

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=supqfaoyuoswfthddrue"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "[已配置]"
      }
    }
  }
}
```

### 2. 安全特性

- ✅ **只读模式**: 配置为 `--read-only`，防止意外的数据修改
- ✅ **项目隔离**: 配置仅在当前项目生效
- ✅ **令牌保护**: 敏感信息已添加到 `.gitignore`
- ✅ **环境变量**: 支持通过环境变量管理敏感信息

### 3. 权限说明

**允许的操作**:
- 查询数据 (SELECT)
- 查看表结构 (DESCRIBE)
- 解释查询计划 (EXPLAIN)
- 显示数据库信息 (SHOW)

**禁止的操作**:
- 插入数据 (INSERT)
- 更新数据 (UPDATE)
- 删除数据 (DELETE)
- 创建表 (CREATE)
- 删除表 (DROP)
- 修改表结构 (ALTER)

## 使用方法

### 在 Trae IDE 中使用

1. **自动加载**: Trae 会自动检测并加载 `.trae/mcp_config.json` 配置
2. **AI 交互**: 您可以直接询问 AI 助手关于数据库的问题
3. **查询数据**: AI 可以帮您查询和分析 Supabase 数据库中的数据

### 示例对话

```
用户: "帮我查看用户表的结构"
AI: [通过 MCP 连接到 Supabase，查询并返回表结构]

用户: "统计一下活跃用户数量"
AI: [执行查询并返回统计结果]
```

## 安全最佳实践

### 1. 访问令牌管理

- 🔒 **定期轮换**: 建议每 3-6 个月轮换一次访问令牌
- 🔒 **最小权限**: 当前配置为只读权限，符合最小权限原则
- 🔒 **环境隔离**: 不同项目使用不同的访问令牌

### 2. 版本控制

- ✅ `.trae/.env.mcp` 已添加到 `.gitignore`
- ✅ 实际令牌不会被提交到代码仓库
- ✅ 提供了 `mcp_config.template.json` 作为安全模板

### 3. 监控和审计

- 📊 在 Supabase Dashboard 中监控 API 使用情况
- 📊 定期检查访问日志
- 📊 如发现异常活动，立即轮换令牌

## 故障排除

### 常见问题

1. **MCP 服务器无法启动**
   - 检查网络连接
   - 验证访问令牌是否有效
   - 确认 Project Reference 是否正确

2. **权限被拒绝**
   - 确认令牌具有项目访问权限
   - 检查是否尝试执行写操作（当前为只读模式）

3. **连接超时**
   - 检查网络连接
   - 验证 Supabase 项目状态

### 获取帮助

- 📖 [Supabase MCP 官方文档](https://supabase.com/docs/guides/getting-started/mcp)
- 🐛 [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
- 💬 [Supabase Discord 社区](https://discord.supabase.com/)

## 配置更新

如需修改配置：

1. **更改权限模式**: 编辑 `mcp_config.json` 中的 `--read-only` 参数
2. **更新令牌**: 修改 `.env.mcp` 文件中的 `SUPABASE_ACCESS_TOKEN`
3. **切换项目**: 更新 `--project-ref` 参数

## 注意事项

- ⚠️ 本配置仅在当前项目 (`personal-workspace`) 中生效
- ⚠️ 切换到其他项目时需要重新配置相应的 MCP 服务器
- ⚠️ 删除 `.trae` 目录将移除所有 MCP 配置

---

*配置完成时间: 2024-12-19*  
*配置版本: 1.0.0*  
*操作系统: Windows*