-- Таблица для хранения настроек системы
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

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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