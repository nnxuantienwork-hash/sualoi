import { useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import { getArticlesByCategory, categories } from '../data/newsData';

interface CategoryPageProps {
  categorySlug: string;
}

export default function CategoryPage({ categorySlug }: CategoryPageProps) {
  const articles = getArticlesByCategory(categorySlug);
  const category = categories.find(cat => cat.slug === categorySlug);
  const categoryColor = category?.color || '#3B82F6';

  // Page transition effect
  useEffect(() => {
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.opacity = '1';
      document.body.style.transition = 'opacity 0.3s ease-in-out';
    }, 10);
  }, []);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-mid">Danh mục không tồn tại</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <span
            className="text-xs font-bold uppercase tracking-wider mb-2 block"
            style={{ color: categoryColor }}
          >
            Chuyên mục
          </span>
          <h1 className="section-title text-4xl md:text-5xl text-neutral-dark mb-4">
            {category.name}
          </h1>
          <p className="text-neutral-mid text-lg max-w-2xl">
            {category.description}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 12).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </div>

          {articles.length > 12 && (
            <div className="text-center mt-8">
              <button
                className="px-8 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
                style={{ backgroundColor: categoryColor }}
              >
                Xem thêm tin tức
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark py-12 mt-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-white px-4 py-2 rounded-lg">
                <span className="text-primary-dark font-bold text-lg">TIN TP.HCM</span>
              </div>
            </div>

            <div className="text-white/70 text-sm text-center md:text-right">
              © 2026 TIN TP.HCM. Bảo lưu mọi quyền.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
