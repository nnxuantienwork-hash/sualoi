import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  category_id: number | null;
  author: string;
  views: number;
  is_breaking: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// Generate session ID for view tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('view_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('view_session_id', sessionId);
  }
  return sessionId;
};

// API Functions
export const fetchArticles = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as Article[];
};

export const fetchArticlesByCategory = async (categorySlug: string, limit = 20, offset = 0) => {
  // First get category ID from slug
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (categoryError || !categoryData) {
    return [];
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('category_id', categoryData.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as Article[];
};

export const fetchBreakingNews = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('is_breaking', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data as Article[];
};

export const fetchMostRead = async (days = 7) => {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .gte('created_at', dateThreshold.toISOString())
    .order('views', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data as Article[];
};

export const fetchArticleById = async (id: number) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Article | null;
};

export const incrementViews = async (articleId: number) => {
  const sessionId = getSessionId();

  const { error } = await supabase.rpc('increment_article_views', {
    article_id_param: articleId,
    session_id_param: sessionId
  });

  if (error) {
    console.error('Error incrementing views:', error);
  }
};

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id');

  if (error) throw error;
  return data as Category[];
};
