# MoeMail Cloudflare 首发上线（#82u35）

## 状态

- Status: 待实现
- Created: 2026-03-15
- Last: 2026-03-15

## 背景 / 问题陈述

- 当前仓库已有 Cloudflare Pages / D1 / KV / Email Worker 的部署基础，但首发生产配置仍缺少 GitHub-only 登录、站点域名、Pages 运行时变量与上线操作文档。
- 现有 workflow 与部署脚本没有把 `NEXT_PUBLIC_BASE_URL`、`AUTH_TRUST_HOST` 等生产必需变量贯通到 Cloudflare Pages。
- 登录页仍暴露 Google 与用户名密码路径，不符合本次首发的 GitHub-only 决策。

## 目标 / 非目标

### Goals

- 将项目生产站点固定部署到 `moemail.ivanli.cc`。
- 将临时邮箱域名固定为 `mail-tw.707079.xyz`、`mail-us.707079.xyz`、`mail-tw.707979.xyz`、`mail-us.707979.xyz`。
- 将生产登录方式收敛为 GitHub-only，并保证部署脚本与 GitHub Actions 可复用。
- 交付一份可执行的生产操作规格，覆盖 GitHub Secrets、Cloudflare、Resend 与验收步骤。

### Non-goals

- 本次不启用 Turnstile。
- 本次不设计 Google OAuth 回归方案。
- 本次不重构数据库 schema 或权限系统。

## 范围（Scope）

### In scope

- GitHub-only 登录改造。
- Pages / D1 / KV / Worker 的部署脚本修正。
- GitHub Actions 生产环境变量契约补齐。
- Cloudflare Email Routing 与 Resend 子域验证的首发操作规范。

### Out of scope

- Turnstile 上线。
- 自定义邮件发信模板。
- 多环境（staging / preview）发布体系。

## 需求（Requirements）

### MUST

- 登录页只提供 GitHub 登录。
- `NEXT_PUBLIC_BASE_URL` 必须固定为 `https://moemail.ivanli.cc`。
- `AUTH_TRUST_HOST=true` 必须进入 workflow 构建环境与 Pages 运行时。
- Pages 自定义域名必须在项目首次创建与后续重复部署时都可对齐到 `moemail.ivanli.cc`。
- 部署脚本必须不再依赖 Google OAuth 变量。
- 生产验收必须覆盖 4 个邮箱子域的收件与发件。

### SHOULD

- 部署脚本对既有 Cloudflare 资源保持幂等。
- 文档明确 GitHub Secrets、Cloudflare、Resend 的操作顺序。

### COULD

- 在 README 中同步首发所需环境变量与 GitHub-only 说明。

## 功能与行为规格（Functional/Behavior Spec）

### Core flows

- 管理员通过 GitHub Actions `workflow_dispatch` 从 `main` 手动触发生产部署。
- workflow 运行部署脚本，确保 D1、KV、Pages 项目与两个 Worker 均已就绪，并把 GitHub-only 相关运行时变量推送到 Pages。
- 用户访问 `moemail.ivanli.cc` 时只能看到 GitHub 登录入口。
- 管理员首登后初始化 Emperor，并在站点后台写入邮箱域名列表与 Resend 发件配置。
- Cloudflare Email Routing 把 4 个 `mail-*` 子域的邮件 Catch-all 转发到收件 Worker。

### Edge cases / errors

- 若 Pages 自定义域名已存在，则部署脚本应视为已配置，不重复失败。
- 若 GitHub-only 必需变量缺失，则部署脚本必须直接失败，阻止错误上线。
- 若 Cloudflare / Resend 子域 DNS 未完成验证，则生产验收不能标记完成。

## 接口契约（Interfaces & Contracts）

### 接口清单（Inventory）

| 接口（Name） | 类型（Kind） | 范围（Scope） | 变更（Change） | 契约文档（Contract Doc） | 负责人（Owner） | 使用方（Consumers） | 备注（Notes） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/auth/register` | HTTP API | external | Modify | None | auth | login page / external callers | 改为拒绝用户名注册 |
| `AUTH_GITHUB_*`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `NEXT_PUBLIC_BASE_URL` | runtime env | internal | Modify | None | deploy | GitHub Actions / Pages runtime | GitHub-only 生产契约 |

### 契约文档（按 Kind 拆分）

None

## 验收标准（Acceptance Criteria）

- Given 生产环境变量已配置
  When 手动运行 Deploy workflow
  Then Pages、D1、KV、Email Worker、Cleanup Worker 均成功完成部署。

- Given 用户访问 `https://moemail.ivanli.cc`
  When 打开登录页
  Then 页面只展示 GitHub 登录入口，不展示 Google 或用户名密码表单。

- Given 管理员已登录并初始化 Emperor
  When 在后台保存 4 个邮箱域名与 Resend 配置
  Then 新创建的临时邮箱只能使用这 4 个域名。

- Given Cloudflare Email Routing 与 Resend DNS 已全部验证
  When 对 4 个 `mail-*` 子域分别执行收件与发件测试
  Then 每个域名至少成功完成 1 次收件与 1 次发件，并在站点中正确展示消息记录。

## 实现前置条件（Definition of Ready / Preconditions）

- Cloudflare 账号对 `ivanli.cc`、`707079.xyz`、`707979.xyz` 均有写权限。
- GitHub 仓库管理员权限可写入 Secrets、触发 Actions、创建 PR。
- GitHub OAuth App 已可使用 `https://moemail.ivanli.cc/api/auth/callback/github`。
- Resend 账号可新增并验证 4 个发信子域。

## 非功能性验收 / 质量门槛（Quality Gates）

### Testing

- `pnpm lint`
- `pnpm run build:pages`
- 至少一轮 Deploy workflow 重跑验证幂等性

### Quality checks

- 部署脚本静态检查通过
- GitHub Actions 日志中无缺失变量或资源冲突错误

## 文档更新（Docs to Update）

- `README.md`: 更新 GitHub-only 与生产环境变量说明。
- `README.zh-CN.md`: 更新 GitHub-only 与生产环境变量说明。

## 计划资产（Plan assets）

- Directory: `docs/specs/82u35-cloudflare-launch/assets/`

## Visual Evidence (PR)

## 资产晋升（Asset promotion）

None

## 实现里程碑（Milestones / Delivery checklist）

- [ ] M1: 建立 `docs/specs/` 并补充本次首发规格。
- [ ] M2: 完成 GitHub-only 登录与注册禁用改造。
- [ ] M3: 完成 Cloudflare 部署脚本与 workflow 变量契约修正。
- [ ] M4: 完成本地 lint/build 校验并修复阻塞问题。
- [ ] M5: 完成 GitHub / Cloudflare / Resend 生产配置、部署与验收。

## 方案概述（Approach, high-level）

- 复用现有 Cloudflare 部署脚本，不改动资源模型，只修正认证模式、运行时变量与 Pages 域名对齐逻辑。
- 浏览器操作仅用于 Cloudflare / Resend 控制台和最终生产站验收；GitHub 仓库与 PR 操作优先通过 GitHub MCP 完成。
- 生产发布以 `workflow_dispatch` 为唯一首发入口，避免在代码合并瞬间自动推生产。

## 风险 / 开放问题 / 假设（Risks, Open Questions, Assumptions）

- 风险：Cloudflare Pages 自定义域名或 Email Routing 子域配置可能因已有 DNS 记录冲突导致验证延迟。
- 风险：Resend 子域验证依赖 SPF / DKIM 传播，可能拖慢首发验收。
- 假设：4 个 `mail-*` 子域可独占用于 MoeMail，不与现有邮件系统并用。

## 变更记录（Change log）

- 2026-03-15: 创建首发生产部署规格，锁定 GitHub-only、Cloudflare 首发域名与 Resend 发件范围。
