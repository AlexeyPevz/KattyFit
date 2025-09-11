-- Полная схема базы данных для KattyFit
-- Выполните этот скрипт для создания всех необходимых таблиц

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial')),
  is_demo BOOLEAN DEFAULT false,
  total_spent DECIMAL(10,2) DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  current_courses INTEGER DEFAULT 0,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица курсов
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_demo BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица модулей курсов
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица уроков
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'text', 'quiz', 'assignment')),
  duration INTEGER DEFAULT 0, -- в секундах
  content JSONB DEFAULT '{}',
  is_preview BOOLEAN DEFAULT false,
  is_demo BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица записей на занятия
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('course', 'lesson', 'consultation')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  is_demo BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица контента
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('short', 'lesson')),
  filename VARCHAR(255),
  original_name VARCHAR(255),
  size BIGINT,
  mime_type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'draft', 'published', 'archived')),
  languages TEXT[] DEFAULT '{"ru"}',
  target_languages TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  thumbnail TEXT,
  url TEXT,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица переводов контента
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, language)
);

-- Таблица настроек
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  general JSONB DEFAULT '{}',
  payments JSONB DEFAULT '{}',
  notifications JSONB DEFAULT '{}',
  ai JSONB DEFAULT '{}',
  integrations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица интеграций
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service VARCHAR(100) NOT NULL UNIQUE,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица API ключей
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service VARCHAR(100) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service, key_name)
);

-- Таблица аналитических событий
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица чатов
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'resolved')),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сообщений чата
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'incoming' CHECK (message_type IN ('incoming', 'outgoing', 'system')),
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица push-подписок
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_platform ON chats(platform);
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_translations_updated_at BEFORE UPDATE ON content_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставляем начальные настройки
INSERT INTO settings (id, general, payments, notifications, ai, integrations) 
VALUES (
  1,
  '{
    "siteName": "KattyFit",
    "siteDescription": "Фитнес-студия для здорового образа жизни",
    "siteUrl": "https://kattyfit.ru",
    "adminEmail": "admin@kattyfit.ru",
    "timezone": "Europe/Moscow",
    "language": "ru"
  }',
  '{
    "cloudpaymentsPublicId": "",
    "cloudpaymentsSecret": "",
    "currency": "RUB",
    "testMode": true
  }',
  '{
    "emailEnabled": false,
    "smsEnabled": false,
    "pushEnabled": false,
    "emailFrom": "noreply@kattyfit.ru",
    "smsProvider": "sms.ru"
  }',
  '{
    "yandexGptApiKey": "",
    "openaiApiKey": "",
    "aiEnabled": false,
    "aiModel": "yandexgpt"
  }',
  '{
    "supabaseUrl": "",
    "supabaseAnonKey": "",
    "telegramBotToken": "",
    "vkApiToken": ""
  }'
) ON CONFLICT (id) DO NOTHING;

-- Вставляем демо данные
INSERT INTO users (id, email, name, phone, level, status, is_demo, total_spent, courses_completed, current_courses, tags, notes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'anna@example.com', 'Анна Петрова', '+7 (999) 123-45-67', 'intermediate', 'active', true, 8990, 2, 1, '{"VIP", "Постоянный клиент"}', 'Очень мотивированная ученица, быстро прогрессирует'),
('550e8400-e29b-41d4-a716-446655440002', 'maria@example.com', 'Мария Сидорова', '+7 (999) 234-56-78', 'beginner', 'active', true, 4990, 1, 1, '{"Новичок"}', 'Нужна дополнительная поддержка и мотивация'),
('550e8400-e29b-41d4-a716-446655440003', 'elena@example.com', 'Елена Козлова', '+7 (999) 345-67-89', 'beginner', 'trial', true, 0, 0, 0, '{"Пробный период"}', 'Интересуется аэройогой')
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, title, description, price, level, category, status, is_demo) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Йога для начинающих', 'Базовый курс йоги для новичков', 2990, 'beginner', 'yoga', 'published', true),
('650e8400-e29b-41d4-a716-446655440002', 'Силовые тренировки', 'Интенсивные силовые упражнения', 3990, 'intermediate', 'strength', 'published', true),
('650e8400-e29b-41d4-a716-446655440003', 'Пилатес', 'Укрепление мышц кора', 2490, 'beginner', 'pilates', 'draft', true)
ON CONFLICT (id) DO NOTHING;

-- Создаем Storage bucket для контента (если не существует)
-- Это нужно выполнить в Supabase Dashboard или через API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true);