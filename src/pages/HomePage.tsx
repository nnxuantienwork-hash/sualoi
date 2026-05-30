import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ChevronRight } from 'lucide-react';
import { radioEpisodes } from '../data/radioEpisodes';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { fetchArticles, fetchArticlesByCategory, fetchMostRead, Article } from '../lib/supabase';
import { newsArticles as fallbackArticles, getLatestByCategory as fallbackGetLatestByCategory, Article as StaticArticle } from '../data/newsData';

type DisplayArticle = Article | StaticArticle;

export default function HomePage() {
  const { playEpisode } = useAudioPlayer();
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [cityNews, setCityNews] = useState<Article[]>([]);
  const [wardNews, setWardNews] = useState<Article[]>([]);
  const [mostRead, setMostRead] = useState<Article[]>([]);

  const radioList = radioEpisodes.slice(0, 4);

  // Fallback to static data if database is empty
  const displayArticles: DisplayArticle[] = articles.length > 0 ? articles : fallbackArticles.slice(0, 20);
  const displayCityNews: DisplayArticle[] = cityNews.length > 0 ? cityNews : fallbackGetLatestByCategory('/thanh-pho', 4);
  const displayWardNews: DisplayArticle[] = wardNews.length > 0 ? wardNews : fallbackGetLatestByCategory('/168-phuong-xa', 4);
  const displayLifeNews = fallbackGetLatestByCategory('/doi-song', 4);
  const displayEntNews = fallbackGetLatestByCategory('/giai-tri', 6);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayArticles.slice(0, 5).length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayArticles.length]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allArticles, cityData, wardData, mostReadData] = await Promise.all([
        fetchArticles(20),
        fetchArticlesByCategory('thanh-pho', 4),
        fetchArticlesByCategory('168-phuong-xa', 4),
        fetchMostRead(7)
      ]);

      if (allArticles.length > 0) setArticles(allArticles);
      if (cityData.length > 0) setCityNews(cityData);
      if (wardData.length > 0) setWardNews(wardData);
      if (mostReadData.length > 0) setMostRead(mostReadData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sliderNews = displayArticles.slice(0, 5);
  const topFour = displayArticles.slice(0, 4);

  const getArticleDate = (article: DisplayArticle): string => {
    return 'created_at' in article ? article.created_at : new Date(article.createdAt || Date.now()).toISOString();
  };

  const getArticleIsBreaking = (article: DisplayArticle): boolean => {
    return 'is_breaking' in article ? article.is_breaking || false : article.isBreaking || false;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Vua xong';
    if (diffMins < 60) return `${diffMins} phut truoc`;
    if (diffHours < 24) return `${diffHours} gio truoc`;
    return `${Math.floor(diffMs / 86400000)} ngay truoc`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
  };

  return (
    <>
      <main className="max-w-[1280px] mx-auto px-6 py-10">
        {loading && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 animate-pulse z-50" />
        )}

        <div className="flex justify-end mb-4">
          <Link
            to="/admin"
            className="text-sm text-gray-500 hover:text-[#0057B8] font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Quan ly bai viet
          </Link>
        </div>

        {/* 1. 4 KHỐI LINK NHANH ĐẦU TRANG */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {topFour.map((article) => (
            <Link key={article.id} to={`/bai-viet/${article.id}`} className="group bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-3 items-center">
              <img
                src={article.image || `https://picsum.photos/seed/${article.id}/800/450`}
                alt={article.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#0057B8] transition-colors">{article.title}</h3>
            </Link>
          ))}
        </section>

        {/* 2. HERO SLIDER */}
        <section className="relative w-full aspect-[21/9] md:aspect-[25/10] overflow-hidden mb-16 rounded-2xl shadow-2xl bg-gray-200">
          <AnimatePresence mode='wait'>
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={sliderNews[index]?.image || `https://picsum.photos/seed/${index}/800/450`}
                className="w-full h-full object-cover"
                alt={sliderNews[index]?.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-white">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-3xl"
                >
                  {getArticleIsBreaking(sliderNews[index]) && (
                    <span className="bg-red-600 text-white px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-widest inline-block mb-4">
                      Tin nong
                    </span>
                  )}
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight group-hover:text-blue-400 transition-colors cursor-pointer">
                    {sliderNews[index]?.title}
                  </h1>
                  <p className="text-gray-200 text-sm md:text-lg line-clamp-2 font-medium opacity-90 mb-6">
                    {sliderNews[index]?.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                    <span>{sliderNews[index]?.author}</span>
                    <span>-</span>
                    <span>{formatTime(getArticleDate(sliderNews[index]))}</span>
                    <span>-</span>
                    <span>{formatViews(sliderNews[index]?.views || 0)} luot xem</span>
                  </div>
                  <Link
                    to={`/bai-viet/${sliderNews[index]?.id}`}
                    className="flex items-center gap-2 text-white font-bold hover:text-blue-300 transition-all group w-fit"
                  >
                    Doc tiep <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-6 right-12 hidden md:flex gap-3">
            {sliderNews.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${index === i ? 'w-8 bg-[#0057B8]' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </section>

        {/* 3. ĐỌC NHIỀU NHẤT */}
        {mostRead.length > 0 && (
          <section className="mb-12 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-orange-500" />
              <h2 className="text-lg font-bold uppercase tracking-tight">Doc nhieu nhat</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {mostRead.map((article, idx) => (
                <Link key={article.id} to={`/bai-viet/${article.id}`} className="group flex flex-col">
                  <div className="relative">
                    <span className="absolute -top-2 -left-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-sm z-10">
                      {idx + 1}
                    </span>
                    <img
                      src={article.image || `https://picsum.photos/seed/${article.id}/800/450`}
                      className="w-full h-32 object-cover rounded-lg"
                      alt={article.title}
                    />
                  </div>
                  <h3 className="mt-2 font-bold text-sm line-clamp-2 group-hover:text-[#0057B8]">{article.title}</h3>
                  <span className="text-xs text-gray-500 mt-1">{formatViews(article.views)} luot xem</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. THÀNH PHỐ HÔM NAY & RADIO */}
        <div className="grid grid-cols-12 gap-12 mb-16">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-[#0057B8]" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Thanh pho hom nay</h2>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            {displayCityNews.map((art) => (
              <Link key={art.id} to={`/bai-viet/${art.id}`} className="flex gap-4 group border-b border-gray-100 pb-6 mb-6">
                <img
                  src={art.image || `https://picsum.photos/seed/${art.id}/800/450`}
                  className="w-32 md:w-48 h-20 md:h-28 object-cover rounded-xl"
                  alt={art.title}
                />
                <div className="py-1">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#0057B8] line-clamp-2">{art.title}</h3>
                  <p className="text-gray-500 text-sm hidden md:line-clamp-2">{art.excerpt}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{formatTime(getArticleDate(art))}</span>
                    <span>-</span>
                    <span>{formatViews(art.views)} luot xem</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <Mic className="w-5 h-5 text-[#0057B8]" />
              <h2 className="text-lg font-bold uppercase tracking-tight">Radio Online</h2>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <div className="space-y-6">
              {radioList.map((ep) => (
                <div key={ep.id} onClick={() => playEpisode(ep)} className="flex gap-4 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-[#0057B8] group-hover:bg-[#0057B8] group-hover:text-white transition-all">
                    <Mic size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#0057B8] line-clamp-2">{ep.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold">{ep.host.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. 168 PHƯỜNG - XÃ */}
        <section className="mb-16">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 bg-[#0057B8]" />
              <h2 className="text-xl font-bold uppercase tracking-tight">168 Phuong - Xa</h2>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <Link to="/168-phuong-xa" className="text-sm text-[#0057B8] font-bold hover:underline whitespace-nowrap">Xem tat ca</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayWardNews.map((art) => (
              <Link key={art.id} to={`/bai-viet/${art.id}`} className="flex flex-col gap-3 group">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={art.image || `https://picsum.photos/seed/${art.id}/800/450`}
                    className="w-full h-52 object-cover transition-transform group-hover:scale-105 duration-500"
                    alt={art.title}
                  />
                </div>
                <h3 className="font-bold text-base group-hover:text-[#0057B8] line-clamp-2">{art.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{formatTime(getArticleDate(art))}</span>
                  <span>-</span>
                  <span>{formatViews(art.views)} luot xem</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* 6. GÓC NHÌN (DARK SECTION) */}
      <section className="bg-[#000B2B] w-full py-16">
        <div className="max-w-[1280px] mx-auto px-6 text-white">
          <div className="flex items-center gap-3 mb-10">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Goc nhin chuyen gia</h2>
            <div className="h-px bg-white/20 flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            {displayLifeNews.slice(0, 2).map((art) => (
              <Link key={art.id} to={`/bai-viet/${art.id}`} className="group block">
                <div className="w-full h-[380px] bg-gray-800 rounded-2xl mb-5 overflow-hidden">
                   <img src={art.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={art.title} />
                </div>
                <h3 className="font-bold text-2xl group-hover:text-blue-400 transition-colors leading-snug">{art.title}</h3>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {displayLifeNews.slice(0, 3).map((art) => (
              <Link key={art.id} to={`/bai-viet/${art.id}`} className="group block">
                <div className="w-full h-[240px] bg-gray-800 rounded-xl mb-4 overflow-hidden">
                   <img src={art.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={art.title} />
                </div>
                <h3 className="font-bold text-lg group-hover:text-blue-400 line-clamp-2">{art.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ĐỜI SỐNG */}
      <main className="max-w-[1280px] mx-auto px-6 py-20">
        <section>
          <div className="flex items-center gap-3 justify-between mb-8">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 bg-[#0057B8]" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Doi song</h2>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <Link to="/doi-song" className="text-sm text-[#0057B8] font-bold hover:underline">Xem tat ca</Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {displayLifeNews.length > 0 && (
            <div className="lg:col-span-7">
              <Link to={`/bai-viet/${displayLifeNews[0].id}`} className="group block h-full">
                <div className="overflow-hidden rounded-2xl shadow-xl">
                    <img src={displayLifeNews[0].image} className="w-full h-[450px] object-cover group-hover:scale-105 duration-700" alt={displayLifeNews[0].title} />
                </div>
                <h3 className="mt-6 text-2xl font-black group-hover:text-[#0057B8] leading-tight transition-colors">{displayLifeNews[0].title}</h3>
              </Link>
            </div>
          )}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {displayLifeNews.slice(1, 4).map((art) => (
                <Link key={art.id} to={`/bai-viet/${art.id}`} className="flex gap-5 group h-full">
                  <img src={art.image} className="w-32 md:w-40 h-full object-cover rounded-xl flex-shrink-0" alt={art.title} />
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-base group-hover:text-[#0057B8] transition-colors line-clamp-2">{art.title}</h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{art.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 8. GIẢI TRÍ */}
      <main className="max-w-[1280px] mx-auto px-6 py-10 pb-20">
        <section>
          <div className="flex items-center justify-between gap-3 mb-10">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-3 h-3 bg-[#0057B8]" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Giai tri</h2>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <Link to="/giai-tri" className="text-sm text-[#0057B8] font-bold hover:underline">Xem tat ca</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayEntNews.map((art) => (
              <Link key={art.id} to={`/bai-viet/${art.id}`} className="group block space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-sm">
                  <img src={art.image} className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-105" alt={art.title} />
                </div>
                <h3 className="font-bold text-lg group-hover:text-[#0057B8] transition-colors leading-snug line-clamp-2">{art.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {art.excerpt || "Kham pha nhung goc nhin van hoa, su kien giai tri dac sac nhat dien ra tai thanh pho."}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
