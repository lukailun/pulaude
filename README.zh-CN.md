# Pulaude

[English](./README.md)

Pulse for Claude -- Claude Code 实时可视化状态指示器。

Pulaude 通过 Claude Code 的生命周期事件钩子，在浏览器中渲染一个动态脉冲光球。光球的颜色、光晕、粒子密度和脉冲频率会随着 Claude 当前的操作状态而变化 -- 思考、读取文件、编写代码、执行命令、等待授权等。

## 架构

```
Claude Code  →  relay.sh  →  Bun 服务器  →  WebSocket  →  浏览器 (Canvas)
(生命周期事件)    (curl POST)        (端口 3847)                   (粒子引擎)
```

三个层级：

- **Hook** -- Bash 脚本 (`relay.sh`)，通过 `hooks.json` 捕获 Claude Code 的生命周期事件，并将状态变化 POST 到服务器。
- **Server** -- 基于 `Bun.serve()` 的 HTTP + WebSocket 服务器 (`server/index.ts`)，接收状态更新并广播给所有已连接的客户端。
- **Web** -- React 19 前端 (`web/`)，使用自定义的 HTML5 Canvas 2D 粒子引擎渲染动态光球。

## 状态说明

| 状态 | 颜色 | 说明 |
|------|------|------|
| `IDLE` | 蓝色 | 等待输入 |
| `THINKING` | 紫色 | 正在处理提示或规划 |
| `READING` | 青色 | 读取文件、搜索或抓取内容 |
| `WRITING` | 橙色 | 编写或编辑代码 |
| `EXECUTING` | 黄色 | 执行 Shell 命令 |
| `WORKING` | 粉色 | 使用技能或工具 |
| `COMPLETE` | 绿色 | 任务完成 |
| `ERROR` | 红色 | 发生错误 |
| `APPROVAL` | 琥珀色 | 等待用户授权 |
| `DISCONNECTED` | 灰色 | 会话已结束 |

## 前置要求

需要安装 [Bun](https://bun.sh)。本项目不使用 Node.js。

## 快速开始

### 开发环境

安装依赖：

```sh
bun install
cd server && bun install && cd ..
cd web && bun install && cd ..
```

启动后端服务器：

```sh
bun run dev:server
```

在另一个终端启动前端开发服务器：

```sh
bun run dev:web
```

在浏览器中打开 http://localhost:5173。

### 生产环境

构建前端并启动服务器：

```sh
bun run build
bun run start
```

应用将在 http://localhost:3847 提供服务。

## 项目结构

```
pulaude/
  hooks.json               # Hook 定义（安装源）
  relay.sh                 # Bash 中继脚本
  shared/types.ts          # 共享 TypeScript 类型
  server/index.ts          # Bun HTTP + WebSocket 服务器
  web/
    src/
      App.tsx              # React 主组件
      connection.ts        # WebSocket 客户端（自动重连）
      engine.ts            # Canvas 2D 粒子动画引擎
      global.css           # 样式
      main.tsx             # React 入口
    index.html             # Vite 入口 HTML
    vite.config.ts         # Vite 配置（含开发代理）
```

## 安装 Hooks（全局）

将 Pulaude 的 hooks 安装到用户级设置，使其追踪**所有** Claude Code 会话（不仅限本项目）。

```sh
bun install
bun run install:hooks
```

脚本会自动：
1. 复制 `hook/relay.sh` 到 `~/.claude/pulaude/`
2. 将 hooks 配置合并到 `~/.claude/settings.json`（兼容已有配置，不会覆盖）

或者手动操作：打开 `~/.claude/settings.json`，将 `hooks.json` 中的 `"hooks"` 键添加进去，并把所有 `$CLAUDE_PROJECT_DIR/hook` 替换为 `~/.claude/pulaude`。

## 配置

中继脚本默认指向 `http://localhost:3847/api/state`。可通过 `CLAUDE_RELAY_URL` 环境变量覆盖：

```sh
export CLAUDE_RELAY_URL="http://your-server:3847/api/state"
```

## 开源协议

MIT
