import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Save, Upload, Image, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const DEFAULT_SETTINGS = {
  mainLogo: '/images/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png',
  heroTitle: 'FASHION & BEAUTY PHOTOGRAPHY',
  heroSubtitle: 'Nationwide bookings for high-end brands, celebrities & models',
  primaryButtonText: 'Book Session',
  primaryButtonLink: '/contact',
  secondaryButtonText: 'View Portfolio',
  secondaryButtonLink: '/portfolio',
  showButtons: true,
  autoSlideSpeed: 40,
  enableParallax: true,
};

const DEFAULT_IMAGES = [
  '/images/cd3eb066-6ffe-4e1e-9613-a1b067806092.png',
  '/images/060e27c9-b2d8-4f33-b575-794287894fd6.png',
  '/images/1bb36c8a-ad7c-469a-bc03-92b007c271c3.png',
  '/images/5f1a4833-8606-47d0-8677-805cd81b2558.png',
  '/images/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.png',
  '/images/0987daa0-e6fd-4914-b820-b8b235e70983.png',
  '/images/f36a817e-cd75-4d0b-a900-ce69f01e6afb.png',
  '/images/1290de24-fbc4-4577-a048-fea0e3630a36.png',
  '/images/bcbe9d80-3fd0-494c-a9e9-a4d5ab099c02.png',
  '/images/13e3124a-ebf5-4084-94fa-5b85aacda039.png',
  '/images/04f6a5f8-91e9-4568-84ae-63cac4830a52.png',
  '/images/2523c649-4617-43c2-9e9e-ebf4ee328067.png',
  '/images/b573482f-31ab-49e5-af48-586d9aeb6909.png',
  '/images/be107293-394e-46fd-9fcd-d1eb5781ff56.png',
  '/images/7c28c520-783d-4733-ad48-9683204ef054.png',
  '/images/c279306c-86cb-49fe-a393-c5330888db34.png',
];

const AdminHero = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [heroSettings, setHeroSettings] = useState(DEFAULT_SETTINGS);
  const [portfolioImages, setPortfolioImages] = useState<string[]>(DEFAULT_IMAGES);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
        const [settingsRes, imagesRes] = await Promise.all([
          fetch('/api/v1/settings/hero_settings', { headers }),
          fetch('/api/v1/settings/hero_images', { headers }),
        ]);
        const settingsData = await settingsRes.json();
        const imagesData = await imagesRes.json();
        if (settingsData.success && settingsData.data) {
          setHeroSettings(prev => ({ ...prev, ...settingsData.data }));
        }
        if (imagesData.success && Array.isArray(imagesData.data) && imagesData.data.length > 0) {
          setPortfolioImages(imagesData.data);
        }
      } catch { /* use defaults */ }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      await Promise.all([
        fetch('/api/v1/settings/hero_settings', {
          method: 'PUT',
          headers,
          body: JSON.stringify(heroSettings),
        }),
        fetch('/api/v1/settings/hero_images', {
          method: 'PUT',
          headers,
          body: JSON.stringify(portfolioImages),
        }),
      ]);
      toast({
        title: 'Hero Settings Saved',
        description: 'Homepage hero section has been updated successfully.',
      });
    } catch {
      toast({
        title: 'Save Failed',
        description: 'Could not save hero settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setPortfolioImages([...portfolioImages, newImageUrl.trim()]);
      setNewImageUrl('');
      toast({ title: 'Image Added', description: 'New image added to hero slideshow.' });
    }
  };

  const handleRemoveImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
    toast({ title: 'Image Removed', description: 'Image removed from hero slideshow.' });
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPortfolioImages(prev => [...prev, data.url]);
        toast({ title: 'Image Uploaded', description: 'Image added to hero slideshow.' });
      } else {
        toast({ title: 'Upload Failed', description: data.message || 'Unknown error', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Upload Failed', description: 'Could not upload image.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hero Section Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Control your homepage hero section content and appearance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Content</CardTitle>
            <CardDescription>Manage text content and buttons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mainLogo">Main Logo URL</Label>
              <Input
                id="mainLogo"
                value={heroSettings.mainLogo}
                onChange={(e) => setHeroSettings({ ...heroSettings, mainLogo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroTitle">Main Title</Label>
              <Input
                id="heroTitle"
                value={heroSettings.heroTitle}
                onChange={(e) => setHeroSettings({ ...heroSettings, heroTitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                value={heroSettings.heroSubtitle}
                onChange={(e) => setHeroSettings({ ...heroSettings, heroSubtitle: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryButtonText">Primary Button Text</Label>
                <Input
                  id="primaryButtonText"
                  value={heroSettings.primaryButtonText}
                  onChange={(e) => setHeroSettings({ ...heroSettings, primaryButtonText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryButtonLink">Primary Button Link</Label>
                <Input
                  id="primaryButtonLink"
                  value={heroSettings.primaryButtonLink}
                  onChange={(e) => setHeroSettings({ ...heroSettings, primaryButtonLink: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secondaryButtonText">Secondary Button Text</Label>
                <Input
                  id="secondaryButtonText"
                  value={heroSettings.secondaryButtonText}
                  onChange={(e) => setHeroSettings({ ...heroSettings, secondaryButtonText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryButtonLink">Secondary Button Link</Label>
                <Input
                  id="secondaryButtonLink"
                  value={heroSettings.secondaryButtonLink}
                  onChange={(e) => setHeroSettings({ ...heroSettings, secondaryButtonLink: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showButtons">Show Action Buttons</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Display call-to-action buttons on hero</p>
              </div>
              <Switch
                id="showButtons"
                checked={heroSettings.showButtons}
                onCheckedChange={(checked) => setHeroSettings({ ...heroSettings, showButtons: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Animation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Animation Settings</CardTitle>
            <CardDescription>Control slideshow behavior and effects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="autoSlideSpeed">Auto-slide Duration (seconds)</Label>
              <Input
                id="autoSlideSpeed"
                type="number"
                value={heroSettings.autoSlideSpeed}
                onChange={(e) => setHeroSettings({ ...heroSettings, autoSlideSpeed: parseInt(e.target.value) })}
                min="10"
                max="120"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">Time for complete slideshow cycle</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableParallax">Enable Parallax Effect</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add subtle parallax scrolling effect</p>
              </div>
              <Switch
                id="enableParallax"
                checked={heroSettings.enableParallax}
                onCheckedChange={(checked) => setHeroSettings({ ...heroSettings, enableParallax: checked })}
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving
                ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Saving…' : 'Save Hero Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Images Management */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Slideshow Images</CardTitle>
          <CardDescription>Manage images shown in the background slideshow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste image URL"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
            />
            <Button variant="outline" onClick={handleAddImage}>
              <Image className="h-4 w-4 mr-2" />
              Add URL
            </Button>
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <Upload className="h-4 w-4" />}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadFile(file);
                e.target.value = '';
              }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {portfolioImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Hero image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {portfolioImages.length} images in slideshow. Click Save Hero Settings to persist changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHero;
