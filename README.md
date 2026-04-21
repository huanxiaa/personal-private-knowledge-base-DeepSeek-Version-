# 个人私有知识库问答系统开发技能
#适合全栈node开发者转型AI应用开发的简单demo

## 系统架构

### 技术栈
- **前端**: Vue 3 + Vite + Axios
- **后端**: NestJS
- **知识库**: LangChain.js + Chroma 向量数据库
- **邮件功能**: Nodemailer

### 系统结构
```
private-knowledge-base/
├── frontend/           # 前端项目
│   ├── src/
│   │   ├── components/  # 组件
│   │   │   ├── KnowledgeBase.vue  # 知识库问答组件
│   │   │   └── Email.vue  # 邮件发送组件
│   │   ├── App.vue  # 根组件
│   │   └── main.js  # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── src/                # 后端项目
│   ├── knowledge-base/  # 知识库模块
│   │   ├── knowledge-base.controller.ts
│   │   ├── knowledge-base.module.ts
│   │   └── knowledge-base.service.ts
│   ├── email/           # 邮件模块
│   │   ├── email.controller.ts
│   │   ├── email.module.ts
│   │   └── email.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

## 开发步骤

### 1. 初始化后端项目
1. 创建NestJS项目结构
2. 配置TypeScript
3. 安装必要的依赖

### 2. 实现知识库功能
1. 配置LangChain.js和Chroma向量数据库
2. 实现文档添加功能
3. 实现问题回答功能
4. 预留DeepSeek API接口

### 3. 实现邮件发送功能
1. 配置Nodemailer
2. 实现基本邮件发送功能
3. 实现知识库问答结果邮件发送功能

### 4. 初始化前端项目
1. 创建Vue 3项目结构
2. 配置Vite和代理
3. 安装必要的依赖

### 5. 实现前端界面
1. 创建知识库问答界面
2. 创建邮件发送界面
3. 实现前后端交互

### 6. 整合和测试
1. 启动后端服务器
2. 启动前端服务器
3. 测试系统功能

## 核心功能实现

### 1. 知识库问答功能
- **添加文档**: 将文档内容添加到向量数据库
- **提问**: 从知识库中检索相关信息并生成回答
- **DeepSeek API**: 预留接口，支持使用DeepSeek API进行回答

### 2. 邮件发送功能
- **基本邮件发送**: 发送普通邮件
- **问答结果邮件**: 发送知识库问答结果邮件

## API接口

### 后端API
1. **知识库接口**
   - `POST /api/knowledge-base/add-document`: 添加文档到知识库
   - `POST /api/knowledge-base/ask`: 向知识库提问
   - `POST /api/knowledge-base/ask-deepseek`: 使用DeepSeek API提问

2. **邮件接口**
   - `POST /api/email/send`: 发送邮件
   - `POST /api/email/send-answer`: 发送知识库问答结果邮件

### 前端API调用
- 使用Axios进行HTTP请求
- 处理加载状态和错误信息
- 实现响应式界面

## 技术难点

### 1. RAG技术实现
- 向量数据库的配置和使用
- 文档嵌入和检索
- 问答链的构建

### 2. 前后端整合
- 跨域请求处理
- 数据格式转换
- 错误处理和异常捕获

### 3. 邮件发送配置
- SMTP服务器配置
- 邮件模板设计
- 异步邮件发送处理

## 扩展和优化

### 1. 知识库优化
- 支持更多文档格式
- 实现文档分块和向量化优化
- 添加文档管理功能

### 2. 模型集成
- 集成更多LLM模型
- 实现模型切换功能
- 优化模型参数

### 3. 前端优化
- 实现更丰富的交互效果
- 添加用户认证
- 优化响应速度

## 部署和维护

### 1. 环境配置
- Node.js版本要求: >= 18.0.0
- 环境变量配置
  - `OPENAI_API_KEY`: OpenAI API密钥
  - `EMAIL_USER`: 邮箱用户名
  - `EMAIL_PASS`: 邮箱密码或授权码

### 2. 启动方式
- 后端: `npm run start:dev`
- 前端: `npm run dev`

### 3. 测试和调试
- 使用Postman测试API接口
- 前端开发工具调试
- 后端日志分析

## 总结

本系统实现了一个基于NestJS和Vue 3的私有知识库问答系统，集成了LangChain.js和Chroma向量数据库，支持文档添加、问题回答和邮件发送功能。系统架构清晰，代码结构合理，具有良好的可扩展性和可维护性。

通过本系统的开发，开发者可以学习到：
1. NestJS后端框架的使用
2. Vue 3前端开发
3. LangChain.js和向量数据库的应用
4. RAG技术的实现
5. 前后端整合的最佳实践

系统预留了DeepSeek API接口，方便后续集成更多AI模型，为系统的功能扩展提供了灵活性。
