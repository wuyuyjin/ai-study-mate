# Moonshot AI 文件上传功能集成

本项目已成功集成 Moonshot AI 的文件上传功能，基于您提供的示例代码实现。

## 🚀 功能特性

- **文件上传**: 支持 PDF、Markdown、TXT 文件上传
- **智能提取**: 自动提取文件内容并生成学习卡片
- **上下文缓存**: 支持 Moonshot AI 的 Context Caching 功能
- **专用AI**: 文件上传功能专门使用 Moonshot AI
- **批量生成**: 一次可生成多张学习卡片

## 📁 文件结构

```
lib/moonshot-upload.ts              # Moonshot AI 集成库
app/api/generate-cards-moonshot/    # Moonshot AI API 路由
components/create-card-form.tsx     # 前端组件（已更新）
.env.example                        # 环境变量示例
```

## ⚙️ 配置说明

### 1. 环境变量配置

在 `.env.local` 文件中添加 Moonshot AI API Key：

```bash
MOONSHOT_DEMO_API_KEY="your-moonshot-api-key"
```

### 2. API Key 获取

1. 访问 [Moonshot AI 官网](https://platform.moonshot.cn/)
2. 注册账号并获取 API Key
3. 将 API Key 添加到环境变量中

## 🎯 使用方法

### 1. 前端使用

1. 打开创建卡片页面
2. 选择 "文件上传" 标签
3. 上传支持的文件格式（PDF、Markdown、TXT）
4. 选择提取模式（重点卡片提取 或 知识问答生成）
5. 点击 "从文件生成卡片" 按钮
6. 编辑生成的卡片并保存

### 2. API 调用

```javascript
// 直接调用 API
const formData = new FormData();
formData.append('file', fileObject);
formData.append('customTags', JSON.stringify(['标签1', '标签2']));

const response = await fetch('/api/generate-cards-moonshot', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.cards); // 生成的卡片数组
```

### 3. 程序化使用

```typescript
import { generateCardsFromFileWithMoonshot } from '@/lib/moonshot-upload';

const buffer = fs.readFileSync('example.pdf');
const result = await generateCardsFromFileWithMoonshot(
  buffer,
  'example.pdf',
  ['AI', '学习']
);
```

## 🔧 核心功能

### 文件上传和内容提取

```typescript
// 上传文件到 Moonshot AI
const fileMessages = await uploadFileToMoonshot(
  fileBuffer, 
  fileName, 
  cacheTag // 可选的缓存标签
);
```

### 上下文缓存

启用缓存可以减少重复传输文件内容：

```typescript
// 使用缓存标签
const messages = await uploadFileToMoonshot(
  buffer, 
  'document.pdf', 
  'my_cache_tag'
);

// 后续请求可以引用缓存
// 返回: [{ role: "cache", content: "tag=my_cache_tag;reset_ttl=300" }]
```

### 智能对话

```typescript
// 与 Moonshot AI 进行对话
const response = await chatWithMoonshot([
  ...fileMessages,
  { role: "user", content: "请总结这个文档的要点" }
]);
```

## 📊 支持的文件格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| PDF | .pdf | 自动提取文本内容 |
| Markdown | .md, .markdown | 保留格式结构 |
| 文本 | .txt | 纯文本内容 |

## 🔍 错误处理

系统包含完善的错误处理机制：

- 文件格式验证
- 文件大小限制（10MB）
- API 调用失败处理
- 网络错误重试

## 🎨 用户界面

- **专用AI引擎**: 文件上传功能专门使用 Moonshot AI
- **多卡片导航**: 生成多张卡片时可以切换查看
- **实时反馈**: 显示处理进度和结果状态
- **错误提示**: 友好的错误信息显示

## 🚦 测试

运行测试脚本验证配置：

```bash
node test-moonshot.js
```

## 📝 注意事项

1. 确保 API Key 正确配置
2. 文件大小不超过 10MB
3. 网络连接稳定
4. 遵守 Moonshot AI 的使用条款和限制

## 🔄 版本兼容性

- Node.js >= 18
- Next.js >= 13
- 支持现代浏览器的 FormData API

## 📞 技术支持

如遇问题，请检查：
1. 环境变量配置是否正确
2. API Key 是否有效
3. 网络连接是否正常
4. 文件格式是否支持
