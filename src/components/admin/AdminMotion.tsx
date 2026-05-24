import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Eye, Upload, Video, Youtube, Play } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Switch } from '../ui/switch';
import { extractYouTubeId, isYouTubeUrl, getYouTubeThumbnail } from '@/lib/youtube-utils';
import VideoPlayer from '../VideoPlayer';
import { MotionItem } from '@/types/content';

interface MotionItemWithId extends MotionItem {
  id: string;
}

const AdminMotion = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [motionItems, setMotionItems] = useState<MotionItem[]>([]);
  const [behindLensVideo, setBehindLensVideo] = useState<MotionItem | null>(null);

  // Load existing motion items
  useEffect(() => {
    const savedItems = localStorage.getItem('motionItems');
    if (savedItems) {
      const items = JSON.parse(savedItems);
      setMotionItems(items.filter((item: MotionItem) => !item.isBehindLens));
      setBehindLensVideo(items.find((item: MotionItem) => item.isBehindLens) || null);
    }
  }, []);

  // Save motion items to localStorage
  const saveToStorage = (items: MotionItem[], behindLens: MotionItem | null) => {
    const allItems = [...items];
    if (behindLens) {
      allItems.push({ ...behindLens, isBehindLens: true });
    }
    localStorage.setItem('motionItems', JSON.stringify(allItems));
  };

  const [selectedItem, setSelectedItem] = useState<MotionItemWithId | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    src: '',
    alt: '',
    caption: '',
    isVideo: true,
    featured: false,
    isYouTube: false,
    youTubeId: '',
    isBehindLens: false
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleEdit = (item: MotionItem, index: number) => {
    setSelectedItem({ ...item, id: index.toString() });
    setFormData({
      src: item.src,
      alt: item.alt,
      caption: item.caption,
      isVideo: item.isVideo,
      featured: item.featured || false,
      isYouTube: item.isYouTube || false,
      youTubeId: item.youTubeId || '',
      isBehindLens: item.isBehindLens || false
    });
    setIsEditing(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid video file (MP4, WebM, OGG, MOV, AVI).",
        variant: "destructive"
      });
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a video file smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress (in real app, this would be actual upload)
      const formData = new FormData();
      formData.append('video', file);

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // Create object URL for preview (in real app, this would be the uploaded file URL)
      const videoUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        src: videoUrl,
        isYouTube: false,
        youTubeId: ''
      }));

      toast({
        title: "Upload Successful",
        description: "Video has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleYouTubeUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, src: url }));
    
    if (isYouTubeUrl(url)) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        setFormData(prev => ({
          ...prev,
          isYouTube: true,
          youTubeId: videoId
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        isYouTube: false,
        youTubeId: ''
      }));
    }
  };

  const handleSave = () => {
    if (!formData.src || !formData.alt || !formData.caption) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const itemData: MotionItem = {
      src: formData.src,
      alt: formData.alt,
      caption: formData.caption,
      isVideo: formData.isVideo,
      featured: formData.featured,
      isYouTube: formData.isYouTube,
      youTubeId: formData.youTubeId,
      isBehindLens: formData.isBehindLens
    };

    if (formData.isBehindLens) {
      setBehindLensVideo(itemData);
      saveToStorage(motionItems, itemData);
      toast({
        title: "Behind the Lens Updated",
        description: "Behind the Lens video has been successfully updated.",
      });
    } else if (selectedItem) {
      // Update existing item
      setMotionItems(items =>
        items.map((item, index) =>
          index.toString() === selectedItem?.id ? itemData : item
        )
      );
      saveToStorage(
        motionItems.map((item, index) =>
          index.toString() === selectedItem?.id ? itemData : item
        ), 
        behindLensVideo
      );
      toast({
        title: "Video Updated",
        description: "Motion video has been successfully updated.",
      });
    } else {
      // Add new item
      const newItems = [itemData, ...motionItems];
      setMotionItems(newItems);
      saveToStorage(newItems, behindLensVideo);
      toast({
        title: "Video Added",
        description: "New motion video has been added to your portfolio.",
      });
    }
    
    setIsEditing(false);
    setSelectedItem(null);
    setFormData({
      src: '',
      alt: '',
      caption: '',
      isVideo: true,
      featured: false,
      isYouTube: false,
      youTubeId: '',
      isBehindLens: false
    });
  };

  const handleDelete = (index: number) => {
    const newItems = motionItems.filter((_, i) => i !== index);
    setMotionItems(newItems);
    saveToStorage(newItems, behindLensVideo);
    toast({
      title: "Video Deleted",
      description: "Motion video has been removed.",
    });
  };

  const deleteBehindLensVideo = () => {
    setBehindLensVideo(null);
    saveToStorage(motionItems, null);
    toast({
      title: "Behind the Lens Removed",
      description: "Behind the Lens video has been removed.",
    });
  };

  const getThumbnail = (item: MotionItem) => {
    if (item.isYouTube && item.youTubeId) {
      return getYouTubeThumbnail(item.youTubeId, 'medium');
    }
    return item.src;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Motion & Video Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage videos, motion content, and YouTube integrations</p>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio Videos</TabsTrigger>
          <TabsTrigger value="behind-lens">Behind the Lens</TabsTrigger>
          <TabsTrigger value="add-new">Add New Video</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Videos ({motionItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {motionItems.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No videos yet</h3>
                  <p className="mt-2 text-gray-500">Start building your motion portfolio by adding your first video.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {motionItems.map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="aspect-video relative bg-black">
                        {item.isYouTube && item.youTubeId ? (
                          <img
                            src={getThumbnail(item)}
                            alt={item.alt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                          </div>
                        </div>

                        <div className="absolute top-2 left-2 flex gap-2">
                          {item.featured && (
                            <Badge variant="default">Featured</Badge>
                          )}
                          {item.isYouTube ? (
                            <Badge variant="destructive" className="bg-red-600">
                              <Youtube className="w-3 h-3 mr-1" />
                              YouTube
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="text-lg">{item.alt}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.caption}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item, index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behind-lens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behind the Lens Video</CardTitle>
              <CardDescription>
                This video will be displayed in the "Behind the Lens" section of the About page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {behindLensVideo ? (
                <div className="space-y-4">
                  <div className="aspect-video">
                    <VideoPlayer 
                      video={behindLensVideo}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{behindLensVideo.alt}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{behindLensVideo.caption}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(behindLensVideo, -1)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={deleteBehindLensVideo}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Behind the Lens video</h3>
                  <p className="mt-2 text-gray-500 mb-4">Add a video to showcase your creative process and philosophy.</p>
                  <Button 
                    onClick={() => {
                      setSelectedItem(null);
                      setFormData({
                        src: '',
                        alt: '',
                        caption: '',
                        isVideo: true,
                        featured: false,
                        isYouTube: false,
                        youTubeId: '',
                        isBehindLens: true
                      });
                      setIsEditing(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Behind the Lens Video
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Video</CardTitle>
              <CardDescription>
                Upload a video file or add a YouTube video to your motion portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setSelectedItem(null);
                    setFormData({
                      src: '',
                      alt: '',
                      caption: '',
                      isVideo: true,
                      featured: false,
                      isYouTube: false,
                      youTubeId: '',
                      isBehindLens: false
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedItem ? 'Edit Video' : 'Add New Video'}
                    </DialogTitle>
                    <DialogDescription>
                      Upload a video file or add a YouTube video to your motion portfolio.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Video Source Options */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Video Source</Label>
                      
                      {/* File Upload */}
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                        <div className="text-center">
                          <Video className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Video File'}
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="video/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            MP4, WebM, OGG, MOV, AVI up to 50MB
                          </p>
                          {isUploading && (
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-center text-gray-500">OR</div>

                      {/* YouTube URL */}
                      <div className="space-y-2">
                        <Label htmlFor="youtube-url" className="flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-500" />
                          YouTube URL
                        </Label>
                        <Input
                          id="youtube-url"
                          value={formData.src}
                          onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        />
                        {formData.isYouTube && formData.youTubeId && (
                          <div className="text-sm text-green-600 flex items-center gap-1">
                            ✓ Valid YouTube video detected: {formData.youTubeId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video Preview */}
                    {formData.src && (
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="max-w-sm mx-auto">
                          <VideoPlayer 
                            video={{
                              src: formData.src,
                              alt: formData.alt || 'Preview',
                              caption: formData.caption || 'Preview',
                              isVideo: true,
                              isYouTube: formData.isYouTube,
                              youTubeId: formData.youTubeId
                            }} 
                          />
                        </div>
                      </div>
                    )}

                    {/* Video Details */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="alt">Title / Alt Text *</Label>
                        <Input
                          id="alt"
                          value={formData.alt}
                          onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                          placeholder="Enter video title"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="caption">Caption *</Label>
                        <Textarea
                          id="caption"
                          value={formData.caption}
                          onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                          placeholder="Enter video caption/description"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={formData.featured}
                            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                          />
                          <Label htmlFor="featured">Feature this video</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="behind-lens"
                            checked={formData.isBehindLens}
                            onCheckedChange={(checked) => setFormData({ ...formData, isBehindLens: checked })}
                          />
                          <Label htmlFor="behind-lens">Behind the Lens</Label>
                        </div>
                      </div>

                      {formData.isBehindLens && behindLensVideo && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Note: Adding this video will replace the current "Behind the Lens" video.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={!formData.src || !formData.alt || !formData.caption}>
                        {selectedItem ? 'Update Video' : 'Add Video'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMotion;