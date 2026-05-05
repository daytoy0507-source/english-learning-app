# 📚 英语学习助手

一个基于 Supabase 的英语学习网站，支持单词管理、背诵打卡、错题本和视频跟读功能。

## ✨ 功能特性

- 🔐 **用户认证**: 邮箱注册/登录
- 📖 **单词管理**: 添加、编辑、删除单词，支持音标和例句
- 📝 **背诵模式**: 随机抽查、记忆打卡、难度分级
- ❌ **错题本**: 记录错误单词，重点复习
- 🎬 **视频跟读**: 支持 YouTube 视频，可调播放速度
- 📊 **学习统计**: 单词总数、今日学习、连续打卡天数

## 🚀 快速开始

### 第一步：注册 Supabase

1. 访问 [Supabase](https://supabase.com/) 注册账号
2. 创建新项目（记住项目密码）
3. 进入项目后，记录两个关键信息：
   - **Project URL**: 在 Settings -> API 中找到
   - **anon/public API key**: 在 Settings -> API 中找到

### 第二步：创建数据库表

进入 Supabase 控制台的 **SQL Editor**，运行以下 SQL：

```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- words 单词表
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  word TEXT NOT NULL,
  meaning TEXT,
  example TEXT,
  phonetic TEXT,
  level INT DEFAULT 0,
  favorite BOOLEAN DEFAULT false,
  last_studied DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- study_log 学习打卡记录
CREATE TABLE study_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  study_date DATE NOT NULL,
  words_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- error_words 错题本
CREATE TABLE error_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  word_id UUID REFERENCES words(id),
  error_count INT DEFAULT 1,
  last_error_date DATE DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建 RLS 策略（每个人只能访问自己的数据）
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own words" ON words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words" ON words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words" ON words
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words" ON words
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own study_log" ON study_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study_log" ON study_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own error_words" ON error_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own error_words" ON error_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own error_words" ON error_words
  FOR DELETE USING (auth.uid() = user_id);
```

### 第三步：配置网站

编辑 `app.js` 文件，替换以下内容：

```javascript
const SUPABASE_URL = '你的 Project URL';
const SUPABASE_ANON_KEY = '你的 anon API key';
```

### 第四步：本地测试

直接在浏览器中打开 `index.html` 文件即可测试。

### 第五步：部署到 Vercel

1. 在 GitHub 创建公开仓库
2. 上传所有文件（index.html, style.css, app.js, README.md）
3. 访问 [Vercel](https://vercel.com/)，用 GitHub 登录
4. 导入你的仓库
5. 在环境变量中添加：
   - `SUPABASE_URL`: 你的 Supabase URL
   - `SUPABASE_ANON_KEY`: 你的匿名密钥
6. 点击部署，等待完成

## 📁 项目结构

```
English-Learning-Supabase/
├── index.html    # 主页面
├── style.css     # 样式文件
├── app.js        # 业务逻辑
└── README.md     # 说明文档
```

## 🛠️ 技术栈

- **前端**: 纯 HTML/CSS/JavaScript
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel

## 📝 使用说明

1. 注册/登录账号
2. 在「单词本」中添加单词
3. 点击「背诵」开始学习
4. 使用「错题本」复习错误单词
5. 「视频跟读」支持 YouTube 链接

## 📄 许可证

MIT License