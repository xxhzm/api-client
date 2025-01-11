# API Client

这是一个基于 Nuxt 3 构建的现代化前端应用程序。

## 技术栈

- **框架**: Nuxt 3
- **UI 组件库**: Element Plus
- **样式处理**: Less
- **图表库**: ECharts
- **编辑器**: Vditor
- **代码高亮**: highlight.js

## 项目结构

```
├── assets/           # 静态资源文件（CSS、字体等）
├── components/       # 组件目录
│   ├── admin/       # 管理后台相关组件
│   ├── articles/    # 文章相关组件
│   ├── helpers/     # 辅助组件
│   ├── index/       # 首页相关组件
│   └── system/      # 系统级组件
├── pages/           # 页面目录
│   ├── admin/       # 管理后台页面
│   ├── article/     # 文章相关页面
│   ├── doc/         # 文档页面
│   ├── error/       # 错误页面
│   ├── about.vue    # 关于页面
│   ├── articles.vue # 文章列表页
│   ├── index.vue    # 首页
│   ├── links.vue    # 链接页面
│   ├── login.vue    # 登录页面
│   └── map.vue      # 地图页面
├── plugins/         # 插件目录
├── public/          # 公共资源目录
└── middleware/      # 中间件目录
```

## 主要功能

- 用户认证与授权
- 文章管理系统
- 地图功能
- 文档系统
- 后台管理界面
- 友情链接管理

## 开发环境设置

1. 安装依赖：

```bash
yarn install
```

2. 运行开发服务器：

```bash
yarn dev
```

3. 构建生产版本：

```bash
yarn build
```

4. 预览生产版本：

```bash
yarn preview
```

## 配置说明

项目使用了以下主要配置：

- 开发服务器运行在 `0.0.0.0:3000`
- 使用 Element Plus 作为 UI 组件库
- 支持 Less 预处理器
- 关闭了源码映射以优化生产环境性能

## 环境要求

- Node.js
- Yarn 包管理器
- 支持现代浏览器

## 注意事项

- 开发环境和生产环境使用不同的错误处理策略
- 项目使用 TypeScript 进行开发
- 使用 ESLint 和 Prettier 进行代码规范化
