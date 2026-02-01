# 小小API管理系统 - 前端客户端

<p align="center">
  <img src="https://cdn.xxapi.cn/images/xxapi.png" alt="Logo">
</p>


<p align="center">
  <strong>功能完整的API管理与商业化平台前端应用</strong>
</p>

<p align="center">
  集API管理、用户系统、会员体系、支付能力、安全防护、智能运维于一体，<br>
  为企业提供完整的API服务商业化解决方案，快速构建API生态平台。
</p>

---

## 项目简介

本项目是**小小API管理系统**的前端客户端，基于 Nuxt 4 构建的现代化 Web 应用程序。系统提供完整的API生命周期管理能力，支持从接口创建、文档生成到商业化变现的全流程管理。

## 核心功能模块

### 1. API管理中心
- **接口管理** - 完整的API生命周期管理，支持创建、编辑、删除接口
- **代码生成** - 自动生成多语言SDK代码
- **文档中心** - 在线API文档自动生成与展示
- **前缀管理** - 灵活的API路由前缀配置
- **分类管理** - API分类与标签管理

### 2. 用户管理体系
- **用户管理** - 完善的用户注册、登录、信息管理
- **权限控制** - 基于RBAC的角色权限管理系统
- **密钥管理** - API密钥的生成与管理
- **密钥日志** - 密钥使用情况追踪

### 3. 商业化平台
- **在线支付** - 多种支付方式集成
- **订单管理** - 完整的订单生命周期管理
- **套餐系统** - 灵活的API调用套餐配置
- **充值卡系统** - 支持充值卡发放与使用
- **商家入驻** - 第三方商家入驻与佣金管理

### 4. 安全中心
- **身份认证** - 多种身份验证方式
- **权限控制** - 细粒度的功能权限管理
- **API限流** - 接口调用频率限制
- **IP封禁** - 恶意IP自动封禁与管理

### 5. 运维中心
- **数据统计** - 实时数据分析与可视化
- **调用日志** - API调用日志追踪
- **系统日志** - 完整的系统操作日志
- **在线更新** - 系统版本在线更新

### 6. 内容管理系统
- **网站配置** - 站点基础信息配置
- **文章管理** - 公告、帮助文档发布
- **AI文章** - AI辅助文章生成
- **广告管理** - 广告位配置与管理
- **友情链接** - 友链管理
- **邮件系统** - 邮件模板与发送管理

## 技术栈

| 技术领域 | 采用技术 |
|---------|---------|
| 框架 | Nuxt 4 |
| UI组件库 | Element Plus |
| 图表库 | ECharts 6 |
| 富文本编辑器 | TinyMCE 7 |
| 代码高亮 | highlight.js |
| CSS预处理 | Less |
| 图标库 | @element-plus/icons-vue |

## 项目结构

```
api-client/
├── assets/                 # 静态资源
│   ├── css/               # 样式文件
│   ├── images/            # 图片资源
│   └── *.json             # 数据配置文件
├── components/            # 组件目录
│   ├── admin/             # 管理后台组件
│   ├── articles/          # 文章相关组件
│   ├── helpers/           # 辅助组件
│   ├── index/             # 首页组件
│   └── system/            # 系统级组件
├── composables/           # 组合式函数
├── layouts/               # 布局模板
├── middleware/            # 中间件
├── pages/                 # 页面目录
│   ├── admin/             # 管理后台页面
│   │   ├── apilist.vue    # API列表
│   │   ├── userlist.vue   # 用户管理
│   │   ├── package.vue    # 套餐管理
│   │   ├── pay.vue        # 支付配置
│   │   ├── merchant.vue   # 商家入驻
│   │   ├── statistics.vue # 数据统计
│   │   └── ...            # 更多管理页面
│   ├── article/           # 文章详情
│   ├── doc/               # API文档
│   ├── error/             # 错误页面
│   └── *.vue              # 其他页面
├── plugins/               # 插件目录
├── public/                # 公共资源
├── nuxt.config.ts         # Nuxt配置文件
└── package.json           # 项目依赖
```

## 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- Yarn 或 npm 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装依赖

```bash
# 使用 yarn
yarn install

# 或使用 npm
npm install
```

### 开发环境

```bash
# 启动开发服务器
yarn dev

# 服务将运行在 http://localhost:3000
```

### 生产构建

```bash
# 构建生产版本
yarn build
```

## 配置说明

### 开发服务器配置

开发服务器默认配置：
- 主机：`0.0.0.0`（允许局域网访问）
- 端口：`3000`

### 运行时配置

项目通过 `runtimeConfig` 区分开发与生产环境：

```typescript
runtimeConfig: {
  public: {
    isDev: process.env.NODE_ENV === 'development',
  },
}
```

### 源码映射

为优化生产环境性能，默认关闭源码映射：

```typescript
sourcemap: {
  server: false,
  client: false,
}
```

## 页面路由

### 前台页面

| 路由 | 说明 |
|-----|------|
| `/` | 首页 |
| `/login` | 登录页 |
| `/api-market` | API市场 |
| `/doc/[alias]` | API文档 |
| `/articles` | 文章列表 |
| `/article/[id]` | 文章详情 |
| `/merchant` | 商家入驻 |
| `/about` | 关于我们 |
| `/privacy` | 隐私政策 |
| `/terms` | 服务条款 |

### 管理后台

| 路由 | 说明 |
|-----|------|
| `/admin` | 后台首页 |
| `/admin/apilist` | API管理 |
| `/admin/userlist` | 用户管理 |
| `/admin/package` | 套餐管理 |
| `/admin/pay` | 支付配置 |
| `/admin/statistics` | 数据统计 |
| `/admin/webset` | 网站设置 |
| `/admin/rolelist` | 角色管理 |
| `/admin/permissionlist` | 权限管理 |

## 相关链接

- **产品官网**：[https://yunque.cc/api](https://yunque.cc/api)
- **在线演示**：[https://xxapi.cn](https://xxapi.cn)
- **技术文档**：[API管理系统文档](https://www.yuque.com/u58269893/xxapi)

## QQ交流群

欢迎加入QQ交流群，与我们交流技术问题、分享使用经验：

<p align="center">
  <img src="https://cdn.xxapi.cn/images/qrcode_1769932889713.jpg" alt="QQ交流群" width="200">
</p>

## 购买授权

如需购买商业授权，请扫描下方微信二维码联系我们：

<p align="center">
  <img src="https://cdn.xxapi.cn/images/weixin.jpg" alt="微信二维码" width="200">
</p>

## 开源协议

本项目基于 [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) 开源协议。

```
Copyright 2026 山东省云鹊网络科技有限公司

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
