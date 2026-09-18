import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  FileText,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import apiUrl from '../../lib/api-base';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category?: string;
  featured_image_url?: string;
  gallery_images?: string;
  author_id: number;
  status: string;
  published_at?: string;
  tags: string;
  metadata: string;
  created_at: string;
  updated_at: string;
}

const AdminBlog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<BlogPost>>({});
  const [galleryInput, setGalleryInput] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSlide, setPreviewSlide] = useState(0);

  // Gallery slider images: stored as a JSON array string in editForm.gallery_images.
  const galleryList: string[] = (() => {
    const raw = editForm.gallery_images;
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string' && x.length > 0) : [];
    } catch {
      return [];
    }
  })();

  const addGalleryImage = () => {
    const url = galleryInput.trim();
    if (!url) return;
    if (galleryList.includes(url)) {
      setGalleryInput('');
      return;
    }
    setEditForm(prev => ({ ...prev, gallery_images: JSON.stringify([...galleryList, url]) }));
    setGalleryInput('');
  };

  const removeGalleryImage = (url: string) => {
    setEditForm(prev => ({ ...prev, gallery_images: JSON.stringify(galleryList.filter(u => u !== url)) }));
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    let filtered = blogPosts;
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }
    setFilteredPosts(filtered);
  }, [blogPosts, searchTerm, statusFilter]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl('/api/v1/blog?status=all'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      if (data.success) {
        setBlogPosts(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch blog posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = blogPosts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
  };

  const createBlogPost = async (postData: Partial<BlogPost>) => {
    try {
      const token = localStorage.getItem('adminToken');
      setError(null);
      // The API requires a slug; generate a unique one from the title.
      const slugify = (s: string) =>
        s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'post';
      const base = slugify(postData.title || '');
      const taken = new Set(blogPosts.map(p => p.slug));
      let slug = base, i = 2;
      while (taken.has(slug)) slug = `${base}-${i++}`;
      const response = await fetch(apiUrl('/api/v1/blog'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...postData, slug })
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      const data = await response.json();
      if (data.success) {
        fetchBlogPosts(); // Refresh the list
        setIsDialogOpen(false);
        setEditForm({});
      } else {
        throw new Error(data.message || 'Failed to create blog post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post');
    }
  };

  const updateBlogPost = async (postId: number, postData: Partial<BlogPost>) => {
    try {
      const token = localStorage.getItem('adminToken');
      setError(null);
      const response = await fetch(apiUrl(`/api/v1/blog/${postId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }

      const data = await response.json();
      if (data.success) {
        fetchBlogPosts(); // Refresh the list
        setIsDialogOpen(false);
        setEditForm({});
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to update blog post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog post');
    }
  };

  const deleteBlogPost = async (postId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl(`/api/v1/blog/${postId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      // Update local state
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
      setDeletePostId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      featured_image_url: post.featured_image_url,
      gallery_images: post.gallery_images,
      tags: post.tags
    });
    setGalleryInput('');
    setIsEditing(true);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (isEditing && selectedPost) {
      updateBlogPost(selectedPost.id, editForm);
    } else {
      createBlogPost(editForm);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toString().trim().toLowerCase();
    const statusConfig = {
      draft: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      published: { variant: 'default' as const, color: 'bg-green-100 text-green-800', label: 'Published' },
      archived: { variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800', label: 'Archived' }
    };

    const config = statusConfig[normalized as keyof typeof statusConfig];

    // Never guess: a post without a known status shows "Not set", not "Draft".
    if (!config) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-500">
          Not set
        </Badge>
      );
    }

    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading blog posts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage your blog posts and content</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchBlogPosts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditForm({});
            setGalleryInput('');
            setIsEditing(false);
            setError(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
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
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
          <CardDescription>
            Manage your blog posts and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(post.status)}
                    </TableCell>
                    <TableCell>
                      Admin
                    </TableCell>
                    <TableCell>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                    </TableCell>
                    <TableCell>
                      {new Date(post.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletePostId(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Blog Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the blog post information' : 'Create a new blog post'}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter blog post title"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Excerpt</label>
              <Textarea
                value={editForm.excerpt || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Enter blog post excerpt"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Content</label>
              <Textarea
                value={editForm.content || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter blog post content"
                className="mt-1"
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Select
                  value={editForm.status || 'draft'}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Featured Image URL</label>
                <Input
                  value={editForm.featured_image_url || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="Enter image URL"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Gallery Slider Images <span className="text-gray-400 font-normal">({galleryList.length})</span>
              </label>
              <p className="text-xs text-gray-400 mt-1 mb-2">
                Different images shown in the article's sliding gallery. Only add images that represent what the article is about.
              </p>
              {galleryList.length > 0 && (
                <div className="space-y-2 mb-2">
                  {galleryList.map((url) => (
                    <div key={url} className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                      <img src={url} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                      <span className="flex-1 truncate text-xs text-gray-600">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGalleryImage(url)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGalleryImage(); } }}
                  placeholder="Paste image URL, then Add"
                  className="mt-1"
                />
                <Button type="button" variant="outline" onClick={addGalleryImage} className="mt-1 shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setPreviewSlide(0); setIsPreviewOpen(true); }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditForm({});
                  setIsEditing(false);
                  setError(null);
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

      {/* Article preview — renders the draft exactly as it will look on the public journal page */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black text-white border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">Article Preview</DialogTitle>
            <DialogDescription className="text-neutral-400">
              How this article will look on the public journal page. Draft — not published.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg">
            {galleryList.length > 0 ? (
              <div className="relative bg-neutral-900 rounded-lg overflow-hidden mb-8">
                <div className="aspect-[4/3] w-full">
                  <img
                    src={galleryList[Math.min(previewSlide, galleryList.length - 1)]}
                    alt={`Preview slide ${Math.min(previewSlide, galleryList.length - 1) + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {galleryList.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={() => setPreviewSlide((previewSlide - 1 + galleryList.length) % galleryList.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/55 border border-white/25 text-white text-lg hover:bg-[#C8102E] hover:border-[#C8102E] transition-colors"
                    >
                      &#10094;
                    </button>
                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={() => setPreviewSlide((previewSlide + 1) % galleryList.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/55 border border-white/25 text-white text-lg hover:bg-[#C8102E] hover:border-[#C8102E] transition-colors"
                    >
                      &#10095;
                    </button>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                      {galleryList.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Photo ${i + 1}`}
                          onClick={() => setPreviewSlide(i)}
                          className={`h-2.5 w-2.5 rounded-full p-0 ${i === previewSlide ? 'bg-[#C8102E]' : 'bg-white/35 hover:bg-white/60'}`}
                        />
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 text-xs tracking-widest px-3 py-1.5 rounded-full">
                      {previewSlide + 1} / {galleryList.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-neutral-700 rounded-lg text-center text-neutral-500 py-10 mb-8 text-sm">
                No slider images — this article will show without a photo gallery.
              </div>
            )}
            <div className="text-[#C8102E] text-xs tracking-[0.18em] uppercase mb-4">
              {editForm.category || 'Uncategorized'}
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-light mb-4 leading-tight">
              {editForm.title || 'Untitled article'}
            </h1>
            {editForm.excerpt && (
              <p className="text-neutral-400 text-lg font-light mb-8">{editForm.excerpt}</p>
            )}
            <div
              className="article-body text-neutral-300 leading-relaxed text-lg space-y-6"
              dangerouslySetInnerHTML={{ __html: editForm.content || '<p class="text-neutral-500">No content yet.</p>' }}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close preview</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete post confirmation (in-page; native confirm() never fires reliably) */}
      <Dialog open={deletePostId !== null} onOpenChange={(open) => { if (!open) setDeletePostId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete blog post?</DialogTitle>
            <DialogDescription>This post will be permanently removed. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeletePostId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deletePostId !== null) void deleteBlogPost(deletePostId); }}>
              Delete Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;