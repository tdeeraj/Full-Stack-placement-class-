-- ============================================================
--  schema.sql — QuizMaster Pro MySQL Database Schema
--  Run this file once to set up your database:
--    mysql -u root -p < backend/schema.sql
-- ============================================================

-- Create and select database
CREATE DATABASE IF NOT EXISTS quizmaster_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE quizmaster_db;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)        NOT NULL,
  email        VARCHAR(150)        NOT NULL UNIQUE,
  password     VARCHAR(255)        NOT NULL,   -- bcrypt hashed
  role         ENUM('admin','student') NOT NULL DEFAULT 'student',
  avatar       VARCHAR(10)         DEFAULT 'U',
  created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── QUIZZES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200)        NOT NULL,
  category      VARCHAR(80)         NOT NULL DEFAULT 'General',
  description   TEXT,
  duration      INT                 NOT NULL DEFAULT 20,   -- minutes
  passing_score INT                 NOT NULL DEFAULT 70,   -- percentage
  published     TINYINT(1)          NOT NULL DEFAULT 0,
  created_by    INT,                                       -- FK → users.id
  created_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ── QUESTIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id      INT                 NOT NULL,
  question_text TEXT               NOT NULL,
  option_a     VARCHAR(300)        NOT NULL,
  option_b     VARCHAR(300)        NOT NULL,
  option_c     VARCHAR(300)        NOT NULL,
  option_d     VARCHAR(300)        NOT NULL,
  correct      TINYINT(1)          NOT NULL DEFAULT 0,  -- 0=A,1=B,2=C,3=D
  points       INT                 NOT NULL DEFAULT 10,
  sort_order   INT                 NOT NULL DEFAULT 0,
  created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ── RESULTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id      INT                 NOT NULL,
  user_id      INT,                                      -- NULL = guest
  user_name    VARCHAR(100)        NOT NULL,
  user_email   VARCHAR(150),
  score        INT                 NOT NULL DEFAULT 0,   -- percentage 0-100
  passed       TINYINT(1)          NOT NULL DEFAULT 0,
  time_taken   INT                 NOT NULL DEFAULT 0,   -- minutes
  submitted_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── RESULT ANSWERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS result_answers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  result_id    INT                 NOT NULL,
  question_id  INT                 NOT NULL,
  chosen       TINYINT(1),                               -- 0-3, NULL = skipped
  is_correct   TINYINT(1)          NOT NULL DEFAULT 0,
  FOREIGN KEY (result_id)  REFERENCES results(id)   ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ── CERTIFICATES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  result_id    INT                 NOT NULL UNIQUE,
  cert_uid     VARCHAR(50)         NOT NULL UNIQUE,      -- e.g. QMP-001-00090
  issued_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (result_id) REFERENCES results(id) ON DELETE CASCADE
);

-- ── SETTINGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  setting_key    VARCHAR(80)  NOT NULL UNIQUE,
  setting_value  TEXT,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (setting_key, setting_value) VALUES
  ('institution',   'QuizMaster Pro'),
  ('authorized_by', 'Dr. Admin User')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ── SEED: Admin user (password: admin123) ─────────────────────
-- bcrypt hash of "admin123"
INSERT INTO users (name, email, password, role, avatar) VALUES
  ('Admin User', 'admin@quizmaster.pro',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'admin', 'A')
ON DUPLICATE KEY UPDATE email = email;

-- ── SEED: Sample quizzes ──────────────────────────────────────
INSERT INTO quizzes (id, title, category, duration, passing_score, published, created_by)
VALUES
  (1, 'JavaScript Fundamentals', 'Programming', 20, 70, 1, 1),
  (2, 'React & Modern Frontend', 'Programming', 25, 65, 1, 1),
  (3, 'CSS Mastery',             'Design',       15, 60, 1, 1),
  (4, 'Node.js & Backend',       'Backend',      20, 70, 0, 1)
ON DUPLICATE KEY UPDATE title = title;

-- ── SEED: Questions ───────────────────────────────────────────
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct, points, sort_order)
VALUES
  -- Quiz 1: JavaScript
  (1, 'What is the output of typeof null?',                     'null','object','undefined','string',         1, 20, 0),
  (1, 'Which method removes the last element from an array?',   'shift()','pop()','splice()','slice()',       1, 20, 1),
  (1, 'What does === check?',                                   'Value only','Type only','Value and type','Neither', 2, 20, 2),
  (1, 'Which is NOT a JavaScript primitive type?',              'Boolean','Float','String','Symbol',          1, 20, 3),
  (1, "What does 'use strict' enable?",                         'Strict mode','Error suppression','Faster execution','None', 0, 20, 4),
  -- Quiz 2: React
  (2, 'Which hook manages local component state?',              'useEffect','useState','useContext','useRef', 1, 25, 0),
  (2, 'What does JSX stand for?',                               'JavaScript XML','Java Syntax Extension','JSON XML','JavaScript Extra', 0, 25, 1),
  (2, 'useEffect with [] dependency array runs:',               'Every render','Once on mount','On unmount','Never', 1, 25, 2),
  (2, 'How do you pass data to a child component?',             'state','props','context','refs',             1, 25, 3),
  -- Quiz 3: CSS
  (3, 'position: absolute is relative to:',                     'Viewport','Nearest positioned ancestor','Body','Its own size', 1, 34, 0),
  (3, 'Which flexbox property aligns items on the cross-axis?', 'justify-content','align-items','flex-direction','flex-wrap', 1, 33, 1),
  (3, 'CSS box model from inside out:',                         'Content-Padding-Border-Margin','Content-Border-Padding-Margin','Padding-Content-Border-Margin','Margin-Border-Content-Padding', 0, 33, 2),
  -- Quiz 4: Node.js
  (4, 'What is Node.js built on?',                              'SpiderMonkey','V8 Engine','Chakra','JavaScriptCore', 1, 25, 0),
  (4, 'Which module handles HTTP in Node.js?',                  'fs','path','http','net',                    2, 25, 1),
  (4, 'npm stands for:',                                        'Node Package Manager','New Project Manager','Node Program Module','None', 0, 25, 2),
  (4, 'Express.js is a:',                                       'Database','Frontend framework','Web framework for Node','Testing library', 2, 25, 3);
