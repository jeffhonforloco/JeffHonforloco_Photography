import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  visible: boolean;
  order: number;
  children?: MenuItem[];
}

const AdminNavigation = () => {
  const { toast } = useToast();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      label: 'Portfolio',
      url: '/portfolio',
      target: '_self',
      visible: true,
      order: 1,
      children: [
        { id: '1-1', label: 'Fashion', url: '/portfolio/fashion', target: '_self', visible: true, order: 1 },
        { id: '1-2', label: 'Beauty', url: '/portfolio/beauty', target: '_self', visible: true, order: 2 },
        { id: '1-3', label: 'Editorial', url: '/portfolio/editorial', target: '_self', visible: true, order: 3 },
        { id: '1-4', label: 'Motion', url: '/portfolio/motion', target: '_self', visible: true, order: 4 }
      ]
    },
    {
      id: '2',
      label: 'Journal',
      url: '/journal',
      target: '_self',
      visible: true,
      order: 2
    },
    {
      id: '3',
      label: 'About',
      url: '/about',
      target: '_self',
      visible: true,
      order: 3
    },
    {
      id: '4',
      label: 'Contact',
      url: '/contact',
      target: '_self',
      visible: true,
      order: 4
    }
  ]);

  const [socialLinks, setSocialLinks] = useState([
    { id: '1', platform: 'Instagram', url: 'https://instagram.com/jeffhonforloco', visible: true },
    { id: '2', platform: 'YouTube', url: 'https://youtube.com/@jeffhonforloco', visible: true },
    { id: '3', platform: 'LinkedIn', url: '', visible: false },
    { id: '4', platform: 'Facebook', url: '', visible: false }
  ]);

  const [footerSettings, setFooterSettings] = useState({
    showFooter: true,
    copyrightText: '© 2024 Jeff Honforloco Photography. All rights reserved.',
    showSocialLinks: true,
    showContactInfo: true,
    contactEmail: 'info@jeffhonforlocophotos.com',
    contactPhone: '+646-379-4237',
    businessAddress: 'Wisdom Ave, Providence, RI 02908'
  });

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    target: '_self' as '_self' | '_blank',
    visible: true
  });

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      label: item.label,
      url: item.url,
      target: item.target,
      visible: item.visible
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedItem) {
      setMenuItems(items =>
        items.map(item =>
          item.id === selectedItem.id
            ? { ...item, ...formData }
            : item
        )
      );
      toast({
        title: "Menu Item Updated",
        description: "Navigation menu has been updated successfully.",
      });
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...formData,
        order: menuItems.length + 1
      };
      setMenuItems([...menuItems, newItem]);
      toast({
        title: "Menu Item Added",
        description: "New menu item has been created.",
      });
    }
    
    setIsEditing(false);
    setSelectedItem(null);
    setFormData({ label: '', url: '', target: '_self', visible: true });
  };

  const handleDelete = (id: string) => {
    setMenuItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Menu Item Deleted",
      description: "Menu item has been removed.",
    });
  };

  const toggleVisibility = (id: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, visible: !item.visible }
          : item
      )
    );
  };

  const handleSaveFooter = () => {
    toast({
      title: "Footer Settings Saved",
      description: "Footer configuration has been updated successfully.",
    });
  };

  const handleSaveSocial = () => {
    toast({
      title: "Social Links Updated",
      description: "Social media links have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Navigation Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure site navigation, menus, and links</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Navigation */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Main Navigation Menu</CardTitle>
                <CardDescription>Manage primary navigation links</CardDescription>
              </div>
              
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setSelectedItem(null);
                    setFormData({ label: '', url: '', target: '_self', visible: true });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure the menu item details below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="Menu item label"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="/page-url or https://external-link.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="target">Link Target</Label>
                      <Select value={formData.target} onValueChange={(value: '_self' | '_blank') => setFormData({ ...formData, target: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_self">Same window</SelectItem>
                          <SelectItem value="_blank">New window</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visible">Visible</Label>
                      <Switch
                        id="visible"
                        checked={formData.visible}
                        onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                      />
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
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {!item.visible && <EyeOff className="h-4 w-4 text-gray-400" />}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.url}</span>
                      {item.children && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.children.length} sub-items
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(item.id)}
                    >
                      {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Configure social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-3">
                <div className="w-20">
                  <Label>{link.platform}</Label>
                </div>
                <Input
                  value={link.url}
                  onChange={(e) => setSocialLinks(links =>
                    links.map(l => l.id === link.id ? { ...l, url: e.target.value } : l)
                  )}
                  placeholder={`${link.platform} URL`}
                  className="flex-1"
                />
                <Switch
                  checked={link.visible}
                  onCheckedChange={(checked) => setSocialLinks(links =>
                    links.map(l => l.id === link.id ? { ...l, visible: checked } : l)
                  )}
                />
              </div>
            ))}
            
            <Button onClick={handleSaveSocial} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Social Links
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Configuration</CardTitle>
          <CardDescription>Configure footer content and appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showFooter">Show Footer</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Display footer on website pages</p>
            </div>
            <Switch
              id="showFooter"
              checked={footerSettings.showFooter}
              onCheckedChange={(checked) => setFooterSettings({ ...footerSettings, showFooter: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input
              id="copyrightText"
              value={footerSettings.copyrightText}
              onChange={(e) => setFooterSettings({ ...footerSettings, copyrightText: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showSocialLinks">Show Social Links</Label>
              <Switch
                id="showSocialLinks"
                checked={footerSettings.showSocialLinks}
                onCheckedChange={(checked) => setFooterSettings({ ...footerSettings, showSocialLinks: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showContactInfo">Show Contact Info</Label>
              <Switch
                id="showContactInfo"
                checked={footerSettings.showContactInfo}
                onCheckedChange={(checked) => setFooterSettings({ ...footerSettings, showContactInfo: checked })}
              />
            </div>
          </div>

          {footerSettings.showContactInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  value={footerSettings.contactEmail}
                  onChange={(e) => setFooterSettings({ ...footerSettings, contactEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={footerSettings.contactPhone}
                  onChange={(e) => setFooterSettings({ ...footerSettings, contactPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input
                  id="businessAddress"
                  value={footerSettings.businessAddress}
                  onChange={(e) => setFooterSettings({ ...footerSettings, businessAddress: e.target.value })}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSaveFooter} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Footer Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNavigation;