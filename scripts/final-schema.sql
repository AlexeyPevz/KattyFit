-- Полная схема БД для KattyFit
-- Объединяет все необходимые таблицы

-- 1. ПОЛЬЗОВАТЕЛИ И АУТЕНТИФИКАЦИЯ
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'trainer')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. КУРСЫ
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category VARCHAR(100),
    thumbnail_url TEXT,
    video_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ПЛАТЕЖИ
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  email VARCHAR(255),
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  card_info JSONB,
  custom_data JSONB,
  error JSONB,
  refund_amount DECIMAL(10,2),
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ДОСТУП К КУРСАМ
CREATE TABLE IF NOT EXISTS course_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  payment_id VARCHAR(255) REFERENCES payments(transaction_id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- 5. БРОНИРОВАНИЯ
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES users(id),
    service_type VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    price DECIMAL(10,2),
    payment_id VARCHAR(255) REFERENCES payments(transaction_id),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. КОНТЕНТ
CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('short', 'lesson', 'live')),
    status VARCHAR(50) DEFAULT 'draft',
    filename TEXT,
    original_name TEXT,
    size BIGINT,
    mime_type VARCHAR(255),
    platform VARCHAR(50),
    video_id VARCHAR(255),
    url TEXT,
    embed_url TEXT,
    duration INTEGER,
    languages TEXT[],
    target_languages TEXT[],
    platforms TEXT[],
    views INTEGER DEFAULT 0,
    thumbnail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ПРОМОКОДЫ
CREATE TABLE IF NOT EXISTS promocodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

-- 8. БАЗА ЗНАНИЙ ДЛЯ ЧАТА
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) CHECK (type IN ('faq', 'dialog_example', 'course_info', 'pricing')),
    question TEXT,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ИНТЕГРАЦИИ
CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. РАСПИСАНИЕ ТРЕНЕРА
CREATE TABLE IF NOT EXISTS trainer_schedule (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  work_days INTEGER[],
  work_hours JSONB DEFAULT '{"start": "09:00", "end": "20:00"}',
  slot_duration INTEGER DEFAULT 60,
  break_duration INTEGER DEFAULT 15,
  unavailable_dates DATE[],
  timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(trainer_id)
);

-- 11. ТИПЫ ТРЕНИРОВОК
CREATE TABLE IF NOT EXISTS training_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  type VARCHAR(50) CHECK (type IN ('online', 'offline', 'hybrid')),
  max_participants INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. ПАКЕТЫ ТРЕНИРОВОК
CREATE TABLE IF NOT EXISTS training_packages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sessions INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  valid_days INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. ПРОСМОТРЫ ВИДЕО
CREATE TABLE IF NOT EXISTS video_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  video_url TEXT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress DECIMAL(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- 14. СОБЫТИЯ АНАЛИТИКИ
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  event_properties JSONB DEFAULT '{}',
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. АГРЕГИРОВАННЫЕ МЕТРИКИ
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(metric_date, metric_name)
);

-- ИНДЕКСЫ
CREATE INDEX idx_payments_email ON payments(email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_bookings_trainer_date ON bookings(trainer_id, booking_date);
CREATE INDEX idx_video_views_user_course ON video_views(user_id, course_id);
CREATE INDEX idx_video_views_viewed_at ON video_views(viewed_at DESC);
CREATE INDEX idx_promocodes_code ON promocodes(code);
CREATE INDEX idx_promocodes_active ON promocodes(is_active, valid_from, valid_until);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(metric_date DESC);

-- ФУНКЦИИ
-- Функция для увеличения счетчика использования промокода
CREATE OR REPLACE FUNCTION increment_promo_usage(code VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE promocodes 
  SET usage_count = usage_count + 1,
      last_used_at = CURRENT_TIMESTAMP
  WHERE code = $1 AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления метрик
CREATE OR REPLACE FUNCTION increment_metric(
  metric_name VARCHAR,
  metric_date DATE,
  increment_value DECIMAL DEFAULT 1
)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_metrics (metric_date, metric_name, metric_value)
  VALUES (metric_date, metric_name, increment_value)
  ON CONFLICT (metric_date, metric_name)
  DO UPDATE SET 
    metric_value = daily_metrics.metric_value + increment_value,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Применяем триггер ко всем таблицам с updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_promocodes_updated_at BEFORE UPDATE ON promocodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_trainer_schedule_updated_at BEFORE UPDATE ON trainer_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
