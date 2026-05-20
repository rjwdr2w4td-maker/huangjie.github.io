# 种子质量监管系统 - 项目上下文

## 项目概述

种子质量监管系统，覆盖制种企业备案、监督扦样、实验室检验、全流程追踪、结果分析、系统管理六大业务模块。支持县级/乡镇种子管理人员、检验室人员、制种企业、系统管理员五种角色。

## 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Theme**: teal 配色 + business 字体 + cool 阴影

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── page.tsx        # 首页 (重定向至 /dashboard)
│   │   ├── layout.tsx      # 根布局
│   │   ├── dashboard-page.tsx  # 仪表盘内容
│   │   ├── filing/         # 模块1: 基础信息与备案管理
│   │   │   ├── enterprises/    # 企业备案
│   │   │   ├── contracts/      # 合同备案
│   │   │   ├── parent-seeds/   # 亲本种子备案
│   │   │   └── township-details/ # 乡镇制种明细表
│   │   ├── sampling/       # 模块2: 种子监督扦样管理
│   │   │   ├── parent-inspection/ # 亲本种子抽检
│   │   │   ├── sowing-inspection/ # 播种期抽检
│   │   │   ├── leaf-inspection/   # 叶片期抽检
│   │   │   └── tasks/            # 抽检任务管理
│   │   ├── inspection/     # 模块3: 种子检验管理
│   │   │   ├── receiving/   # 样品接收
│   │   │   ├── data-entry/  # 检验数据录入
│   │   │   ├── reports/     # 检验报告生成
│   │   │   ├── retest/      # 复检管理
│   │   │   └── self-test/   # 企业自检数据上报
│   │   ├── tracking/       # 模块4: 质量监督检验全流程管理
│   │   │   ├── lifecycle/   # 样品生命周期跟踪
│   │   │   ├── query/       # 检验数据综合查询
│   │   │   └── archive/     # 报告归档与查询
│   │   ├── analysis/       # 模块5: 种子质量监督检验结果分析
│   │   │   ├── map/         # 抽检结果可视化地图
│   │   │   ├── statistics/  # 统计分析报表
│   │   │   └── alerts/      # 阳性地块预警
│   │   └── system/         # 模块6: 系统管理
│   │       ├── users/       # 用户权限管理
│   │       ├── dictionary/  # 数据字典
│   │       ├── logs/        # 操作日志
│   │       └── app-version/ # APP版本管理
│   ├── components/
│   │   ├── ui/             # Shadcn UI 组件库
│   │   ├── dashboard-layout.tsx  # 仪表盘全局布局 (侧边栏+顶栏)
│   │   └── sub-page-layout.tsx   # 子页面通用布局
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   ├── storage/database/   # Supabase 数据库
│   │   ├── supabase-client.ts  # Supabase 客户端
│   │   └── shared/schema.ts    # Drizzle ORM Schema
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

常用命令：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码
- 禁止隐式 `any` 和 `as any`
- 函数参数、返回值、解构项、事件对象在使用前应有明确类型
- 清理未使用的变量和导入

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 `path.resolve(__dirname, ...)` 动态拼接

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 `typeof window`、`Date.now()`、`Math.random()` 等动态数据
2. 必须使用 `'use client'` 并配合 `useEffect` + `useState` 确保动态内容仅在客户端挂载后渲染
3. 严禁非法 HTML 嵌套（如 `<p>` 嵌套 `<div>`）

### UI 设计与组件规范

- 模板默认预装核心组件库 `shadcn/ui`，位于 `src/components/ui/` 目录下
- 必须默认采用 shadcn/ui 组件、风格和规范
- 禁止硬编码颜色，使用 `globals.css` 中的主题变量（`bg-background`, `text-foreground` 等）
- 禁止硬编码圆角，使用 `rounded-md`, `rounded-lg` 等
- 禁止 AI 味渐变色（purple、indigo 渐变）

## 数据库 Schema

核心业务表包括：
- `enterprise_registration` - 企业备案
- `seed_contract` - 制种合同备案
- `parent_seed_info` - 亲本种子信息备案
- `township_detail` - 乡镇制种明细
- `sampling_task` - 抽检任务
- `sampling_record` - 扦样记录 (含 geometry 字段)
- `sample_reception` - 样品接收
- `test_result` - 检测结果
- `inspection_report` - 检验报告
- `retest_task` - 复检任务
- `enterprise_self_test` - 企业自检数据
- `alert_notification` - 预警通知
- `sys_user` - 系统用户
- `data_dictionary` - 数据字典
- `operation_log` - 操作日志

## 构建与测试

- 类型检查：`pnpm ts-check`
- 代码规范检查：`pnpm lint` / `pnpm lint:build`
- 开发环境：`coze dev` (端口 5000)
- 构建：`coze build`
- 生产环境：`coze start`

## 业务流程

核心叶片抽检流程：
1. 乡镇上报明细表 → 县级汇总
2. 县级随机生成抽检明细表（系统自动选点，保密）
3. 管理人员携带任务到达地块 → APP拍照（含经纬度）→ 填写扦样单
4. 样品送检 → 实验室录入结果 → 阳性则触发复检
5. 生成报告 → 归档 → 可视化地图更新
