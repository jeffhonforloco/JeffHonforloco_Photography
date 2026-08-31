import baseConfig from './tailwind.config';

export default {
  ...baseConfig,
  content: [
    './src/pages/Index.tsx',
    './src/components/Layout.tsx',
    './src/components/layout/Header.tsx',
    './src/components/layout/DesktopNavigation.tsx',
    './src/components/layout/MobileNavigation.tsx',
    './src/components/layout/PortfolioDropdown.tsx',
    './src/components/layout/SocialMediaIcons.tsx',
    './src/components/sections/HeroSection.tsx',
    './src/components/sections/hero/*.tsx',
  ],
};
