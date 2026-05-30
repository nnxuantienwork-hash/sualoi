/*
  # Create Articles and View Tracking System

  1. New Tables
    - `categories`: Stores article categories
      - `id` (serial, primary key)
      - `name` (text) - Category display name
      - `slug` (text, unique) - URL-friendly identifier
      - `color` (text) - Category accent color
      
    - `articles`: Stores news articles
      - `id` (serial, primary key)
      - `title` (text) - Article title
      - `excerpt` (text) - Short description
      - `content` (text) - Full article content
      - `image` (text) - Cover image URL
      - `category_id` (integer, foreign key) - Reference to categories
      - `author` (text) - Author name
      - `views` (integer, default 0) - View count
      - `is_breaking` (boolean, default false) - Breaking news flag
      - `created_at` (timestamptz) - Publication timestamp
      
    - `article_views`: Tracks individual views
      - `id` (serial, primary key)
      - `article_id` (integer, foreign key) - Reference to articles
      - `viewed_at` (timestamptz) - When the view occurred
      - `session_id` (text) - Session identifier to prevent duplicate counts

  2. Security
    - Enable RLS on all tables
    - Public read access for articles and categories
    - Only authenticated users can insert/update (for admin features)
    - Anyone can track views (insert into article_views)
    
  3. Functions
    - `increment_article_views`: Function to safely increment view count
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id serial PRIMARY KEY,
  title text NOT NULL,
  excerpt text,
  content text,
  image text,
  category_id integer REFERENCES categories(id) ON DELETE SET NULL,
  author text DEFAULT 'Admin',
  views integer DEFAULT 0,
  is_breaking boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create article_views table for tracking individual views
CREATE TABLE IF NOT EXISTS article_views (
  id serial PRIMARY KEY,
  article_id integer NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(article_id, session_id)
);

-- Create function to increment views
CREATE OR REPLACE FUNCTION increment_article_views(
  article_id_param integer,
  session_id_param text
)
RETURNS void AS $$
BEGIN
  -- Insert view if not already counted for this session
  INSERT INTO article_views (article_id, session_id)
  VALUES (article_id_param, session_id_param)
  ON CONFLICT (article_id, session_id) DO NOTHING;
  
  -- If new view was inserted, increment the counter
  IF NOT FOUND THEN
    UPDATE articles 
    SET views = views + 1 
    WHERE id = article_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- RLS Policies for articles
CREATE POLICY "Anyone can read articles"
  ON articles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for article_views
CREATE POLICY "Anyone can insert article views"
  ON article_views FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_views ON articles(views DESC);
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);

-- Insert default categories
INSERT INTO categories (name, slug, color) VALUES
  ('Thành phố hôm nay', 'thanh-pho', '#3B82F6'),
  ('168 phường-xã', '168-phuong-xa', '#10B981'),
  ('Kinh tế', 'kinh-te', '#F59E0B'),
  ('Thời sự', 'thoi-su', '#EF4444'),
  ('Văn hóa', 'van-hoa', '#8B5CF6'),
  ('Giải trí', 'giai-tri', '#EC4899'),
  ('Thể thao', 'the-thao', '#F97316'),
  ('Sức khỏe', 'suc-khoe', '#06B6D4')
ON CONFLICT (slug) DO NOTHING;