import { useState, useEffect } from 'react';
import { supabase, fetchCategories, Category, Article } from '../lib/supabase';
import { ArrowLeft, Plus, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category_id: '',
    author: 'Admin',
    is_breaking: false
  });

  useEffect(() => {
    loadCategories();
    loadArticles();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const articleData = {
        title: formData.title,
        excerpt: formData.excerpt || formData.title.substring(0, 100),
        content: formData.content,
        image: formData.image || `https://picsum.photos/seed/${Date.now()}/800/450`,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        author: formData.author,
        is_breaking: formData.is_breaking
      };

      const { error } = await supabase
        .from('articles')
        .insert([articleData]);

      if (error) throw error;

      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category_id: '',
        author: 'Admin',
        is_breaking: false
      });

      loadArticles();
      alert('Đăng bài thành công!');
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Lỗi khi đăng bài!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài này?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Lỗi khi xóa bài!');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-full hover:bg-neutral-200 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-primary-dark">Quản lý bài viết</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form thêm bài */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Đăng bài mới
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-mid mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-mid mb-1">
                  Tóm tắt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-mid mb-1">
                  Nội dung
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-mid mb-1">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-mid mb-1">
                  Chuyên mục
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">-- Chọn chuyên mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-mid mb-1">
                  Tác giả
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_breaking"
                  checked={formData.is_breaking}
                  onChange={(e) => setFormData({ ...formData, is_breaking: e.target.checked })}
                  className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                />
                <label htmlFor="is_breaking" className="text-sm font-medium text-neutral-mid">
                  Tin nóng
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.title}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </form>
          </div>

          {/* Danh sách bài */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Bài viết đã đăng ({articles.length})</h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 border border-neutral-100"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-20 h-14 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{article.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-mid">
                      <span>{article.category?.name || 'Chưa phân loại'}</span>
                      <span>-</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </span>
                      <span>-</span>
                      <span>{formatTime(article.created_at)}</span>
                    </div>
                    {article.is_breaking && (
                      <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full mt-1">
                        Tin nóng
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {articles.length === 0 && (
                <p className="text-center text-neutral-mid py-8">
                  Chưa có bài viết nào
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
