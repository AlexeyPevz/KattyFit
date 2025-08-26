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