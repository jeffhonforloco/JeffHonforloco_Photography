import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Save, Globe, Search, Share2, BarChart3 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdminSEO = () => {
  const { toast } = useToast();
  
  const [globalSEO, setGlobalSEO] = useState({
    siteTitle: 'Jeff Honforloco Photography - World\'s Premier Luxury Fashion & Beauty Photographer | Global Elite Services',
    siteDescription: 'World-class luxury fashion, beauty & editorial photographer. Elite photography services for Fortune 500 brands, A-list celebrities & top models. Global availability across NYC, LA, Miami, Paris, London.',
    keywords: 'world\'s best luxury fashion photographer, elite beauty photographer NYC, top celebrity photographer Los Angeles, premier editorial photographer Miami, international fashion photographer Paris London, luxury brand photographer, A-list celebrity photography, Fortune 500 photography services',
    canonicalUrl: 'https://jeffhonforlocophotos.com',
    robotsContent: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  });

  const [socialMedia, setSocialMedia] = useState({
    ogTitle: 'Jeff Honforloco Photography - World\'s Premier Luxury Fashion & Beauty Photographer | Global Elite Services',
    ogDescription: 'World-class luxury fashion, beauty & editorial photographer. Elite photography services for Fortune 500 brands, A-list celebrities & top models. Global availability across NYC, LA, Miami, Paris, London.',
    ogImage: 'https://jeffhonforlocophotos.com/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png',
    twitterTitle: 'Jeff Honforloco Photography - World\'s Premier Luxury Fashion & Beauty Photographer',
    twitterDescription: 'World-class luxury fashion, beauty & editorial photographer. Elite photography services for Fortune 500 brands, A-list celebrities & top models. Global availability.',
    twitterImage: 'https://jeffhonforlocophotos.com/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png',
    twitterHandle: '@jeffhonforloco'
  });

  const [analytics, setAnalytics] = useState({
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    facebookPixelId: '',
    hotjarId: '',
    linkedInInsightTag: ''
  });

  const [structuredData, setStructuredData] = useState({
    businessName: 'Jeff Honforloco',
    businessType: 'ProfessionalService',
    jobTitle: 'World\'s Premier Luxury Fashion & Beauty Photographer',
    description: 'World-class luxury fashion, beauty & editorial photographer serving Fortune 500 brands, A-list celebrities, and elite models. Global availability across major fashion capitals including NYC, LA, Miami, Paris, London, Monaco, and Switzerland.',
    address: 'Providence, RI, US',
    serviceAreas: 'New York City, Los Angeles, Miami, Chicago, Atlanta, Paris, London, Monaco, Switzerland',
    priceRange: '$$$$',
    services: 'Luxury Fashion Photography, Elite Beauty Photography, Editorial Photography, Celebrity Photography, Fashion Week Photography, Luxury Brand Campaigns'
  });

  const [pageSpecificSEO] = useState([
    {
      page: 'Homepage',
      title: 'Current: Jeff Honforloco Photography - World\'s Premier Luxury Fashion & Beauty Photographer',
      description: 'Current: World-class luxury fashion, beauty & editorial photographer...',
      status: 'Optimized',
      lastUpdated: '2024-01-20'
    },
    {
      page: 'Portfolio',
      title: 'Professional Fashion & Beauty Photography Portfolio | Jeff Honforloco',
      description: 'View stunning fashion, beauty & editorial photography portfolio...',
      status: 'Needs Update',
      lastUpdated: '2024-01-15'
    },
    {
      page: 'About',
      title: 'About Jeff Honforloco - Award-Winning Fashion Photographer',
      description: 'Learn about Jeff Honforloco, internationally recognized fashion photographer...',
      status: 'Optimized',
      lastUpdated: '2024-01-18'
    },
    {
      page: 'Contact',
      title: 'Book Elite Fashion Photography Session | Jeff Honforloco',
      description: 'Book your luxury fashion or beauty photography session...',
      status: 'Optimized',
      lastUpdated: '2024-01-19'
    }
  ]);

  const handleSave = (section: string) => {
    toast({
      title: "SEO Settings Saved",
      description: `${section} SEO settings have been updated successfully.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Optimized':
        return <Badge className="bg-green-100 text-green-800">Optimized</Badge>;
      case 'Needs Update':
        return <Badge variant="destructive">Needs Update</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SEO Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Optimize your website for search engines and social media</p>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="structured" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Structured Data
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Page SEO
          </TabsTrigger>
        </TabsList>

        {/* Global SEO */}
        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global SEO Settings</CardTitle>
              <CardDescription>Configure site-wide SEO elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={globalSEO.siteTitle}
                  onChange={(e) => setGlobalSEO({ ...globalSEO, siteTitle: e.target.value })}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {globalSEO.siteTitle.length}/60 characters (recommended: 50-60)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={globalSEO.siteDescription}
                  onChange={(e) => setGlobalSEO({ ...globalSEO, siteDescription: e.target.value })}
                  rows={3}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {globalSEO.siteDescription.length}/160 characters (recommended: 150-160)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Meta Keywords</Label>
                <Textarea
                  id="keywords"
                  value={globalSEO.keywords}
                  onChange={(e) => setGlobalSEO({ ...globalSEO, keywords: e.target.value })}
                  rows={3}
                  placeholder="Separate keywords with commas"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={globalSEO.canonicalUrl}
                    onChange={(e) => setGlobalSEO({ ...globalSEO, canonicalUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="robotsContent">Robots Meta</Label>
                  <Input
                    id="robotsContent"
                    value={globalSEO.robotsContent}
                    onChange={(e) => setGlobalSEO({ ...globalSEO, robotsContent: e.target.value })}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSave('Global')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Global SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Graph (Facebook/LinkedIn)</CardTitle>
              <CardDescription>Configure how your site appears when shared on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ogTitle">OG Title</Label>
                <Input
                  id="ogTitle"
                  value={socialMedia.ogTitle}
                  onChange={(e) => setSocialMedia({ ...socialMedia, ogTitle: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ogDescription">OG Description</Label>
                <Textarea
                  id="ogDescription"
                  value={socialMedia.ogDescription}
                  onChange={(e) => setSocialMedia({ ...socialMedia, ogDescription: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input
                  id="ogImage"
                  value={socialMedia.ogImage}
                  onChange={(e) => setSocialMedia({ ...socialMedia, ogImage: e.target.value })}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recommended size: 1200x630 pixels
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Twitter Cards</CardTitle>
              <CardDescription>Configure Twitter-specific sharing metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  value={socialMedia.twitterHandle}
                  onChange={(e) => setSocialMedia({ ...socialMedia, twitterHandle: e.target.value })}
                  placeholder="@yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitterTitle">Twitter Title</Label>
                <Input
                  id="twitterTitle"
                  value={socialMedia.twitterTitle}
                  onChange={(e) => setSocialMedia({ ...socialMedia, twitterTitle: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitterDescription">Twitter Description</Label>
                <Textarea
                  id="twitterDescription"
                  value={socialMedia.twitterDescription}
                  onChange={(e) => setSocialMedia({ ...socialMedia, twitterDescription: e.target.value })}
                  rows={2}
                />
              </div>
              
              <Button onClick={() => handleSave('Social Media')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Social Media Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>Configure tracking codes for various analytics platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={analytics.googleAnalyticsId}
                    onChange={(e) => setAnalytics({ ...analytics, googleAnalyticsId: e.target.value })}
                    placeholder="GA-XXXXXXXXX or G-XXXXXXXXXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleSearchConsoleId">Google Search Console</Label>
                  <Input
                    id="googleSearchConsoleId"
                    value={analytics.googleSearchConsoleId}
                    onChange={(e) => setAnalytics({ ...analytics, googleSearchConsoleId: e.target.value })}
                    placeholder="Verification code"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixelId"
                    value={analytics.facebookPixelId}
                    onChange={(e) => setAnalytics({ ...analytics, facebookPixelId: e.target.value })}
                    placeholder="Facebook Pixel ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hotjarId">Hotjar Site ID</Label>
                  <Input
                    id="hotjarId"
                    value={analytics.hotjarId}
                    onChange={(e) => setAnalytics({ ...analytics, hotjarId: e.target.value })}
                    placeholder="Hotjar Site ID"
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSave('Analytics')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Analytics Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structured Data */}
        <TabsContent value="structured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Structured Data (Schema.org)</CardTitle>
              <CardDescription>Configure structured data for better search engine understanding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={structuredData.businessName}
                    onChange={(e) => setStructuredData({ ...structuredData, businessName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={structuredData.jobTitle}
                    onChange={(e) => setStructuredData({ ...structuredData, jobTitle: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={structuredData.description}
                  onChange={(e) => setStructuredData({ ...structuredData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceAreas">Service Areas</Label>
                <Textarea
                  id="serviceAreas"
                  value={structuredData.serviceAreas}
                  onChange={(e) => setStructuredData({ ...structuredData, serviceAreas: e.target.value })}
                  rows={2}
                  placeholder="Separate areas with commas"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="services">Services Offered</Label>
                <Textarea
                  id="services"
                  value={structuredData.services}
                  onChange={(e) => setStructuredData({ ...structuredData, services: e.target.value })}
                  rows={2}
                  placeholder="Separate services with commas"
                />
              </div>
              
              <Button onClick={() => handleSave('Structured Data')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Structured Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page-Specific SEO */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page-Specific SEO</CardTitle>
              <CardDescription>Monitor and manage SEO for individual pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageSpecificSEO.map((page, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{page.page}</h3>
                      {getStatusBadge(page.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Title:</strong> {page.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Description:</strong> {page.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Last updated: {page.lastUpdated}
                      </span>
                      <Button size="sm" variant="outline">
                        Edit SEO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;