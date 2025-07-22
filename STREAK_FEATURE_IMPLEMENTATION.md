# 连续使用天数功能实现

## 🎯 功能描述

实现了一个连续使用天数功能，用户每天进入应用时连续天数+1，如果某天没有进入页面，连续天数就会重置为0。

## ✅ 实现的功能

### 1. 数据库模型更新
- ✅ **consecutiveDays**: 连续使用天数
- ✅ **lastActiveDate**: 最后活跃日期（只记录日期，不包含时间）
- ✅ 自动索引优化查询性能

### 2. API 接口
- ✅ **POST /api/user/streak**: 更新连续使用天数
- ✅ **GET /api/user/streak**: 获取当前连续使用天数
- ✅ 智能判断是否为新的一天
- ✅ 自动重置中断的连续天数

### 3. 前端组件
- ✅ **StreakDisplay**: 美观的连续天数显示组件
- ✅ **StreakTracker**: 自动跟踪用户访问的组件
- ✅ **useStreak Hook**: 管理连续天数状态

### 4. 用户体验
- ✅ 等级系统（新手→入门→进阶→专家→传奇）
- ✅ 里程碑进度条
- ✅ 庆祝动画和提示
- ✅ 激励性消息

## 📁 新增文件

### 数据库
1. **`prisma/schema.prisma`** - 更新User模型
2. **`scripts/add-streak-fields.sql`** - 数据库迁移脚本

### API
1. **`app/api/user/streak/route.ts`** - 连续天数API

### 组件和Hooks
1. **`hooks/use-streak.ts`** - 连续天数管理Hook
2. **`components/streak-display.tsx`** - 连续天数显示组件
3. **`components/streak-tracker.tsx`** - 自动跟踪组件

### 更新的文件
1. **`components/dashboard.tsx`** - 添加连续天数显示
2. **`app/layout.tsx`** - 集成自动跟踪

## 🔧 技术实现

### 连续天数逻辑
```typescript
// 判断连续天数的核心逻辑
if (!user.lastActiveDate) {
  // 第一次使用
  newConsecutiveDays = 1
} else if (user.lastActiveDate.getTime() === yesterday.getTime()) {
  // 昨天有使用，连续天数+1
  newConsecutiveDays = user.consecutiveDays + 1
} else {
  // 中断了，重新开始
  newConsecutiveDays = 1
}
```

### 等级系统
- **新手**: 0天 (灰色)
- **入门**: 3-6天 (黄色)
- **进阶**: 7-13天 (绿色)
- **专家**: 14-29天 (蓝色)
- **传奇**: 30天+ (紫色)

### 自动跟踪
- 用户登录后自动更新连续天数
- 每小时检查一次（防止长时间停留）
- 静默失败，不影响用户体验

## 🎨 用户界面

### 连续天数卡片
```
┌─────────────────────────────────────┐
│ 🔥 连续学习                        │
├─────────────────────────────────────┤
│  15    [专家]                      │
│  天    保持下去，你做得很棒！        │
│                    🔥🔥🔥🔥🔥🔥🔥+8 │
├─────────────────────────────────────┤
│ 下个里程碑: 30天 (传奇)             │
│ ████████████░░░░ 75%               │
└─────────────────────────────────────┘
```

### 庆祝效果
- 新纪录时显示庆祝动画
- Toast 提示消息
- 卡片高亮效果
- 图标跳动动画

## 📊 数据库结构

### User 表新增字段
```sql
consecutive_days INTEGER DEFAULT 0,
last_active_date DATE,
```

### 索引优化
```sql
CREATE INDEX idx_users_last_active_date ON users(last_active_date);
CREATE INDEX idx_users_consecutive_days ON users(consecutive_days);
```

## 🔄 工作流程

### 用户访问流程
1. **用户登录/访问页面**
2. **StreakTracker 自动触发**
3. **调用 POST /api/user/streak**
4. **检查是否为新的一天**
5. **更新连续天数和最后活跃日期**
6. **返回更新结果**
7. **前端显示庆祝效果（如果是新纪录）**

### 连续天数判断逻辑
- **今天已记录**: 不更新
- **昨天有记录**: 连续天数+1
- **超过1天未访问**: 重置为1
- **首次使用**: 设置为1

## 🎯 激励机制

### 里程碑奖励
- 3天: 入门徽章
- 7天: 进阶徽章  
- 14天: 专家徽章
- 30天: 传奇徽章

### 激励消息
- 动态根据连续天数显示不同消息
- 庆祝新纪录的特殊提示
- 进度条显示下个里程碑

### 视觉反馈
- 火焰图标数量表示连续程度
- 颜色编码的等级系统
- 动画效果增强体验

## 🚀 部署说明

### 数据库迁移
```bash
# 运行迁移脚本
psql -d your_database -f scripts/add-streak-fields.sql

# 或使用 Prisma
npx prisma db push
```

### 环境要求
- 数据库支持 DATE 类型
- 用户认证系统正常工作
- JWT token 正确配置

## 📈 性能优化

### 缓存策略
- 前端缓存连续天数状态
- 避免频繁API调用
- 智能更新机制

### 数据库优化
- 索引优化查询性能
- 只存储必要的日期信息
- 批量更新操作

## 🔍 监控和分析

### 可追踪指标
- 用户连续使用天数分布
- 平均连续天数
- 连续天数断档率
- 里程碑达成率

### 数据查询示例
```sql
-- 查看连续天数分布
SELECT consecutive_days, COUNT(*) as user_count 
FROM users 
GROUP BY consecutive_days 
ORDER BY consecutive_days;

-- 查看传奇用户
SELECT name, consecutive_days, last_active_date 
FROM users 
WHERE consecutive_days >= 30 
ORDER BY consecutive_days DESC;
```

现在用户每天进入应用时都会自动更新连续使用天数，并且有美观的显示界面和激励机制来鼓励用户持续使用！
