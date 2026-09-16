import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiUrl } from '@/lib/api-base';
import {
  Save,
  RefreshCw,
  Globe,
  Shield,
  Palette,
  Server,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */

interface StudioLocation {
  city: string;
  state: string;
  stateCode: string;
  country: string;
  region: string;
  serviceAreas: string[];
  phone: string;
  email: string;
}

const DEFAULT_LOCATION: StudioLocation = {
  city: 'Providence',
  state: 'Rhode Island',
  stateCode: 'RI',
  country: 'USA',
  region: 'New England',
  serviceAreas: ['Providence', 'Boston', 'Rhode Island', 'New York City', 'Miami'],
  phone: '+1-646-379-4237',
  email: 'info@jeffhonforlocophotos.com',
};

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

const DEFAULT_SITE: SiteSettings = {
  siteName: 'Jeff Honforloco Photography',
  siteDescription: 'Professional photography services',
  siteUrl: 'https://jeffhonforlocophotos.com',
  adminEmail: 'info@jeffhonforlocophotos.com',
  timezone: 'America/New_York',
  language: 'en',
  theme: 'light',
  maintenanceMode: false,
  registrationEnabled: false,
  emailNotifications: true,
  analyticsEnabled: true,
  backupEnabled: true,
  securityLevel: 'high',
};

/* ------------------------------------------------------------------ */

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <Label className="text-[13px] font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const AdminSettings: React.FC = () => {
  const [location, setLocation] = useState<StudioLocation>(DEFAULT_LOCATION);
  const [serviceAreasText, setServiceAreasText] = useState(DEFAULT_LOCATION.serviceAreas.join(', '));
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE);
  const [loading, setLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<'supabase' | 'default'>('default');

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Studio location (Supabase-backed)
      try {
        const locRes = await fetch(apiUrl('/api/v1/settings/public'));
        if (locRes.ok) {
          const d = await locRes.json();
          if (d.success && d.data?.location) {
            const loc = { ...DEFAULT_LOCATION, ...d.data.location };
            setLocation(loc);
            setServiceAreasText((loc.serviceAreas || []).join(', '));
            setLocationSource(d.data.source === 'supabase' ? 'supabase' : 'default');
          }
        }
      } catch {
        /* fall back to defaults */
      }

      // Legacy site settings (best effort)
      try {
        const res = await fetch(apiUrl('/api/v1/admin/settings'), { headers: authHeaders() });
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.data) setSettings({ ...DEFAULT_SITE, ...d.data });
        }
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const saveLocation = async () => {
    try {
      setSavingLocation(true);
      setError(null);
      const areas = serviceAreasText.split(',').map((s) => s.trim()).filter(Boolean);
      const payload: StudioLocation = { ...location, serviceAreas: areas };
      const res = await fetch(apiUrl('/api/v1/settings'), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ studio_location: payload }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to save location');
      setLocation(payload);
      setLocationSource('supabase');
      flash('Studio location saved — the public site will pick it up automatically.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location');
    } finally {
      setSavingLocation(false);
    }
  };

  const saveSiteSettings = async () => {
    try {
      setSavingSite(true);
      setError(null);
      const res = await fetch(apiUrl('/api/v1/admin/settings'), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(settings),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.success) throw new Error(d.error || d.message || 'Failed to save settings');
      flash('Site settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingSite(false);
    }
  };

  const setLoc = (field: keyof StudioLocation, value: string) =>
    setLocation((prev) => ({ ...prev, [field]: value }));
  const setSite = (field: keyof SiteSettings, value: string | boolean) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Studio location, site configuration and system status</p>
        </div>
        <Button onClick={fetchAll} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{success}
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Studio Location — the headline feature */}
      <Card className="border-rose-200/70 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <span className="rounded-lg bg-rose-100 p-1.5 text-rose-600"><MapPin className="h-4 w-4" /></span>
                Studio Location
              </CardTitle>
              <CardDescription className="mt-1">
                Change city, state or country here — the public website updates automatically.
                No code changes needed when you move.
              </CardDescription>
            </div>
            <Badge variant="outline" className={locationSource === 'supabase'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-amber-300 bg-amber-50 text-amber-700'}>
              {locationSource === 'supabase' ? 'Live' : 'Default'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="City">
              <Input value={location.city} onChange={(e) => setLoc('city', e.target.value)} placeholder="Providence" />
            </Field>
            <Field label="State">
              <Input value={location.state} onChange={(e) => setLoc('state', e.target.value)} placeholder="Rhode Island" />
            </Field>
            <Field label="State Code">
              <Input value={location.stateCode} onChange={(e) => setLoc('stateCode', e.target.value)} placeholder="RI" maxLength={4} />
            </Field>
            <Field label="Country">
              <Input value={location.country} onChange={(e) => setLoc('country', e.target.value)} placeholder="USA" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Region" hint="e.g. New England, Tri-State Area">
              <Input value={location.region} onChange={(e) => setLoc('region', e.target.value)} placeholder="New England" />
            </Field>
            <Field label="Display Preview" hint="How it appears on the site">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium">
                {location.city}, {location.stateCode || location.state} · {location.country}
              </div>
            </Field>
          </div>
          <Field label="Service Areas" hint="Comma-separated — cities/regions you serve">
            <Textarea
              value={serviceAreasText}
              onChange={(e) => setServiceAreasText(e.target.value)}
              rows={2}
              placeholder="Providence, Boston, Rhode Island, New York City, Miami"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business Phone">
              <Input value={location.phone} onChange={(e) => setLoc('phone', e.target.value)} placeholder="+1-646-379-4237" />
            </Field>
            <Field label="Business Email">
              <Input value={location.email} onChange={(e) => setLoc('email', e.target.value)} placeholder="info@jeffhonforlocophotos.com" />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveLocation} disabled={savingLocation} className="bg-rose-600 hover:bg-rose-700">
              <Save className="mr-2 h-4 w-4" />{savingLocation ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General site settings */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[15px]">
            <Globe className="h-4 w-4 text-slate-500" />General
          </CardTitle>
          <CardDescription>Basic site configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Site Name">
              <Input value={settings.siteName} onChange={(e) => setSite('siteName', e.target.value)} />
            </Field>
            <Field label="Site URL">
              <Input value={settings.siteUrl} onChange={(e) => setSite('siteUrl', e.target.value)} />
            </Field>
          </div>
          <Field label="Site Description">
            <Textarea value={settings.siteDescription} onChange={(e) => setSite('siteDescription', e.target.value)} rows={2} />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Admin Email">
              <Input value={settings.adminEmail} onChange={(e) => setSite('adminEmail', e.target.value)} />
            </Field>
            <Field label="Timezone">
              <Select value={settings.timezone} onValueChange={(v) => setSite('timezone', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Appearance + Email + Security + System in a 2-col grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <Palette className="h-4 w-4 text-slate-500" />Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Theme">
                <Select value={settings.theme} onValueChange={(v) => setSite('theme', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Language">
                <Select value={settings.language} onValueChange={(v) => setSite('language', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Alerts for new inquiries & bookings</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(v) => setSite('emailNotifications', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">Track visits and conversions</p>
              </div>
              <Switch checked={settings.analyticsEnabled} onCheckedChange={(v) => setSite('analyticsEnabled', v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <Shield className="h-4 w-4 text-slate-500" />Security & System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Temporarily hide the public site</p>
              </div>
              <Switch checked={settings.maintenanceMode} onCheckedChange={(v) => setSite('maintenanceMode', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Automatic Backups</p>
                <p className="text-xs text-muted-foreground">Database & file backups</p>
              </div>
              <Switch checked={settings.backupEnabled} onCheckedChange={(v) => setSite('backupEnabled', v)} />
            </div>
            <Field label="Security Level">
              <Select value={settings.securityLevel} onValueChange={(v) => setSite('securityLevel', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="maximum">Maximum</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSiteSettings} disabled={savingSite} variant="outline">
          <Save className="mr-2 h-4 w-4" />{savingSite ? 'Saving...' : 'Save Site Settings'}
        </Button>
      </div>

      {/* Status strip */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[15px]">
            <Server className="h-4 w-4 text-slate-500" />System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {(
              [
                ['Location', locationSource === 'supabase' ? 'Live' : 'Default', locationSource === 'supabase'],
                ['Maintenance', settings.maintenanceMode ? 'On' : 'Off', !settings.maintenanceMode],
                ['Email alerts', settings.emailNotifications ? 'On' : 'Off', settings.emailNotifications],
                ['Analytics', settings.analyticsEnabled ? 'On' : 'Off', settings.analyticsEnabled],
                ['Backups', settings.backupEnabled ? 'On' : 'Off', settings.backupEnabled],
                ['Security', settings.securityLevel, true],
              ] as [string, string, boolean][]
            ).map(([label, value, good]) => (
              <div key={label} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <Badge variant="outline" className={good ? 'border-emerald-300 text-emerald-700 capitalize' : 'border-amber-300 text-amber-700 capitalize'}>
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminSettings;
