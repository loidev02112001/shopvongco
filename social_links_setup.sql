CREATE TABLE IF NOT EXISTS social_links (
    id TEXT PRIMARY KEY DEFAULT 'main',
    facebook TEXT NOT NULL DEFAULT '',
    instagram TEXT NOT NULL DEFAULT '',
    tiktok TEXT NOT NULL DEFAULT '',
    youtube TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO social_links (id, facebook, instagram, tiktok, youtube, website)
VALUES (
    'main',
    'https://facebook.com',
    'https://instagram.com',
    'https://tiktok.com',
    'https://youtube.com',
    'https://lunajewel.vn'
)
ON CONFLICT (id) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON social_links TO web_anon;

NOTIFY pgrst, 'reload schema';
