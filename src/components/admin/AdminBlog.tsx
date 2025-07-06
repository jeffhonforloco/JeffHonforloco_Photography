import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  views: number;
  readTime: string;
}

const AdminBlog = () => {
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Photography Tips for Beginners',
      excerpt: 'Essential tips and techniques for aspiring photographers starting their journey.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
      category: 'Tutorial',
      status: 'published',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      views: 1543,
      readTime: '5 min read'
    },
    {
      id: '2',
      title: 'Behind the Scenes: Fashion Week',
      excerpt: 'An exclusive look at what happens behind the camera during fashion week.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
      category: 'Behind the Scenes',
      status: 'published',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-19',
      views: 892,
      readTime: '8 min read'
    },
    {
      id: '3',
      title: 'Lighting Techniques for Portrait Photography',
      excerpt: 'Master the art of lighting to create stunning portrait photographs.',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
      category: 'Tutorial',
      status: 'draft',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16',
      views: 0,
      readTime: '12 min read'
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    status: 'draft' as 'published' | 'draft',
    readTime: ''
  });

  const categories = ['Tutorial', 'Behind the Scenes', 'Equipment Review', 'Industry News', 'Personal Story'];

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      status: post.status,
      readTime: post.readTime
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedPost) {
      // Update existing post
      setBlogPosts(posts =>
        posts.map(post =>
          post.id === selectedPost.id
            ? { ...post, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
            : post
        )
      );
      toast({
        title: "Blog Post Updated",
        description: "Blog post has been successfully updated.",
      });
    } else {
      // Add new post
      const newPost: BlogPost = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        views: 0
      };
      setBlogPosts(posts => [newPost, ...posts]);
      toast({
        title: "Blog Post Created",
        description: "New blog post has been created.",
      });
    }
    
    setIsEditing(false);
    setSelectedPost(null);
    setFormData({ title: '', excerpt: '', content: '', category: '', status: 'draft', readTime: '' });
  };

  const handleDelete = (id: string) => {
    setBlogPosts(posts => posts.filter(post => post.id !== id));
    toast({
      title: "Blog Post Deleted",
      description: "Blog post has been removed.",
    });
  };

  const handleStatusToggle = (id: string) => {
    setBlogPosts(posts =>
      posts.map(post =>
        post.id === id
          ? { 
              ...post, 
              status: post.status === 'published' ? 'draft' : 'published',
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : post
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your blog posts</p>
        </div>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedPost(null);
              setFormData({ title: '', excerpt: '', content: '', category: '', status: 'draft', readTime: '' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
              <DialogDescription>
                {selectedPost ? 'Update the blog post details below.' : 'Create a new blog post for your readers.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter blog post title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time</Label>
                  <Input
                    id="readTime"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g., 5 min read"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the blog post"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog post content here..."
                  rows={10}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'published' | 'draft') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {selectedPost ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-4">
        {blogPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-base mb-2">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views} views
                    </span>
                    <span>{post.readTime}</span>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusToggle(post.id)}
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;