-- Script d'initialisation de la base de données
-- Création de la table posts

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url VARCHAR(500),
    date DATE DEFAULT CURRENT_DATE,
    popular BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_popular ON posts(popular);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertion de données de test (optionnel)
INSERT INTO posts (title, category, content, excerpt, image_url, popular, views) VALUES
(
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    'Drame',
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. QuisqLorem ipsum dolor sit amet consectetur adipisicing elit. QuisqLorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.sd',
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magni, id labore. Suscipit dolorum ab obcaecati? Nam impedit nostrum doloremque tenetur molestias, dolores quis quibusdam praesentium totam placeat hic omnis sit.',
    'src/IMG_2581.png',
    true,
    0
),
(
    '10 Easy Way To Be Environmentally Conscious At Home',
    'Action',
    'Discover simple and effective ways to make your home more environmentally friendly. From reducing energy consumption to sustainable living practices, learn how small changes can make a big impact on our planet.',
    'Learn practical tips and tricks to reduce your carbon footprint and create a more sustainable lifestyle at home.',
    'src/IMG_3737.jpg',
    true,
    0
),
(
    'The Future of Technology in 2029',
    'Comédie',
    'Explore the latest technological advancements and innovations that are shaping our future. From artificial intelligence to renewable energy, discover what''s next in the world of technology.',
    'A comprehensive look at emerging technologies and their potential impact on society and daily life.',
    '',
    false,
    0
) ON CONFLICT DO NOTHING; 