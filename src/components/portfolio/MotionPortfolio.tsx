import Layout from '../Layout';
import VideoPlayer from '../VideoPlayer';
import { MotionItem } from '@/types/content';

interface MotionPortfolioProps {
  motionData: MotionItem[];
}

const MotionPortfolio = ({ motionData }: MotionPortfolioProps) => {
  if (motionData.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white/40 text-xl tracking-widest uppercase">Motion Portfolio — Coming Soon</p>
        </div>
      </Layout>
    );
  }

  const featuredVideo = motionData.find(video => video.featured);
  const primaryVideo = featuredVideo ?? motionData[0];
  const otherVideos = motionData.filter(video => video !== primaryVideo);
  const mobileVideos = otherVideos.slice(0, 4);

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        {/* Featured Video - Only on Desktop */}
        <section className="hidden md:block pt-32 pb-8">
          {primaryVideo && (
            <div className="px-8">
              <div className="max-w-7xl mx-auto">
                <VideoPlayer video={primaryVideo} />
              </div>
            </div>
          )}
        </section>

        {/* Mobile Collage Layout */}
        <section className="md:hidden pt-20 pb-20">
          <div className="p-1 space-y-1">
            {/* Large Featured Video at Top */}
            <VideoPlayer video={primaryVideo} className="group cursor-pointer" />
            
            {/* 2-Column Grid Below */}
            {mobileVideos.length > 0 && (
              <div className="grid grid-cols-2 gap-1">
                {mobileVideos.map((video, index) => (
                  <VideoPlayer key={index} video={video} className="group cursor-pointer" />
                ))}
              </div>
            )}
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
