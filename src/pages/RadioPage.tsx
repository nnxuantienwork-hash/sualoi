import { radioEpisodes } from '../data/radioEpisodes';
import RadioHero from '../components/radio/RadioHero';
import RadioGrid from '../components/radio/RadioGrid';
import SuggestedCarousel from '../components/radio/SuggestedCarousel';

export default function RadioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <RadioHero episode={radioEpisodes[0]} />
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <RadioGrid title="Mới nhất" episodes={radioEpisodes.slice(0, 4)} />
          <SuggestedCarousel title="Gợi ý cho bạn" episodes={radioEpisodes.slice(4, 8)} />
          <RadioGrid title="Tất cả tập" episodes={radioEpisodes} />
        </div>
      </section>
      <div className="h-20" />
    </div>
  );
}