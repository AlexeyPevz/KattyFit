-- Таблица контента
CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('short', 'lesson')) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'processing', 'published')) DEFAULT 'draft',
    filename TEXT,
    original_name TEXT,
    size BIGINT,
    mime_type TEXT,
    platform TEXT,
    video_id TEXT,
    url TEXT,
    embed_url TEXT,
    duration INTEGER,
    languages TEXT[] DEFAULT ARRAY['ru'],
    target_languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
    views INTEGER DEFAULT 0,
    thumbnail TEXT,
    -- Поля для дубляжа
    dubbing_id TEXT,
    dubbing_status TEXT CHECK (dubbing_status IN ('idle', 'processing', 'completed', 'failed')),
    dubbed_urls JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица публикаций
CREATE TABLE IF NOT EXISTS publications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'published', 'failed')) DEFAULT 'pending',
    url TEXT,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица интеграций
CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service TEXT UNIQUE NOT NULL,
    config JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица обложек
CREATE TABLE IF NOT EXISTS thumbnails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT CHECK (type IN ('generated', 'custom')) DEFAULT 'generated',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, language)
);

-- Таблица для хранения API ключей и конфигураций
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service TEXT NOT NULL,
    key_name TEXT NOT NULL,
    key_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service, key_name)
);

-- Таблица для сообщений чатов
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('incoming', 'outgoing')) NOT NULL,
    text TEXT NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица для базы знаний RAG
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('faq', 'dialog_example', 'course_info', 'pricing')) NOT NULL,
    question TEXT,
    answer TEXT,
    context JSONB,
    embedding vector(1536), -- для векторного поиска (если используем pgvector)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для чатов
CREATE INDEX idx_chat_messages_user_platform ON chat_messages(user_id, platform);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Таблица пользователей (расширенная)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    locale TEXT DEFAULT 'ru',
    source TEXT,
    tags TEXT[],
    last_purchase_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица покупок
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id TEXT UNIQUE NOT NULL,
    user_email TEXT NOT NULL REFERENCES users(email),
    item_type TEXT CHECK (item_type IN ('course', 'lesson', 'booking', 'subscription')) NOT NULL,
    item_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'RUB',
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_method TEXT,
    metadata JSONB,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица доступа к курсам
CREATE TABLE IF NOT EXISTS course_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email),
    course_id TEXT NOT NULL,
    purchase_id UUID REFERENCES purchases(id),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, course_id)
);

-- Таблица прогресса прохождения
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email),
    course_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    watched_seconds INTEGER DEFAULT 0,
    total_seconds INTEGER,
    completed BOOLEAN DEFAULT false,
    last_position INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, course_id, lesson_id)
);

-- Индексы для покупок и доступа
CREATE INDEX idx_purchases_user_email ON purchases(user_email);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_course_access_user_email ON course_access(user_email);
CREATE INDEX idx_course_progress_user_course ON course_progress(user_email, course_id);

-- Таблица лидов CRM
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    source TEXT NOT NULL,
    stage TEXT CHECK (stage IN ('new', 'contacted', 'interested', 'negotiation', 'customer', 'lost')) DEFAULT 'new',
    value DECIMAL(10,2) DEFAULT 0,
    score INTEGER DEFAULT 50,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    last_contact TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица активностей лидов
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для CRM
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для обновления updated_at
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS политики (Row Level Security)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Политики для анонимных пользователей (только чтение)
CREATE POLICY "Enable read access for all users" ON content
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON publications
    FOR SELECT USING (true);

-- Политики для аутентифицированных пользователей (полный доступ)
CREATE POLICY "Enable all for authenticated users" ON content
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON publications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON integrations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON thumbnails
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON api_keys
    FOR ALL USING (auth.role() = 'authenticated');

-- Промокоды
CREATE TABLE IF NOT EXISTS promocodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100) NOT NULL,
    min_amount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    start_at TIMESTAMPTZ DEFAULT NOW(),
    end_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for authenticated on promocodes" ON promocodes
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated on promocodes" ON promocodes
  FOR ALL USING (auth.role() = 'authenticated');
