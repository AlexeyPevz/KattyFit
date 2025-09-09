-- Таблица промокодов
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

-- Индексы для промокодов
CREATE INDEX idx_promocodes_code ON promocodes(code);
CREATE INDEX idx_promocodes_active ON promocodes(is_active, valid_from, valid_until);

-- История использования промокодов
CREATE TABLE IF NOT EXISTS promocode_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promocode_id UUID REFERENCES promocodes(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  payment_id VARCHAR(255),
  amount_before DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  amount_after DECIMAL(10,2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для истории
CREATE INDEX idx_promocode_usage_promocode ON promocode_usage(promocode_id);
CREATE INDEX idx_promocode_usage_email ON promocode_usage(user_email);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promocodes_updated_at BEFORE UPDATE
  ON promocodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Добавим несколько тестовых промокодов
INSERT INTO promocodes (code, discount_percent, max_uses, valid_until) VALUES
  ('WELCOME10', 10, NULL, NULL),
  ('FIRST20', 20, 100, CURRENT_TIMESTAMP + INTERVAL '30 days'),
  ('YOGA2024', 15, 50, '2024-12-31'::timestamp)
ON CONFLICT (code) DO NOTHING;
