import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { radioEpisodes } from './data/radioEpisodes';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';

// Các thành phần Layout
import Header from './components/Header';
import FloatingNav from './components/FloatingNav';
import ReadingProgressBar from './components/ReadingProgressBar';
import MiniPlayer from './components/radio/MiniPlayer';
import ScrollToTop from './components/ScrollToTop';

// Các trang
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import RadioPage from './pages/RadioPage';
import ArticlePage from './pages/ArticlePage';
import TagPage from './pages/TagPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AudioPlayerProvider episodes={radioEpisodes}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-ink-50 transition-colors duration-300 relative">
          <ReadingProgressBar />

          {/* Header được ghim cố định ở đây */}
          <div className="sticky top-0 z-50 bg-white shadow-sm">
            <Header />
          </div>

          {/* Nội dung thay đổi theo đường dẫn */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/thanh-pho" element={<CategoryPage categorySlug="thanh-pho" />} />
            <Route path="/168-phuong-xa" element={<CategoryPage categorySlug="168-phuong-xa" />} />
            <Route path="/kinh-te" element={<CategoryPage categorySlug="kinh-te" />} />
            <Route path="/thoi-su" element={<CategoryPage categorySlug="thoi-su" />} />
            <Route path="/van-hoa" element={<CategoryPage categorySlug="van-hoa" />} />
            <Route path="/giai-tri" element={<CategoryPage categorySlug="giai-tri" />} />
            <Route path="/the-thao" element={<CategoryPage categorySlug="the-thao" />} />
            <Route path="/suc-khoe" element={<CategoryPage categorySlug="suc-khoe" />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/bai-viet/:articleId" element={<ArticlePage />} />
            <Route path="/tag/:tagName" element={<TagPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>

          <FloatingNav />
          <MiniPlayer />
        </div>
      </Router>
    </AudioPlayerProvider>
  );
}