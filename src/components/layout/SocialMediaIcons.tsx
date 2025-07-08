import { Facebook, Instagram, Youtube } from 'lucide-react';

interface SocialMediaIconsProps {
  variant: 'desktop' | 'mobile' | 'mobile-menu';
}

const SocialMediaIcons = ({ variant }: SocialMediaIconsProps) => {
  const socialLinks = [
    { Icon: Facebook, href: "#" },
    { Icon: Instagram, href: "https://instagram.com/jeffhonforlocophotos" },
    { 
      Icon: ({ className }: { className: string }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ), 
      href: "#" 
    },
    { 
      Icon: ({ className }: { className: string }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h3v18H3V3zm15 0h3v18h-3V3zM9 7l3 5 3-5h2l-4 6.5V19h-2v-5.5L7 7h2z"/>
        </svg>
      ), 
      href: "https://youpic.com/jeffhonforlocophotos" 
    },
    { Icon: Youtube, href: "https://youtube.com/@jeffhonforlocophotos" }
  ];

  if (variant === 'desktop') {
    return (
      <div className="hidden md:flex items-center space-x-3">
        {socialLinks.map(({ Icon, href }, index) => (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-all duration-300 hover:scale-125 transform">
            <Icon className="w-7 h-7" />
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className="md:hidden flex items-center space-x-2">
        {socialLinks.map(({ Icon, href }, index) => (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-all duration-300 hover:scale-125 transform">
            <Icon className="w-6 h-6" />
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'mobile-menu') {
    return (
      <div className="mt-8 flex items-center space-x-4">
        {socialLinks.map(({ Icon, href }, index) => (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-125 transform">
            <Icon className="w-4 h-4" />
          </a>
        ))}
      </div>
    );
  }

  return null;
};

export default SocialMediaIcons;