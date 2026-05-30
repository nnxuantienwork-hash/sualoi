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
import { newsArticles, formatViews, Article } from '../data/newsData';
import CategoryBadge from '../components/CategoryBadge';
import ArticleCard from '../components/ArticleCard';

export default function ArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const article: Article | undefined = newsArticles.find((a) => a.id === Number(articleId));

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

  const relatedArticles = newsArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 5);

  const mostReadArticles = [...newsArticles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);



  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: string) => {
    return `Thứ Sáu, ${timestamp}`;
  };

  return (
    <>
      {/* Reading Progress Bar */}
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
          {/* Breadcrumb */}
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
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <Link to={article.categorySlug || '/'} className="text-gray-500 hover:text-blue-600">
              {article.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {article.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[68%_32%] gap-8">
            {/* Main Content */}
            <div>
              {/* Article Header */}
              <div className="bg-white rounded-[20px] p-10 mb-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                <div className="mb-4">
                  <CategoryBadge category={article.category} />
                </div>

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
                      <span>{formatDate(article.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{formatViews(article.views)} lượt đọc</span>
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
                    {copied ? '✓ Đã sao chép!' : '📋 Sao chép link'}
                  </button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="mb-6">
                <div className="rounded-[16px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>
                <p className="text-center text-[13px] text-gray-500 italic mt-3">
                  Hình ảnh minh họa cho bài viết
                </p>
              </div>

              {/* Article Body */}
              <div className="bg-white rounded-[16px] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="article-body max-w-[680px] mx-auto" style={{ fontSize: '17px' }}>
                  <p className="mb-6 leading-relaxed text-gray-800">
                    <strong>{article.title}</strong> - Đây là một trong những vấn đề được quan tâm hàng đầu tại TP.HCM trong thời gian gần đây. Các cơ quan chức năng đang nỗ lực đẩy mạnh các biện pháp nhằm giải quyết tình trạng này một cách hiệu quả nhất.
                  </p>

                  <blockquote className="my-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-l-[5px] border-blue-600 rounded-r-2xl text-[20px] font-semibold text-[#1E3A5F] leading-relaxed">
                    "Chúng tôi cam kết sẽ làm việc hết mình để mang lại cuộc sống tốt đẹp hơn cho người dân thành phố."
                  </blockquote>

                  <p className="mb-6 leading-relaxed text-gray-800">
                    Theo thông báo mới nhất từ các cơ quan chức năng, tình hình hiện tại đã có nhiều chuyển biến tích cực. Người dân đã phản hồi rất tốt với các chính sách mới được áp dụng trong thời gian qua. Đặc biệt, các dự án trọng điểm đang được đẩy nhanh tiến độ để kịp hoàn thành theo đúng kế hoạch đã định.
                  </p>

                  <div className="my-8 rounded-[12px] overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Hình ảnh minh họa"
                      className="w-full object-cover"
                    />
                    <p className="text-center text-[13px] text-gray-500 italic mt-2">
                      Cảnh người dân TP.HCM trong cuộc sống hàng ngày
                    </p>
                  </div>

                  <h2 className="text-[22px] font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-50">
                    Chi tiết tình hình
                  </h2>

                  <p className="mb-6 leading-relaxed text-gray-800">
                    Được biết, trong tuần qua, các cơ quan chức năng đã tổ chức nhiều cuộc họp quan trọng nhằm đánh giá hiện trạng và đề xuất các giải pháp khả thi. Sau khi xem xét kỹ lưỡng, lãnh đạo thành phố đã quyết định triển khai một loạt biện pháp cụ thể để cải thiện tình hình trong thời gian tới.
                  </p>

                  <p className="mb-6 leading-relaxed text-gray-800">
                    Một trong những điểm nổi bật là việc thành phố phối hợp với các doanh nghiệp và tổ chức xã hội để đưa ra các chương trình hỗ trợ thiết thực cho người dân. Điều này không chỉ giúp giải quyết vấn đề trước mắt mà còn tạo nền tảng vững chắc cho sự phát triển bền vững trong tương lai.
                  </p>

                  <ul className="list-none p-0 mb-6 space-y-3">
                    {[
                      'Tăng cường hợp tác giữa các cơ quan nhà nước và doanh nghiệp',
                      'Đẩy mạnh các chương trình an sinh xã hội',
                      'Nâng cao chất lượng dịch vụ công',
                      'Tối ưu hóa quy trình thủ tục hành chính'
                    ].map((item, idx) => (
                      <li key={idx} className="relative pl-6 text-gray-800 leading-relaxed">
                        <span className="absolute left-0 top-[9px] w-[6px] h-[6px] rounded-full bg-blue-600" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="my-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="text-[13px] uppercase text-amber-800 font-bold mb-2">
                      📌 Lưu ý
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      Người dân cần theo dõi thông tin chính thức từ các cơ quan chức năng để cập nhật tình hình mới nhất. Không nên tin vào các nguồn tin không chính thống trên mạng xã hội.
                    </p>
                  </div>

                  <p className="mb-6 leading-relaxed text-gray-800">
                    Dự kiến trong tháng tới, thành phố sẽ công bố chi tiết về các bước triển khai tiếp theo. Người dân có thể tiếp cận thông tin qua cổng thông tin điện tử chính thức hoặc đến trực tiếp các trụ sở hành chính để được tư vấn và hỗ trợ.
                  </p>

                  <p className="leading-relaxed text-gray-800">
                    Với sự quyết tâm cao độ của chính quyền thành phố và sự đồng lòng của người dân, tin rằng tình hình sẽ sớm được cải thiện đáng kể. Đây là minh chứng cho tinh thần đoàn kết và ý chí vươn lên của người dân TP.HCM trong thời kỳ hội nhập và phát triển.
                  </p>
                </div>
              </div>

              {/* Article Footer */}
              <div className="bg-white rounded-[16px] p-8 mt-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-3 font-medium">Tags:</div>
                  <div className="flex flex-wrap gap-2">
                    {(article.tags || ['TP.HCM', 'Kinh tế', 'Đô thị']).map((tag) => (
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

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Chia sẻ bài viết này:</div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform">
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform text-sm font-bold">
                      X
                    </button>
                    <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition-transform text-xs font-bold">
                      Zalo
                    </button>
                    <button
                      onClick={copyLink}
                      className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="text-right mt-4">
                  <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    ⚐ Báo lỗi bài viết
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="sticky top-5 space-y-4">
                {/* Related Articles */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-[3px] h-5 bg-blue-600 rounded" />
                    <h3 className="font-bold text-gray-900">Tin liên quan</h3>
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

                {/* Most Read */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-[3px] h-5 bg-blue-600 rounded" />
                    <h3 className="font-bold text-gray-900">Đọc nhiều nhất</h3>
                  </div>
                  <div className="space-y-3">
                    {mostReadArticles.map((readArticle) => (
                      <Link
                        key={readArticle.id}
                        to={`/bai-viet/${readArticle.id}`}
                        className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                      >
                        <h4 className="flex-1 text-[13px] font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {readArticle.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Topic Tags */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-[3px] h-5 bg-blue-600 rounded" />
                    <h3 className="font-bold text-gray-900">Chủ đề nổi bật</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Kinh tế', bg: 'bg-blue-50', color: 'text-blue-900' },
                      { label: 'Đô thị', bg: 'bg-green-50', color: 'text-green-900' },
                      { label: 'Công nghệ', bg: 'bg-purple-50', color: 'text-purple-900' },
                      { label: 'Giao thông', bg: 'bg-orange-50', color: 'text-orange-900' },
                      { label: 'Giáo dục', bg: 'bg-cyan-50', color: 'text-cyan-900' },
                      { label: 'Y tế', bg: 'bg-red-50', color: 'text-red-900' },
                    ].map((topic) => (
                      <Link
                        key={topic.label}
                        to={`/tag/${topic.label}`}
                        className={`px-3 py-1.5 ${topic.bg} ${topic.color} rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white transition-all hover:scale-105`}
                      >
                        #{topic.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-br from-[#0D1B2E] to-blue-700 rounded-2xl p-6 text-white">
                  <div className="text-3xl mb-3">📧</div>
                  <h3 className="font-bold text-lg mb-2">Nhận tin mới mỗi ngày</h3>
                  <p className="text-sm text-white/70 mb-4">
                    Cập nhật tin tức sớm nhất vào hộp thư của bạn
                  </p>
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-2.5 bg-white/15 border-0 rounded-lg text-white placeholder-white/50 mb-3 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button className="w-full px-4 py-2.5 bg-white text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles Grid */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-[20px] p-8 mt-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-6 bg-blue-600 rounded" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Bài viết khác trong chuyên mục
                  </h3>
                </div>
                <Link
                  to={article.categorySlug || '/'}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Xem thêm →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles.slice(0, 4).map((relArticle) => (
                  <ArticleCard
                    key={relArticle.id}
                    article={relArticle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
