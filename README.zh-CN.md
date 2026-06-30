# Pulaude

[English](./README.md)

Pulse for Claude -- Claude Code 实时可视化状态指示器。

Pulaude 通过 Claude Code 的生命周期事件钩子，在浏览器中渲染一个动态脉冲光球。光球的颜色、光晕、粒子密度和脉冲频率会随着 Claude 当前的操作状态而变化 -- 思考、读取文件、编写代码、执行命令、等待授权等。

## 架构

```
Claude Code  →  pulaude-hook.cjs  →  Bun 服务器  →  WebSocket  →  浏览器 (Canvas)
(生命周期事件)    (node, 读取 stdin)      (端口 3847)                   (粒子引擎)
```

三个层级：

- **Hook** -- Node.js 脚本 (`hooks/pulaude-hook.cjs`)，通过读取 stdin JSON 捕获 Claude Code 的生命周期事件，并将状态变化 POST 到服务器。自动启动脚本 (`hooks/auto-start.cjs`) 会在会话开始时自动启动服务器。
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

安装 hooks（追踪 Claude Code 会话）：

```sh
bun run install:hooks
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
  hooks/
    pulaude-hook.cjs       # 主 Hook 入口（读取 stdin，POST 到服务器）
    auto-start.cjs         # SessionStart 时自动启动 Bun 服务器
    install.cjs            # 安装 hooks 到 ~/.claude/settings.json
    uninstall.cjs          # 从 settings.json 移除 hooks
  hooks.json               # Hook 定义（参考/遗留）
  relay.sh                 # Bash 中继脚本（项目级替代方案）
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
1. 复制 `pulaude-hook.cjs` 和 `auto-start.cjs` 到 `~/.claude/pulaude/`
2. 存储项目路径用于自动启动服务器发现
3. 注册 hooks 到 `~/.claude/settings.json`（基于 marker，兼容已有配置）

卸载：

```sh
bun run uninstall:hooks
```

## 配置

Hook 脚本默认指向 `http://localhost:3847/api/state`。可通过 `PULAUDA_RELAY_URL` 环境变量覆盖：

```sh
export PULAUDA_RELAY_URL="http://your-server:3847/api/state"
```

## 开源协议

MIT
