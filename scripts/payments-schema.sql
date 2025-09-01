-- Таблица платежей
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

-- Индексы
CREATE INDEX idx_payments_email ON payments(email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Таблица доступа к курсам
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

-- Добавляем поля для бронирований
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255) REFERENCES payments(transaction_id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Таблица для отслеживания просмотров видео
CREATE TABLE IF NOT EXISTS video_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  video_url TEXT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress DECIMAL(5,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- Индексы для видео просмотров
CREATE INDEX idx_video_views_user_course ON video_views(user_id, course_id);
CREATE INDEX idx_video_views_viewed_at ON video_views(viewed_at DESC);