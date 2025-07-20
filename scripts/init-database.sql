-- 初始化数据库表结构
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  subscription TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学习卡片表
CREATE TABLE IF NOT EXISTS study_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON 数组存储
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  is_favorite BOOLEAN DEFAULT FALSE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  memory_level TEXT NOT NULL, -- perfect, good, fuzzy, forgot
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (card_id) REFERENCES study_cards(id)
);

-- 用户配额表
CREATE TABLE IF NOT EXISTS user_quotas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  cards_generated INTEGER DEFAULT 0,
  quizzes_taken INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, date)
);

-- 插入示例数据
INSERT OR IGNORE INTO users (id, name, email) VALUES 
('user1', '学习者', 'learner@example.com');

INSERT OR IGNORE INTO study_cards (id, user_id, title, content, tags, question, answer, difficulty) VALUES 
('card1', 'user1', '牛顿第一定律', '物体在不受外力作用时将保持静止或匀速直线运动状态。', '["物理", "力学"]', '牛顿第一定律的核心内容是什么？', '物体在不受外力时保持原运动状态。', 'medium'),
('card2', 'user1', 'React Hooks', 'React Hooks 是 React 16.8 引入的新特性，允许在函数组件中使用状态和其他 React 特性。', '["编程", "React"]', 'React Hooks 的主要作用是什么？', '允许在函数组件中使用状态和其他 React 特性。', 'hard');
