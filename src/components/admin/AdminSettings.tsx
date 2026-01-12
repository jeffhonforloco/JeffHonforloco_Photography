import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Globe,
  Mail,
  Database,
  Shield,
  Bell,
  Palette,
  Server
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  theme: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  analyticsEnabled: boolean;
  backupEnabled: boolean;
  securityLevel: string;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Jeff Honforloco Photography',
    siteDescription: 'Professional photography services',
    siteUrl: 'https://jeffhonforlocophotos.com',
    adminEmail: 'admin@jeffhonforlocophotos.com',
    timezone: 'America/New_York',
    language: 'en',
    theme: 'light',
    maintenanceMode: false,
    registrationEnabled: false,
    emailNotifications: true,
    analyticsEnabled: true,
    backupEnabled: true,
    securityLevel: 'high'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings({ ...settings, ...data.data });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your photography platform</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>General Settings</span>
          </CardTitle>
          <CardDescription>
            Basic site configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Enter site name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Site URL</label>
              <Input
                value={settings.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                placeholder="Enter site URL"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Site Description</label>
            <Textarea
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              placeholder="Enter site description"
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Admin Email</label>
              <Input
                value={settings.adminEmail}
                onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                placeholder="Enter admin email"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timezone</label>
              <Select value={settings.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize the look and feel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Theme</label>
              <Select value={settings.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Language</label>
              <Select value={settings.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Settings</span>
          </CardTitle>
          <CardDescription>
            Configure email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Send email notifications for important events</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription>
            Configure security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Temporarily disable public access</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Registration Enabled</p>
              <p className="text-sm text-gray-500">Allow new user registrations</p>
            </div>
            <Switch
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Security Level</label>
            <Select value={settings.securityLevel} onValueChange={(value) => handleInputChange('securityLevel', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="maximum">Maximum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Settings</span>
          </CardTitle>
          <CardDescription>
            Configure system features and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Analytics Enabled</p>
              <p className="text-sm text-gray-500">Track website analytics and user behavior</p>
            </div>
            <Switch
              checked={settings.analyticsEnabled}
              onCheckedChange={(checked) => handleInputChange('analyticsEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Backup Enabled</p>
              <p className="text-sm text-gray-500">Automatically backup database and files</p>
            </div>
            <Switch
              checked={settings.backupEnabled}
              onCheckedChange={(checked) => handleInputChange('backupEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current system configuration and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintenance Mode</span>
              <Badge variant={settings.maintenanceMode ? 'destructive' : 'default'}>
                {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Notifications</span>
              <Badge variant={settings.emailNotifications ? 'default' : 'secondary'}>
                {settings.emailNotifications ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Analytics</span>
              <Badge variant={settings.analyticsEnabled ? 'default' : 'secondary'}>
                {settings.analyticsEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backup</span>
              <Badge variant={settings.backupEnabled ? 'default' : 'secondary'}>
                {settings.backupEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Security Level</span>
              <Badge variant="outline" className="capitalize">
                {settings.securityLevel}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <Badge variant="outline" className="capitalize">
                {settings.theme}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;