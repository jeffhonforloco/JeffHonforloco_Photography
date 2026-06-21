import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/portfolio', {
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
        throw new Error(data.message || 'Failed to fetch portfolio images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = portfolioImages;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(image => image.category === categoryFilter);
    }

    setFilteredImages(filtered);
  };

  const createPortfolioImage = async (imageData: Partial<PortfolioImage>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/portfolio', {
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
        throw new Error(data.message || 'Failed to create portfolio image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio image');
    }
  };

  const updatePortfolioImage = async (imageId: number, imageData: Partial<PortfolioImage>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/v1/portfolio/${imageId}`, {
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
        throw new Error(data.message || 'Failed to update portfolio image');
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
      const response = await fetch(`/api/v1/portfolio/${imageId}`, {
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
      const response = await fetch(`/api/v1/portfolio/${imageId}`, {
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
    if (isEditing && selectedImage) {
      updatePortfolioImage(selectedImage.id, editForm);
    } else {
      createPortfolioImage(editForm);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
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
        setEditForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        setError('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
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
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Image
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                  <p className="text-xs text-gray-500 mt-1">{image.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      {image.category}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedImage(image);
                          setIsDialogOpen(true);
                        }}
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
                        <Star className={`h-3 w-3 ${image.is_featured ? 'text-yellow-500' : 'text-gray-400'}`} />
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
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter image title"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <Input
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter image description"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
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
                <label className="text-sm font-medium text-gray-500">Category</label>
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
                <label className="text-sm font-medium text-gray-500">Sort Order</label>
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
              <label className="text-sm font-medium text-gray-500">Tags</label>
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
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-500">
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
    </div>
  );
};

export default AdminPortfolio;
