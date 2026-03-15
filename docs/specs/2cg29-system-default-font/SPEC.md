# 恢复全站系统默认字体（#2cg29）

## 状态

- Status: 已完成
- Created: 2026-03-16
- Last: 2026-03-16

## 背景 / 问题陈述

- 当前项目把 `public/fonts/zpix.ttf` 通过 Next local font 和 Tailwind 全局 `fontFamily.sans` 绑定为默认字体。
- 该像素风字体覆盖了正文、控件和品牌标题，已经偏离当前产品需要的通用系统风格。
- 若继续保留，全站文本可读性、系统一致性和后续样式维护都会持续受影响。

## 目标 / 非目标

### Goals

- 移除全站默认像素字体接线，让 UI 文本恢复系统默认 sans 字体。
- 让品牌标题与普通页面文本统一回退到系统字体。
- 清理不再使用的字体导入、Tailwind token 与字体资源。

### Non-goals

- 不调整配色、布局、动效或组件结构。
- 不修改邮件正文 HTML 的内嵌字体策略。
- 不引入新的第三方字体或新的视觉主题。

## 范围（Scope）

### In scope

- 根布局中的字体变量与字体类清理。
- Tailwind 默认 sans 字体恢复到框架默认值。
- 删除无引用的 `zpix` 字体资源。
- 完成本地验证、PR 创建与 review 收敛所需的最小 spec 同步。

### Out of scope

- 任何 API、数据库、环境变量或国际化文案变更。
- 字体之外的 UI 精修与视觉设计重构。
- 新增 Storybook、视觉回归平台或额外预览基础设施。

## 需求（Requirements）

### MUST

- 项目中不再存在把 `zpix.ttf` 作为全站默认字体的有效接线。
- `body`、默认 `font-sans` 文本和品牌标题都使用系统默认 sans 栈。
- 构建与 lint 可通过，且主要页面无明显文字截断或布局错位。

### SHOULD

- 删除不再被引用的字体文件与辅助代码，避免继续打包无用资源。
- 改动保持最小化，不影响与字体无关的 UI 行为。

### COULD

- 若在验收时发现局部字重/间距问题，可做同一 PR 内的小幅样式修正。

## 功能与行为规格（Functional/Behavior Spec）

### Core flows

- 用户访问首页、认证页、邮箱列表/详情页、分享页时，默认文字应显示为系统 sans 字体，而非像素字。
- 页面品牌字样 `MoeMail` 与其余标题文本保持现有文案和层级，但字体来源改为系统 sans。
- 构建产物中不再注入 `zpix` 相关字体变量或类名。

### Edge cases / errors

- 若字体切换导致个别标题、按钮或输入框出现高度/换行变化，应在同一轮修复中微调到无明显回归。
- 若某处文本明确依赖 `font-mono` 或内联 `system-ui`，保持原有用途不变。

## 接口契约（Interfaces & Contracts）

None

## 验收标准（Acceptance Criteria）

- Given 当前分支完成实现，When 搜索代码库字体接线，Then 不存在有效的 `font-zpix`、`--font-zpix` 或 `localFont(...zpix...)` 默认接线。
- Given 用户打开首页、认证页、邮箱页与分享页，When 页面完成渲染，Then 常见正文、表单、按钮、标题和品牌字样都使用系统默认 sans 字体。
- Given 执行项目既有质量门禁，When 运行 `pnpm lint` 与 `pnpm build`，Then 命令通过且没有因字体改动引入的新错误。

## 实现前置条件（Definition of Ready / Preconditions）

- 目标和非目标已明确。
- 验收标准覆盖主要页面与质量门禁。
- 接口契约确认无变更。
- 主人已确认品牌字样也改回系统默认字体。

## 非功能性验收 / 质量门槛（Quality Gates）

### Testing

- Unit tests: None
- Integration tests: None
- E2E tests (if applicable): 通过本地浏览器人工验收关键页面字体表现。

### UI / Storybook (if applicable)

- Stories to add/update: None
- Visual regression baseline changes (if any): None

### Quality checks

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm build`

## 文档更新（Docs to Update）

- `docs/specs/README.md`: 登记该规格并维护状态。

## 计划资产（Plan assets）

- Directory: `docs/specs/2cg29-system-default-font/assets/`
- In-plan references: `![...](./assets/<file>.png)`
- PR visual evidence source: maintain `## Visual Evidence (PR)` in this spec when PR screenshots are needed.
- If an asset must be used in impl (runtime/test/official docs), list it in `资产晋升（Asset promotion）` and promote it to a stable project path during implementation.

## Visual Evidence (PR)

## 资产晋升（Asset promotion）

None

## 实现里程碑（Milestones / Delivery checklist）

- [x] M1: 新增字体恢复 spec 并登记索引。
- [x] M2: 移除全局像素字体接线并清理无用字体资源。
- [x] M3: 完成本地验证、PR 创建与 review 收敛。

## 方案概述（Approach, high-level）

- 保持实现边界聚焦在全局字体入口：根布局、Tailwind 默认字体配置和无用字体资源。
- 以最小样式改动恢复系统默认 sans，不新增替代字体方案。
- 若 review 或人工验收暴露字体度量差异，仅做与该差异直接相关的小范围修正。

## 风险 / 开放问题 / 假设（Risks, Open Questions, Assumptions）

- 风险：系统字体与像素字体的字宽不同，可能导致局部换行或按钮高度变化。
- 需要决策的问题：None
- 假设（需主人确认）：品牌标题应与正文一并恢复为系统默认 sans。

## 变更记录（Change log）

- 2026-03-16: 初版规格，冻结为字体恢复专项交付。
- 2026-03-16: 完成全站系统字体恢复，提交 PR #8 并完成一次无阻塞 review 收敛。

## 参考（References）

- `app/[locale]/layout.tsx`
- `app/fonts.ts`
- `tailwind.config.ts`
