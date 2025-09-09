-- Таблица для хранения видео с поддержкой нескольких платформ
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- VK Video
    vk_video_id TEXT,
    vk_url TEXT,
    vk_embed_url TEXT,
    vk_access_key TEXT, -- Для приватных видео
    
    -- YouTube
    youtube_video_id TEXT,
    youtube_url TEXT,
    youtube_embed_url TEXT,
    
    -- Self-hosted HLS
    hls_url TEXT,
    hls_manifest_url TEXT,
    
    -- Общие поля
    duration INTEGER, -- В секундах
    thumbnail_url TEXT,
    is_private BOOLEAN DEFAULT true,
    status TEXT CHECK (status IN ('uploading', 'processing', 'ready', 'error')) DEFAULT 'uploading',
    error_message TEXT,
    
    -- Метаданные
    file_size BIGINT,
    resolution TEXT, -- "1920x1080"
    fps NUMERIC,
    bitrate INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_videos_course_id ON videos(course_id);
CREATE INDEX idx_videos_lesson_id ON videos(lesson_id);
CREATE INDEX idx_videos_status ON videos(status);

-- Таблица для отслеживания прогресса просмотра
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    current_time INTEGER DEFAULT 0, -- Текущая позиция в секундах
    duration INTEGER, -- Общая длительность
    percentage NUMERIC DEFAULT 0, -- Процент просмотра
    completed BOOLEAN DEFAULT false,
    
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, video_id)
);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры
CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos
    FOR EACH ROW 
    EXECUTE FUNCTION update_video_updated_at();

CREATE TRIGGER update_video_progress_updated_at 
    BEFORE UPDATE ON video_progress
    FOR EACH ROW 
    EXECUTE FUNCTION update_video_updated_at();

-- RLS политики
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Политики для видео (только для аутентифицированных с доступом к курсу)
CREATE POLICY "Videos viewable by course participants" ON videos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_courses uc
            WHERE uc.course_id = videos.course_id
            AND uc.user_id = auth.uid()
            AND uc.status = 'active'
        )
        OR 
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Политики для прогресса (только свой прогресс)
CREATE POLICY "Users can view own progress" ON video_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON video_progress
    FOR ALL USING (user_id = auth.uid());

-- Таблица для временного хранения чанков при загрузке
CREATE TABLE IF NOT EXISTS upload_chunks (
    upload_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    etag TEXT NOT NULL,
    size BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (upload_id, chunk_index)
);

-- Индекс для быстрого поиска чанков
CREATE INDEX idx_upload_chunks_upload_id ON upload_chunks(upload_id);

-- Автоочистка старых чанков (старше 24 часов)
CREATE OR REPLACE FUNCTION cleanup_old_chunks() RETURNS void AS $$
BEGIN
    DELETE FROM upload_chunks 
    WHERE uploaded_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Периодический запуск очистки (требует pg_cron)
-- SELECT cron.schedule('cleanup-old-chunks', '0 * * * *', 'SELECT cleanup_old_chunks();');
