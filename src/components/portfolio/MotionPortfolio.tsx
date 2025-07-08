import Layout from '../Layout';
import VideoPlayer from '../VideoPlayer';
import { MotionItem } from '@/types/content';

interface MotionPortfolioProps {
  motionData: MotionItem[];
}

const MotionPortfolio = ({ motionData }: MotionPortfolioProps) => {
  const featuredVideo = motionData.find(video => video.featured);
  const otherVideos = motionData.filter(video => !video.featured);

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        {/* Featured Video - Only on Desktop */}
        <section className="hidden md:block pt-32 pb-8">
          {featuredVideo && (
            <div className="px-8">
              <div className="max-w-7xl mx-auto">
                <VideoPlayer video={featuredVideo} />
              </div>
            </div>
          )}
        </section>

        {/* Mobile Collage Layout */}
        <section className="md:hidden pt-20 pb-20">
          <div className="p-1 space-y-1">
            {/* Large Featured Video at Top */}
            <VideoPlayer video={motionData[0]} className="group cursor-pointer" />
            
            {/* 2-Column Grid Below */}
            <div className="grid grid-cols-2 gap-1">
              {/* Video 2 */}
              <VideoPlayer video={motionData[1]} className="group cursor-pointer" />
              
              {/* Video 3 */}
              <VideoPlayer video={motionData[2]} className="group cursor-pointer" />
              
              {/* Video 4 */}
              <VideoPlayer video={motionData[3]} className="group cursor-pointer" />
              
              {/* Video 5 with MORE overlay */}
              <div className="relative aspect-video overflow-hidden group cursor-pointer">
                <img
                  src={motionData[4]?.src}
                  alt={motionData[4]?.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-teal-500/80 group-hover:bg-teal-500/60 transition-colors duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold tracking-wider">MORE</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Motion Grid */}
        <section className="hidden md:block pb-20">
          <div className="px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherVideos.map((video, index) => (
                  <VideoPlayer key={index} video={video} className="group cursor-pointer" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Copyright Notice */}
        <section className="pb-8">
          <div className="px-8">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-gray-500 text-sm">
                © 2025 Jeff Honforloco Photography. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default MotionPortfolio;