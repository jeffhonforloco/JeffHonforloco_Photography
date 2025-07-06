import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  status: 'published' | 'draft';
  createdAt: string;
  views: number;
}

const AdminPortfolio = () => {
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'Fashion Week 2024',
      category: 'Fashion',
      description: 'Exclusive behind-the-scenes photography from New York Fashion Week',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
      status: 'published',
      createdAt: '2024-01-15',
      views: 1247
    },
    {
      id: '2',
      title: 'Beauty Campaign',
      category: 'Beauty',
      description: 'Professional beauty photography for luxury skincare brand',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      status: 'published',
      createdAt: '2024-01-10',
      views: 892
    },
    {
      id: '3',
      title: 'Editorial Portraits',
      category: 'Editorial',
      description: 'Magazine editorial featuring emerging artists',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c6e7ad4b?w=400',
      status: 'draft',
      createdAt: '2024-01-05',
      views: 0
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    status: 'draft' as 'published' | 'draft'
  });

  const categories = ['Fashion', 'Beauty', 'Editorial', 'Portrait', 'Lifestyle'];

  const handleEdit = (item: PortfolioItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      image: item.image,
      status: item.status
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedItem) {
      // Update existing item
      setPortfolioItems(items =>
        items.map(item =>
          item.id === selectedItem.id
            ? { ...item, ...formData }
            : item
        )
      );
      toast({
        title: "Portfolio Updated",
        description: "Portfolio item has been successfully updated.",
      });
    } else {
      // Add new item
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        views: 0
      };
      setPortfolioItems(items => [newItem, ...items]);
      toast({
        title: "Portfolio Added",
        description: "New portfolio item has been created.",
      });
    }
    
    setIsEditing(false);
    setSelectedItem(null);
    setFormData({ title: '', category: '', description: '', image: '', status: 'draft' });
  };

  const handleDelete = (id: string) => {
    setPortfolioItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Portfolio Deleted",
      description: "Portfolio item has been removed.",
    });
  };

  const handleStatusToggle = (id: string) => {
    setPortfolioItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'published' ? 'draft' : 'published' }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your photography portfolio</p>
        </div>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedItem(null);
              setFormData({ title: '', category: '', description: '', image: '', status: 'draft' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Portfolio Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
              </DialogTitle>
              <DialogDescription>
                {selectedItem ? 'Update the portfolio item details below.' : 'Create a new portfolio item for your gallery.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter portfolio title"
                />
              </div>
              
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter image URL"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
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
                  {selectedItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  {item.views}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusToggle(item.id)}
                  >
                    {item.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPortfolio;