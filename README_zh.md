# Kindle2Notion

![Platform](https://img.shields.io/badge/platform-Windows-lightgrey?style=flat-square)
![License](https://img.shields.io/github/license/Sakuraxx/Kindle2Notion?style=flat-square)
![Built with Tauri](https://img.shields.io/badge/built_with-Tauri_v2-24C8DB?style=flat-square&logo=tauri)

> 一款轻量级的 Windows 桌面应用程序，旨在将您的 Kindle 标注（`My Clippings.txt`）无缝增量同步到 Notion 数据库。

[**🇺🇸 English Documentation**](./README.md)

## 功能特性

- **增量同步**：智能去重机制确保仅上传新的标注。工具会将本地文件与 Notion 现有数据进行比对，防止覆盖或重复创建条目。
- **隐私优先**：完全在您的本地机器上运行。您的数据直接通过 API 发送至 Notion，不经过任何第三方服务器。
- **选择性同步**：在同步前预览您的标注。您可以完全控制并勾选具体需要上传的条目。

## 前置准备

在使用 Kindle2Notion 之前，您需要先配置好 Notion 工作区：

1.  **获取 Notion 集成令牌 (Token)**:
    - 访问 [Notion Internal integrations](https://www.notion.so/profile/integrations/internal) 页面。
    - 创建一个新的集成 (Integration)，并复制 `Internal Integration Secret`。
    ![GetNotionIntegrationToken_Step1](./assets/GetNotionIntegrationToken_Step1.png)
    ![GetNotionIntegrationToken_Step2](./assets/GetNotionIntegrationToken_Step2.png)
    ![GetNotionIntegrationToken_Step3](./assets/GetNotionIntegrationToken_Step3.png)

2.  **准备数据库 (Database)**:
    - 在 Notion 中创建一个新的数据库。
    - 确保数据库至少包含以下属性：
        - `Title` (类型: Title/标题) - 用于书籍名称。
        - `Author` (类型: Text/文本) - 用于作者姓名。
    - 复制数据库 ID (Database ID)。
    ![PrepareDatabase_Step1](./assets/PrepareDatabase_Step1.png)
    ![PrepareDatabase_Step2](./assets/PrepareDatabase_Step2.png)

3.  **授权连接**:
    - 打开您的 Notion 数据库页面。
    - 点击右上角的 `...` 菜单 -> **Connections** (连接)。
    - 搜索并选择您在第 1 步中创建的集成 (Integration)。
    ![AuthorizeConnection_Step1](./assets/AuthorizeConnection_Step1.png)

## 安装与下载

### 方式一：下载安装包 (推荐)
请前往 **[Releases 页面](https://github.com/Sakuraxx/Kindle2Notion/releases)** 下载最新的 `.exe` 安装程序。

### 方式二：源码构建
如果您是开发者并想自己编译：

```bash
# 1. 克隆仓库
git clone https://github.com/Sakuraxx/Kindle2Notion.git
cd Kindle2Notion

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm run tauri dev

# 4. 构建生产版本
npm run tauri build
```
## 使用指南
1. 输入您的 API Key 和 Database ID，然后保存。
![alt text](./assets/HowToUse_EnterKey.png)

2. 点击 "Import" (导入) 按钮，选择并打开您的 My Clippings.txt 文件。
![alt text](./assets/HowToUse_Import.png)

3. 点击 "Compare" (比较) 按钮。工具将从 Notion 获取现有数据，与本地文件进行比对，并自动剔除重复项。

4. 勾选您想要同步的标注，然后点击 "Sync" (同步) 按钮将其上传到 Notion。
![alt text](./assets/HowToUse_Sync.png)
![alt text](./assets/HowToUse_SyncResult.png)

## 技术栈
本项目采用现代化的分层架构构建：
* 核心框架: Tauri v2 (基于 Rust 的高性能后端与 Web 前端)。
* 前端: React 19 + TypeScript + Vite。
* 核心库:
    * `@tauri-apps/plugin-fs & plugin-dialog`: 用于原生文件系统访问。
    * `@notionhq/client`: 官方 Notion SDK。

##  许可证
[MIT](https://opensource.org/licenses/MIT) © 2026 Cactus