# example.ai

一个基于 Next.js 15 构建的现代化 Web 应用程序。

## 技术栈

- **框架**: Next.js 15.2.0 (使用 App Router)
- **语言**: TypeScript
- **UI 框架**: React 19
- **样式**: Tailwind CSS
- **数据库**: Prisma ORM
- **认证**: NextAuth.js 5.0
- **状态管理**: React Query, XState
- **国际化**: next-intl
- **UI 组件**: Radix UI
- **开发工具**: ESLint, Prettier
- **包管理**: pnpm

## 主要特性

- 🚀 基于 Next.js 15 的现代应用架构
- 🔒 集成 NextAuth.js 的用户认证
- 🌐 国际化支持
- 💳 Stripe 支付集成
- 📝 MDX 支持的内容管理
- 🎨 使用 Tailwind CSS 的响应式设计
- 🔍 SEO 优化
- 🛠 TypeScript 类型安全

## 项目结构

```
example.ai/
├── src/                    # 源代码目录
│   ├── app/               # Next.js 应用路由
│   ├── components/        # React 组件
│   ├── controller/        # 控制器逻辑
│   ├── db/               # 数据库相关
│   ├── hooks/            # React Hooks
│   ├── i18n/             # 国际化配置
│   ├── lib/              # 工具库
│   ├── middlewares/      # 中间件
│   ├── services/         # 服务层
│   └── types/            # TypeScript 类型定义
├── prisma/               # Prisma 数据库模型
├── public/              # 静态资源
└── scripts/             # 脚本工具
```

## 开发环境设置

1. 安装依赖：
```bash
pnpm install
```

2. 环境变量配置：
```bash
cp .env.example .env
```

3. 数据库设置：
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

4. 启动开发服务器：
```bash
pnpm dev
```

## 可用的脚本命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 运行生产版本
- `pnpm lint` - 运行代码检查
- `pnpm lint:fix` - 自动修复代码问题
- `pnpm prisma:generate` - 生成 Prisma 客户端
- `pnpm prisma:migrate` - 运行数据库迁移
- `pnpm docker:up` - 启动 Docker 容器

## 环境要求

- Node.js 18+
- pnpm 8+
- Docker (可选，用于开发环境)