import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Image as ImageIcon,
  Star,
  RefreshCw,
  Save,
  X,
  Upload
} from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail, isYouTubeUrl } from '@/lib/youtube-utils';
import { optimizeImageForUpload } from '@/lib/image-optimize';
import { apiUrl } from '@/lib/api-base';

interface PortfolioImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  is_featured: boolean;
  sort_order: number;
  tags: string;
  metadata: string;
  created_at: string;
  updated_at: string;
}

interface AdminPortfolioProps {
  initialCategory?: string;
  title?: string;
  description?: string;
}

const AdminPortfolio: React.FC<AdminPortfolioProps> = ({
  initialCategory = 'all',
  title = 'Portfolio Management',
  description = 'Manage your portfolio images and galleries',
}) => {
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PortfolioImage>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [viewImage, setViewImage] = useState<PortfolioImage | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioImages();
  }, []);

  useEffect(() => {
    let filtered = portfolioImages;
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(image => image.category === categoryFilter);
    }
    setFilteredImages(filtered);
  }, [portfolioImages, searchTerm, categoryFilter]);

  const fetchPortfolioImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl('/api/v1/portfolio'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio images');
      }

      const data = await response.json();
      if (data.success) {
        setPortfolioImages(data.data.images ?? []);
      } else {
        throw new Error(data.error || data.message || 'Failed to fetch portfolio images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPortfolioImage = async (imageData: Partial<PortfolioImage>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl('/api/v1/portfolio'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imageData)
      });

      if (!response.ok) {
        throw new Error('Failed to create portfolio image');
      }

      const data = await response.json();
      if (data.success) {
        fetchPortfolioImages(); // Refresh the list
        setIsDialogOpen(false);
        setEditForm({});
      } else {
        throw new Error(data.error || data.message || 'Failed to create portfolio image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio image');
    }
  };

  const updatePortfolioImage = async (imageId: number, imageData: Partial<PortfolioImage>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl(`/api/v1/portfolio/${imageId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imageData)
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio image');
      }

      const data = await response.json();
      if (data.success) {
        fetchPortfolioImages(); // Refresh the list
        setIsDialogOpen(false);
        setEditForm({});
        setIsEditing(false);
      } else {
        throw new Error(data.error || data.message || 'Failed to update portfolio image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio image');
    }
  };

  const deletePortfolioImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this portfolio image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl(`/api/v1/portfolio/${imageId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete portfolio image');
      }

      // Update local state
      setPortfolioImages(prev => prev.filter(image => image.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio image');
    }
  };

  const toggleFeatured = async (imageId: number, isFeatured: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl(`/api/v1/portfolio/${imageId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !isFeatured })
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio image');
      }

      // Update local state
      setPortfolioImages(prev => prev.map(image =>
        image.id === imageId ? { ...image, is_featured: !isFeatured } : image
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio image');
    }
  };

  const handleEdit = (image: PortfolioImage) => {
    setSelectedImage(image);
    setDialogError(null);
    setEditForm({
      title: image.title,
      description: image.description,
      image_url: image.image_url,
      category: image.category,
      tags: image.tags,
      is_featured: image.is_featured,
      sort_order: image.sort_order
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setDialogError(null);
    if (!editForm.title?.trim()) { setDialogError('Give the image a title'); return; }
    if (!editForm.image_url?.trim()) {
      setDialogError(editForm.category === 'motion' ? 'A YouTube or video URL is required' : 'Upload an image or paste an image URL');
      return;
    }
    if (isEditing && selectedImage) {
      updatePortfolioImage(selectedImage.id, editForm);
    } else {
      createPortfolioImage(editForm);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setDialogError(null);
      // Convert to WebP (2048px) + thumbnail (400px) in the browser —
      // the server only ever stores optimized WebP.
      const { full, thumb } = await optimizeImageForUpload(file);
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', full.blob, full.name);
      formData.append('thumbnail', thumb.blob, thumb.name);
      const res = await fetch(apiUrl('/api/v1/admin/media/upload'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const url = data.data?.url || data.url;
        setEditForm(prev => ({ ...prev, image_url: url }));
        // Refresh the media library so the new upload appears
        void fetchMediaLibrary();
      } else {
        const msg = 'Upload failed: ' + (data.error || data.message || 'Unknown error');
        setDialogError(msg); setError(msg);
      }
    } catch {
      const msg = 'Upload failed — check your connection and try again';
      setDialogError(msg); setError(msg);
    } finally {
      setUploading(false);
    }
  };

  /* ---- R2 media library ---- */
  const [mediaItems, setMediaItems] = useState<Array<{ key: string; url: string; thumbnail_url?: string; size: number; uploaded: string }>>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const fetchMediaLibrary = async () => {
    try {
      setMediaLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(apiUrl('/api/v1/admin/media?limit=60'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaItems(data.data?.items ?? []);
      }
    } catch {
      /* R2 may not be configured yet — non-fatal */
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => { void fetchMediaLibrary(); }, []);

  const handleDropFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) {
      setError('Please drop image files (JPG, PNG, WebP)');
      return;
    }
    for (const file of list.slice(0, 10)) {
      // eslint-disable-next-line no-await-in-loop
      await handleFileUpload(file);
    }
  };

  const deleteMediaItem = async (key: string) => {
    if (!confirm('Delete this uploaded image?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(apiUrl(`/api/v1/admin/media/${encodeURIComponent(key)}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setMediaItems((prev) => prev.filter((m) => m.key !== key));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const copyMediaUrl = (url: string) => {
    void navigator.clipboard?.writeText(url).catch(() => {});
  };

  const getPreviewUrl = (item: Pick<PortfolioImage, 'image_url' | 'thumbnail_url' | 'category'>) => {
    if (item.category === 'motion' && isYouTubeUrl(item.image_url)) {
      const youTubeId = extractYouTubeId(item.image_url);
      return youTubeId ? getYouTubeThumbnail(youTubeId, 'high') : item.image_url;
    }

    return item.thumbnail_url || item.image_url;
  };

  const categories = ['beauty', 'fashion', 'glamour', 'editorial', 'headshots', 'lifestyle', 'motion'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading portfolio images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchPortfolioImages} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditForm(initialCategory === 'all' ? {} : { category: initialCategory });
            setIsEditing(false);
            setSelectedImage(null);
            setDialogError(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Image
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-[#c8102e]/40 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#f2a3b1]">
          <span>{error}</span>
          <button onClick={() => { setError(null); void fetchPortfolioImages(); }} className="shrink-0 font-semibold text-[#c8102e] underline-offset-2 hover:underline">Retry</button>
        </div>
      )}

      {/* Media Library — direct R2 uploads */}
      <Card className="border-[#c8102e]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[15px]">
            <Upload className="h-4 w-4 text-[#c8102e]" />Media Library
          </CardTitle>
          <CardDescription>Drag & drop images to upload them to cloud storage, then use the URL in any portfolio item.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleDropFiles(e.dataTransfer.files); }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${dragOver ? 'border-[#c8102e] bg-[#c8102e]/10' : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'}`}
          >
            {uploading ? (
              <><RefreshCw className="h-8 w-8 animate-spin text-[#c8102e]" /><p className="mt-2 text-sm font-medium">Uploading...</p></>
            ) : (
              <><Upload className="h-8 w-8 text-neutral-500" />
              <p className="mt-2 text-sm font-medium">Drag & drop images here</p>
              <p className="text-xs text-muted-foreground">or</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => mediaInputRef.current?.click()}>
                <Plus className="mr-2 h-4 w-4" />Browse files
              </Button>
              <p className="mt-2 text-[11px] text-muted-foreground">JPG, PNG, WebP up to 15 MB</p></>
            )}
          </div>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) void handleDropFiles(files);
              e.target.value = '';
            }}
          />
          {mediaLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading media...</p>
          ) : mediaItems.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {mediaItems.map((m) => (
                <div key={m.key} className="group relative overflow-hidden rounded-lg border border-neutral-800">
                  <img src={m.thumbnail_url || m.url} alt={m.key} className="aspect-square w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-slate-950/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="secondary" size="sm" onClick={() => copyMediaUrl(m.url)}>Copy URL</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteMediaItem(m.key)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">No uploads yet — or cloud storage isn't connected. Uploads will appear here.</p>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search portfolio images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Images Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Images ({filteredImages.length})</CardTitle>
          <CardDescription>
            Manage your portfolio images and galleries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredImages.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">
              {portfolioImages.length === 0
                ? 'No portfolio images yet — click "New Image" to add your first one.'
                : 'No images match your search or category filter.'}
            </p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={getPreviewUrl(image)}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  {image.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm truncate">{image.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{image.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      {image.category}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewImage(image)}
                        aria-label={`View ${image.title}`}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(image)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(image.id, image.is_featured)}
                      >
                        <Star className={`h-3 w-3 ${image.is_featured ? 'text-yellow-500' : 'text-neutral-500'}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePortfolioImage(image.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Portfolio Image' : 'Add New Portfolio Image'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the portfolio image information' : 'Add a new portfolio image'}
            </DialogDescription>
          </DialogHeader>
          {dialogError && (
            <div className="rounded-lg border border-[#c8102e]/40 bg-[#c8102e]/10 px-4 py-2.5 text-sm text-[#f2a3b1]">{dialogError}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-400">Title</label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter image title"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-neutral-400">Description</label>
              <Input
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter image description"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-400">
                {editForm.category === 'motion' ? 'Video or YouTube URL' : 'Image'}
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={editForm.image_url || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder={editForm.category === 'motion' ? 'Enter YouTube or video URL' : 'Enter image URL or upload a file'}
                />
                <Button
                  variant="outline"
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
              />
              {editForm.image_url && (
                <img
                  src={getPreviewUrl({
                    image_url: editForm.image_url,
                    thumbnail_url: editForm.thumbnail_url || '',
                    category: editForm.category || '',
                  })}
                  alt="Preview"
                  className="mt-2 h-24 w-auto object-cover rounded-md"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-400">Category</label>
                <Select
                  value={editForm.category || 'beauty'}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-400">Sort Order</label>
                <Input
                  type="number"
                  value={editForm.sort_order || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter sort order"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-400">Tags</label>
              <Input
                value={editForm.tags || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Enter tags (comma separated)"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={editForm.is_featured || false}
                onChange={(e) => setEditForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-neutral-400">
                Featured Image
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditForm({});
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Read-only preview */}
      <Dialog open={!!viewImage} onOpenChange={(o) => { if (!o) setViewImage(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewImage?.title}</DialogTitle>
            <DialogDescription>
              {viewImage?.category}{viewImage?.is_featured ? ' · Featured' : ''}
            </DialogDescription>
          </DialogHeader>
          {viewImage && (
            <div className="space-y-4">
              <img
                src={getPreviewUrl(viewImage)}
                alt={viewImage.title}
                className="max-h-96 w-full rounded-lg bg-neutral-950 object-contain"
              />
              {viewImage.description && <p className="text-sm text-neutral-400">{viewImage.description}</p>}
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                <Badge variant="outline">{viewImage.category}</Badge>
                {viewImage.tags && <span>Tags: {viewImage.tags}</span>}
                <span>Sort order: {viewImage.sort_order}</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewImage(null)}>Close</Button>
                <Button onClick={() => { const img = viewImage; setViewImage(null); handleEdit(img); }}>
                  <Edit className="mr-2 h-4 w-4" />Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortfolio;
