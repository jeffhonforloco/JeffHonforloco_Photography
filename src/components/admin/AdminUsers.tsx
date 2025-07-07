import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Plus, Edit, Trash2, Mail, Calendar, Shield, User } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'subscriber';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  createdAt: string;
  lastActive: string;
  permissions: string[];
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: '1',
      name: 'Jeff Honforloco',
      email: 'jeff@jeffhonforlocophotos.com',
      role: 'admin',
      status: 'active',
      avatar: '/lovable-uploads/be7f5d35-71c0-4752-8fbe-46cd1a9e1fdd.png',
      createdAt: '2024-01-01',
      lastActive: '2024-01-20',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Sarah Editor',
      email: 'sarah@jeffhonforlocophotos.com',
      role: 'editor',
      status: 'active',
      createdAt: '2024-01-10',
      lastActive: '2024-01-19',
      permissions: ['portfolio', 'blog', 'contacts']
    },
    {
      id: '3',
      name: 'Mike Assistant',
      email: 'mike@jeffhonforlocophotos.com',
      role: 'editor',
      status: 'inactive',
      createdAt: '2024-01-15',
      lastActive: '2024-01-17',
      permissions: ['blog', 'contacts']
    },
    {
      id: '4',
      name: 'Emma Subscriber',
      email: 'emma@email.com',
      role: 'subscriber',
      status: 'active',
      createdAt: '2024-01-18',
      lastActive: '2024-01-20',
      permissions: []
    }
  ]);

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'subscriber' as UserAccount['role'],
    status: 'active' as UserAccount['status'],
    permissions: [] as string[]
  });

  const roles = ['admin', 'editor', 'subscriber'];
  const availablePermissions = ['portfolio', 'blog', 'contacts', 'users', 'settings'];

  const handleEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: user.permissions.filter(p => p !== 'all')
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const finalPermissions = formData.role === 'admin' ? ['all'] : formData.permissions;
    
    if (selectedUser) {
      // Update existing user
      setUsers(users =>
        users.map(user =>
          user.id === selectedUser.id
            ? { ...user, ...formData, permissions: finalPermissions }
            : user
        )
      );
      toast({
        title: "User Updated",
        description: "User account has been successfully updated.",
      });
    } else {
      // Add new user
      const newUser: UserAccount = {
        id: Date.now().toString(),
        ...formData,
        permissions: finalPermissions,
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0]
      };
      setUsers(users => [newUser, ...users]);
      toast({
        title: "User Created",
        description: "New user account has been created.",
      });
    }
    
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({ name: '', email: '', role: 'subscriber', status: 'active', permissions: [] });
  };

  const handleDelete = (id: string) => {
    setUsers(users => users.filter(user => user.id !== id));
    toast({
      title: "User Deleted",
      description: "User account has been removed.",
    });
  };

  const handleStatusToggle = (id: string) => {
    setUsers(users =>
      users.map(user =>
        user.id === id
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'subscriber': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
        </div>
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedUser(null);
              setFormData({ name: '', email: '', role: 'subscriber', status: 'active', permissions: [] });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {selectedUser ? 'Update user account details and permissions.' : 'Create a new user account with appropriate permissions.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: UserAccount['role']) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: UserAccount['status']) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formData.role !== 'admin' && (
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, permissions: [...formData.permissions, permission] });
                            } else {
                              setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {selectedUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className={getRoleColor(user.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last active: {new Date(user.lastActive).toLocaleDateString()}
                </div>
              </div>
              
              {user.permissions.length > 0 && user.permissions[0] !== 'all' && (
                <div>
                  <p className="text-sm font-medium mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map(permission => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusToggle(user.id)}
                  disabled={user.role === 'admin'}
                >
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(user.id)}
                    disabled={user.role === 'admin'}
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

export default AdminUsers;