-- Расписание тренера
CREATE TABLE IF NOT EXISTS trainer_schedule (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  work_days INTEGER[], -- массив дней недели (0-6, где 0 - воскресенье)
  work_hours JSONB DEFAULT '{"start": "09:00", "end": "20:00"}',
  slot_duration INTEGER DEFAULT 60, -- минут
  break_duration INTEGER DEFAULT 15, -- минут между занятиями
  unavailable_dates DATE[], -- массив недоступных дат
  timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(trainer_id)
);

-- Типы тренировок
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

-- Пакеты тренировок
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

-- Использование пакетов
CREATE TABLE IF NOT EXISTS package_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES training_packages(id),
  payment_id VARCHAR(255) REFERENCES payments(transaction_id),
  sessions_total INTEGER NOT NULL,
  sessions_used INTEGER DEFAULT 0,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Вставляем дефолтные типы тренировок
INSERT INTO training_types (code, title, description, price, type) VALUES
  ('online-personal', 'Персональная онлайн', 'Индивидуальное занятие через Zoom', 2500, 'online'),
  ('offline-personal', 'Персональная в зале', 'Индивидуальное занятие в зале', 3500, 'offline'),
  ('online-group', 'Групповая онлайн', 'Групповое занятие через Zoom (до 6 человек)', 1000, 'online'),
  ('offline-group', 'Групповая в зале', 'Групповое занятие в зале (до 6 человек)', 1500, 'offline')
ON CONFLICT (code) DO NOTHING;

-- Вставляем дефолтные пакеты
INSERT INTO training_packages (code, title, sessions, price, discount_percent) VALUES
  ('package-5', 'Пакет 5 занятий', 5, 11250, 10),
  ('package-10', 'Пакет 10 занятий', 10, 21250, 15),
  ('package-20', 'Пакет 20 занятий', 20, 40000, 20)
ON CONFLICT (code) DO NOTHING;

-- Индексы
CREATE INDEX idx_bookings_trainer_date ON bookings(trainer_id, booking_date);
CREATE INDEX idx_package_usage_user ON package_usage(user_id, is_active);
