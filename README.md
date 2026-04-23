# 🌳 人间碎情书 · 树洞

匿名倾诉树洞网站，暗黑治愈风格。基于腾讯云开发（TCB）。

## 功能清单

| 功能 | 状态 |
|------|------|
| 📝 匿名发秘密 | ✅ |
| ❤️ 点赞 | ✅ |
| 💬 评论/回复 | ✅ |
| 🖼️ 图片上传 | ✅ |
| 🔥 热门/最新排序 | ✅ |
| 🛡️ 举报 + 管理后台 | ✅ |
| 👤 可选登录（微信） | ✅ |
| 🌙/☀️ 深色/浅色主题 | ✅ |
| 📱 响应式设计 | ✅ |
| 📊 实时统计 | ✅ |

## 快速开始

### 1. 开通腾讯云开发

1. 打开 [腾讯云开发控制台](https://console.cloud.tencent.com/tcb)
2. 点击「创建环境」，选择**免费基础版**
3. 记下你的 **环境 ID**（形如 `treehole-xxx`）

### 2. 创建数据库集合

在云开发控制台 → **数据库** 中创建以下集合：

| 集合名 | 用途 |
|--------|------|
| `posts` | 秘密/帖子 |
| `comments` | 评论 |
| `reports` | 举报 |
| `admins` | 管理员 |

### 3. 设置数据库权限

每个集合的权限规则设为：

```json
{
  "read": true,
  "write": "auth.openid != null"
}
```

> 说明：所有人可读，已登录用户可写（匿名登录也包含在内）。

### 4. 开通存储

1. 云开发控制台 → **存储** → **上传文件**
2. 确保存储服务已开启

### 5. 配置网站

打开 `app.js`，替换第一行的环境 ID：

```javascript
const ENV_ID = 'your-env-id';  // ← 换成你的环境 ID
```

### 6. 配置安全域名

在腾讯云开发控制台 → **环境设置** → **安全配置** → **Web 安全域名** 中添加：

- `http://localhost:5500`（本地调试）
- `https://你的用户名.github.io`（线上地址）

### 7. 设置管理员

在数据库的 `admins` 集合中手动添加一条记录：

```json
{
  "uid": "你的用户openid",
  "role": "admin"
}
```

### 8. 部署到 GitHub Pages

```bash
cd tree-hole
git init
git add .
git commit -m "init: 人间碎情书树洞"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

然后去仓库 **Settings → Pages → Source 选 main 分支**。

## 项目结构

```
tree-hole/
├── index.html    # 页面结构
├── style.css     # 样式（暗黑/浅色主题）
├── app.js        # 业务逻辑 + 腾讯云开发集成
└── README.md     # 说明文档
```

## 技术栈

- **前端**：原生 HTML/CSS/JS（零依赖，极简轻量）
- **后端**：腾讯云开发 TCB（数据库 + 存储 + 认证）
- **部署**：GitHub Pages（静态托管）

## 数据库结构

### posts 集合
```json
{
  "content": "秘密内容",
  "emoji": "☁️",
  "category": "随想",
  "imageUrl": "https://...",
  "authorUid": "openid",
  "authorName": "昵称",
  "authorAvatar": "头像URL",
  "deviceId": "dev_xxx",
  "likes": 0,
  "commentCount": 0,
  "reportCount": 0,
  "createdAt": "2026-04-23T...",
  "status": "active"
}
```

### comments 集合
```json
{
  "postId": "帖子ID",
  "content": "评论内容",
  "authorName": "昵称",
  "deviceId": "dev_xxx",
  "createdAt": "2026-04-23T..."
}
```

### reports 集合
```json
{
  "postId": "被举报帖子ID",
  "reportedBy": "举报者ID",
  "reason": "inappropriate",
  "status": "pending",
  "createdAt": "2026-04-23T..."
}
```
