-- 添加连续使用天数相关字段到用户表
-- 这个脚本用于更新现有数据库结构

-- 添加连续使用天数字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS consecutive_days INTEGER DEFAULT 0;

-- 添加最后活跃日期字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- 为现有用户设置默认值
UPDATE users 
SET consecutive_days = 0 
WHERE consecutive_days IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_last_active_date ON users(last_active_date);
CREATE INDEX IF NOT EXISTS idx_users_consecutive_days ON users(consecutive_days);

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('consecutive_days', 'last_active_date');
