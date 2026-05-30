import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Share2,
  Facebook,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { newsArticles, Article as StaticArticle } from '../data/newsData';
import { fetchArticleById, incrementViews, fetchMostRead, Article as DbArticle } from '../lib/supabase';
import CategoryBadge from '../components/CategoryBadge';

type ArticleType = StaticArticle | DbArticle;

export default function ArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<StaticArticle[]>([]);
  const [mostReadArticles, setMostReadArticles] = useState<DbArticle[]>([]);

  useEffect(() => {
    loadArticle();
    loadMostRead();
  }, [articleId]);

  const loadArticle = async () => {
    if (!articleId) return;

    setLoading(true);
    try {
      // Try to load from database first
      const dbArticle = await fetchArticleById(parseInt(articleId));

      if (dbArticle) {
        setArticle(dbArticle);
        // Increment views when article is loaded
        await incrementViews(dbArticle.id);
        // Refresh article to get updated view count
        const updated = await fetchArticleById(parseInt(articleId));
        if (updated) setArticle(updated);

        // Load related articles from same category
        const related = newsArticles.filter(
          (a) => a.id !== parseInt(articleId) && a.category === (dbArticle.category?.name || '')
        ).slice(0, 5);
        setRelatedArticles(related);
      } else {
        // Fallback to static data
        const staticArticle = newsArticles.find((a) => a.id === Number(articleId));
        if (staticArticle) {
          setArticle(staticArticle);
          const related = newsArticles.filter(
            (a) => a.id !== staticArticle.id && a.category === staticArticle.category
          ).slice(0, 5);
          setRelatedArticles(related);
        }
      }
    } catch (error) {
      console.error('Error loading article:', error);
      // Fallback to static data on error
      const staticArticle = newsArticles.find((a) => a.id === Number(articleId));
      if (staticArticle) {
        setArticle(staticArticle);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMostRead = async () => {
    try {
      const data = await fetchMostRead(7);
      setMostReadArticles(data);
    } catch (error) {
      console.error('Error loading most read:', error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress((scrolled / total) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <Link to="/" className="text-blue-600 hover:underline">Quay về trang chủ</Link>
        </div>
      </div>
    );
  }

  // Handle both static and database articles
  const isDbArticle = 'category_id' in article;
  const categoryName = isDbArticle ? (article as DbArticle).category?.name : (article as StaticArticle).category;
  const categorySlug = isDbArticle ? (article as DbArticle).category?.slug : (article as StaticArticle).categorySlug;
  const views = isDbArticle ? (article as DbArticle).views : (article as StaticArticle).views;
  const imageUrl = isDbArticle ? (article as DbArticle).image : (article as StaticArticle).image;
  const createdAt = isDbArticle ? (article as DbArticle).created_at : (article as StaticArticle).createdAt;

  const displayMostRead = mostReadArticles.length > 0
    ? mostReadArticles
    : [...newsArticles].sort((a, b) => b.views - a.views).slice(0, 5);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string | number) => {
    const date = new Date(dateStr);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const day = days[date.getDay()];
    return `${day}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatViewsDisplay = (viewCount: number) => {
    if (viewCount >= 1000) return `${(viewCount / 1000).toFixed(1)}k`;
    return viewCount.toString();
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 h-[3px] z-[9999]"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #10B981)',
          boxShadow: '0 0 8px rgba(59,130,246,0.5)',
        }}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-6 text-sm">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all hover:translate-x-[-3px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <Link to="/" className="text-gray-500 hover:text-blue-600">Trang chủ</Link>
            {categorySlug && categoryName && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <Link to={`/${categorySlug}`} className="text-gray-500 hover:text-blue-600">
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {article.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[68%_32%] gap-8">
            <div>
              <div className="bg-white rounded-[20px] p-10 mb-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                {categoryName && (
                  <div className="mb-4">
                    <CategoryBadge category={categoryName} />
                  </div>
                )}

                <h1 className="text-[32px] font-bold text-[#0D1117] mb-3 leading-tight" style={{ letterSpacing: '-0.5px' }}>
                  {article.title}
                </h1>

                <div className="italic text-[17px] text-[#475569] leading-relaxed p-4 border-l-4 border-blue-600 bg-[#F0F7FF] rounded-r-lg mb-5">
                  {article.excerpt}
                </div>

                <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                      {article.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-gray-900">{article.author}</div>
                      <div className="text-[12px] text-gray-500">Phóng viên</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-[13px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(createdAt || Date.now())}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{formatViewsDisplay(views || 0)} lượt đọc</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>5 phút đọc</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </button>
                  <button className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                  >
                    {copied ? 'Da sao chep!' : 'Sao chep link'}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="rounded-[16px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                  <img
                    src={imageUrl || `https://picsum.photos/seed/${article.id}/800/450`}
                    alt={article.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>
                <p className="text-center text-[13px] text-gray-500 italic mt-3">
                  Hinh anh minh hoa cho bai viet
                </p>
              </div>

              <div className="bg-white rounded-[16px] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="article-body max-w-[680px] mx-auto" style={{ fontSize: '17px' }}>
                  <p className="mb-6 leading-relaxed text-gray-800">
                    <strong>{article.title}</strong> - Day la mot trong nhung van de duoc quan tam hang dau tai TP.HCM trong thoi gian gan day. Cac co quan chuc nang dang no luc day manh cac bien phap nham giai quyet tinh trang nay mot cach hieu qua nhat.
                  </p>

                  <blockquote className="my-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-l-[5px] border-blue-600 rounded-r-2xl text-[20px] font-semibold text-[#1E3A5F] leading-relaxed">
                    "Chung toi cam ket se lam viec het minh de mang lai cuoc song tot dep hon cho nguoi dan thanh pho."
                  </blockquote>

                  <p className="mb-6 leading-relaxed text-gray-800">
                    {isDbArticle ? (article as DbArticle).content : (article as StaticArticle).excerpt || "Theo thong bao moi nhat tu cac co quan chuc nang, tinh hinh hien tai da co nhieu chuyen bien tich cuc. Nguoi dan da phan hoi rat tot voi cac chinh sach moi duoc ap dung trong thoi gian qua."}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[16px] p-8 mt-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-3 font-medium">Tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {['TP.HCM', 'Kinh te', 'Do thi'].map((tag) => (
                      <Link
                        key={tag}
                        to={`/tag/${tag}`}
                        className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="sticky top-5 space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-[3px] h-5 bg-blue-600 rounded" />
                    <h3 className="font-bold text-gray-900">Tin lien quan</h3>
                  </div>
                  <div className="space-y-3">
                    {relatedArticles.slice(0, 5).map((relArticle) => (
                      <Link
                        key={relArticle.id}
                        to={`/bai-viet/${relArticle.id}`}
                        className="flex gap-3 p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                      >
                        <img
                          src={relArticle.image}
                          alt={relArticle.title}
                          className="w-[72px] h-[54px] rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {relArticle.title}
                          </h4>
                          <div className="text-[11px] text-gray-500 mt-1">{relArticle.timestamp}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-[3px] h-5 bg-blue-600 rounded" />
                    <h3 className="font-bold text-gray-900">Doc nhieu nhat</h3>
                  </div>
                  <div className="space-y-3">
                    {displayMostRead.slice(0, 5).map((readArticle, idx) => (
                      <Link
                        key={readArticle.id}
                        to={`/bai-viet/${readArticle.id}`}
                        className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-lg font-bold text-blue-600">{idx + 1}</span>
                        <h4 className="flex-1 text-[13px] font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {readArticle.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
