# Vue3 AI 聊天应用

这是一个基于 Vue3、TypeScript 和 Vite 构建的 AI 聊天应用，使用 Pinia 进行状态管理。该应用允许用户与 AI 进行对话交流，支持流式响应，并提供了简洁现代的用户界面。后端使用 Node.js 和 MongoDB 提供聊天历史存储和检索功能。

## 项目结构

```
├── src/                  # 前端源代码目录
│   ├── api/              # API 调用相关
│   │   ├── deepseek.ts   # DeepSeek AI API 集成
│   │   ├── kimi.ts       # Kimi AI API 集成
│   │   └── chatHistory.ts # 聊天历史 API 集成
│   ├── assets/           # 静态资源
│   ├── components/       # Vue 组件
│   │   ├── ChatWindow.vue      # 主聊天窗口组件
│   │   ├── ChatMessage.vue     # 消息显示组件
│   │   ├── ChatInput.vue       # 消息输入组件
│   │   └── ConversationHistory.vue # 对话历史组件
│   ├── store/            # Pinia 状态管理
│   │   └── chat.ts       # 聊天状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口文件
├── backend/              # 后端源代码目录
│   ├── src/              # 后端 TypeScript 源码
│   │   ├── config/       # 配置文件
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   └── index.ts      # 后端入口文件
├── public/               # 公共资源目录
└── index.html            # HTML 入口文件
```

## 前端技术栈

- **前端框架**: Vue 3 (使用 Composition API)
- **状态管理**: Pinia
- **构建工具**: Vite
- **语言**: TypeScript
- **路由**: Vue Router
- **测试工具**: Vitest

## 后端技术栈

- **运行环境**: Node.js
- **框架**: Express
- **数据库**: MongoDB
- **语言**: TypeScript
- **ORM**: Mongoose

## 核心功能

1. **AI 聊天**: 用户可以向 AI 发送消息并获得回复
2. **流式响应**: 支持 AI 回复的逐字显示，提供更好的用户体验
3. **聊天历史**:
   - 前端: 自动保存到本地存储
   - 后端: 持久化存储对话历史到 MongoDB
4. **历史浏览**: 查看和加载历史对话
5. **UI 控制**: 支持全屏显示等视图控制功能

## 快速开始

### 前端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 开发模式启动
npm run dev

# 或构建并启动生产版
npm run build
npm start
```

## 后端 API

后端提供以下 API 端点:

### 会话管理

- `GET /api/conversations` - 获取所有会话
- `GET /api/conversations/:conversationId` - 获取单个会话
- `PATCH /api/conversations/:conversationId` - 更新会话标题

### 消息管理

- `GET /api/messages/:conversationId` - 获取会话的所有消息
- `POST /api/messages` - 保存会话消息
- `DELETE /api/messages/:conversationId` - 删除会话及其消息

## 配置

### 后端环境变量

在 `backend/.env` 文件中配置:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-chat-history
```

## 注意事项

1. 确保 MongoDB 已正确安装并运行
2. 前端默认连接到 `http://localhost:3000` 的后端 API
3. 如需修改后端地址，请在 `src/api/chatHistory.ts` 中更新 `API_BASE_URL`
