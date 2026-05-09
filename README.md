# DeepFocus - 智能生产力专注工具

## 项目简介
DeepFocus 是一款专为学生和职场人士设计的考研/办公级生产力工具。它结合了经典的番茄钟工作法与现代 AI 技术，旨在通过科学的时间管理和智能的任务规划，帮助用户进入深度专注状态。

## 核心功能
- **智能番茄钟**：带有呼吸感动画的计时器，支持专注、短休、长休模式。
- **AI 任务拆分**：集成 DeepSeek API，一键将复杂的学习目标拆解为可执行的子任务。
- **可视化统计**：包含 7 天专注趋势图和年度专注热力图，直观展示进步。
- **本地持久化**：所有数据存储在用户浏览器本地（IndexedDB），隐私安全，无需注册。
- **备份与恢复**：支持将所有数据导出为 JSON 文件，并随时恢复。

## 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS + Framer Motion (动画)
- **数据可视化**: ECharts
- **本地存储**: IndexedDB (idb)
- **状态管理**: Zustand

## AI 工具合规性说明
本项目仅使用大赛指定的国产 AI 工具：**DeepSeek API (版本: deepseek-chat)**。
- 接口地址: `https://api.deepseek.com/v1/chat/completions`
- 用途: 智能任务拆分、学习计划生成。

## 部署说明 (腾讯云 EdgeOne Pages)
本项目已针对 **腾讯云 EdgeOne Pages** 进行优化，AI 代理通过边缘函数运行：
1. 将代码推送至您的代码仓库（GitHub/GitLab/Gitee）。
2. 在腾讯云 EdgeOne 控制台进入 **站点加速** -> **边缘函数** 或 **Pages**。
3. 关联您的仓库并创建项目。
4. **关键配置**：在项目设置的 **环境变量** 中添加 `DEEPSEEK_API_KEY`，值为您的 DeepSeek API 密钥。
5. EdgeOne 访问时会自动识别 `/functions` 目录下的边缘函数处理 `/api/deepseek` 请求。

## 快速开始
1. 安装依赖: `npm install`
2. 配置 API Key: 在 `.env` 文件中添加 `DEEPSEEK_API_KEY=你的密钥`
3. 启动开发服务器: `npm run dev`
4. 构建生产版本: `npm run build`

## 开发者
DeepFocus 团队
2026年4月
