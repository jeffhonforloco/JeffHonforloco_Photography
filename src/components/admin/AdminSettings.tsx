import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Save, Upload, Globe, Mail, Shield, Palette, Database } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Jeff Honforloco Photography',
    siteDescription: 'Professional portrait, fashion, and editorial photography',
    siteUrl: 'https://jeffhonforloco.com',
    contactEmail: 'info@jeffhonforloco.com',
    maintenanceMode: false,
    allowRegistration: false
  });

  const [seoSettings, setSeoSettings] = useState({
    googleAnalyticsId: 'GA-XXXXXXXXX',
    googleSearchConsole: false,
    metaKeywords: 'photography, fashion, beauty, portrait, editorial',
    socialMediaTitle: 'Jeff Honforloco Photography',
    socialMediaDescription: 'Professional photography services specializing in fashion and beauty'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    emailNotifications: true,
    autoResponseEnabled: true,
    autoResponseMessage: 'Thank you for your inquiry. We will get back to you within 24 hours.'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '24',
    passwordRequirements: true,
    ipWhitelist: '',
    maxLoginAttempts: '5'
  });

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#dc2626',
    secondaryColor: '#1f2937',
    fontFamily: 'Inter',
    darkMode: true,
    customCSS: ''
  });

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your website and admin panel settings</p>
      </div>

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Site
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* Site Settings */}
        <TabsContent value="site" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Site Settings</CardTitle>
              <CardDescription>Configure basic site information and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={siteSettings.siteUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteUrl: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable public access to the site</p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={siteSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, maintenanceMode: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registration">Allow User Registration</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable new users to create accounts</p>
                  </div>
                  <Switch
                    id="registration"
                    checked={siteSettings.allowRegistration}
                    onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, allowRegistration: checked })}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSave('Site')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Site Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Analytics</CardTitle>
              <CardDescription>Search engine optimization and tracking settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="analyticsId">Google Analytics ID</Label>
                <Input
                  id="analyticsId"
                  value={seoSettings.googleAnalyticsId}
                  onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                  placeholder="GA-XXXXXXXXX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={seoSettings.metaKeywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="socialTitle">Social Media Title</Label>
                <Input
                  id="socialTitle"
                  value={seoSettings.socialMediaTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, socialMediaTitle: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="socialDescription">Social Media Description</Label>
                <Textarea
                  id="socialDescription"
                  value={seoSettings.socialMediaDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, socialMediaDescription: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="searchConsole">Google Search Console</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enable search console integration</p>
                </div>
                <Switch
                  id="searchConsole"
                  checked={seoSettings.googleSearchConsole}
                  onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, googleSearchConsole: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smtpEnabled">Enable SMTP</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use custom SMTP server for sending emails</p>
                </div>
                <Switch
                  id="smtpEnabled"
                  checked={emailSettings.smtpEnabled}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, smtpEnabled: checked })}
                />
              </div>
              
              {emailSettings.smtpEnabled && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">Username</Label>
                      <Input
                        id="smtpUsername"
                        value={emailSettings.smtpUsername}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications for new messages</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailSettings.emailNotifications}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, emailNotifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoResponse">Auto Response</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send automatic replies to contact form submissions</p>
                  </div>
                  <Switch
                    id="autoResponse"
                    checked={emailSettings.autoResponseEnabled}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, autoResponseEnabled: checked })}
                  />
                </div>
                
                {emailSettings.autoResponseEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="autoResponseMessage">Auto Response Message</Label>
                    <Textarea
                      id="autoResponseMessage"
                      value={emailSettings.autoResponseMessage}
                      onChange={(e) => setEmailSettings({ ...emailSettings, autoResponseMessage: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>
              
              <Button onClick={() => handleSave('Email')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Manage security settings and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="passwordReq">Strong Password Requirements</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enforce complex passwords for user accounts</p>
                </div>
                <Switch
                  id="passwordReq"
                  checked={securitySettings.passwordRequirements}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, passwordRequirements: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <Textarea
                  id="ipWhitelist"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })}
                  placeholder="Enter IP addresses separated by commas"
                  rows={3}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">Leave empty to allow all IPs</p>
              </div>
              
              <Button onClick={() => handleSave('Security')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>Customize the appearance of your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                    />
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      value={themeSettings.secondaryColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                    />
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: themeSettings.secondaryColor }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input
                  id="fontFamily"
                  value={themeSettings.fontFamily}
                  onChange={(e) => setThemeSettings({ ...themeSettings, fontFamily: e.target.value })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Dark Mode Default</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enable dark mode by default for new visitors</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={themeSettings.darkMode}
                  onCheckedChange={(checked) => setThemeSettings({ ...themeSettings, darkMode: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customCSS">Custom CSS</Label>
                <Textarea
                  id="customCSS"
                  value={themeSettings.customCSS}
                  onChange={(e) => setThemeSettings({ ...themeSettings, customCSS: e.target.value })}
                  placeholder="/* Add your custom CSS here */"
                  rows={6}
                />
              </div>
              
              <Button onClick={() => handleSave('Theme')} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Theme Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Backup and restore your website data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <Upload className="h-6 w-6 mb-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  Import Data
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Backups</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Full Backup - January 20, 2024</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Size: 125 MB</p>
                    </div>
                    <Badge>Completed</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Database Backup - January 18, 2024</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Size: 45 MB</p>
                    </div>
                    <Badge>Completed</Badge>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => handleSave('Backup')} className="w-full" variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Create New Backup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;