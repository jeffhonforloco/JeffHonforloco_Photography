import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Mail, 
  MessageSquare,
  Download,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  pageViews: number;
  contactForms: number;
  newsletterSignups: number;
  portfolioViews: number;
  blogViews: number;
  dailyData: Record<string, Record<string, number>>;
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/v1/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/v1/admin/export/analytics?format=csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const getDailyData = () => {
    if (!analytics?.dailyData) return [];
    
    return Object.entries(analytics.dailyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-30); // Last 30 days
  };

  const getTotalForMetric = (metric: string) => {
    if (!analytics) return 0;
    
    switch (metric) {
      case 'pageViews': return analytics.pageViews;
      case 'contactForms': return analytics.contactForms;
      case 'newsletterSignups': return analytics.newsletterSignups;
      case 'portfolioViews': return analytics.portfolioViews;
      case 'blogViews': return analytics.blogViews;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your website performance and user engagement</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
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
            <div>
              <label className="text-sm font-medium text-gray-500">Time Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="pageViews">Page Views</SelectItem>
                  <SelectItem value="contactForms">Contact Forms</SelectItem>
                  <SelectItem value="newsletterSignups">Newsletter Signups</SelectItem>
                  <SelectItem value="portfolioViews">Portfolio Views</SelectItem>
                  <SelectItem value="blogViews">Blog Views</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pageViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Forms</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.contactForms || 0}</div>
            <p className="text-xs text-muted-foreground">
              Form submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.newsletterSignups || 0}</div>
            <p className="text-xs text-muted-foreground">
              Email signups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.portfolioViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Portfolio interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.blogViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Blog interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Analytics</CardTitle>
          <CardDescription>
            Track daily performance over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getDailyData().map(([date, data]) => (
              <div key={date} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-6">
                  {Object.entries(data).map(([metric, count]) => (
                    <div key={metric} className="text-center">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {metric.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
            <CardDescription>
              Track how visitors convert to leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Contact Form Rate</span>
                <span className="text-sm">
                  {analytics?.pageViews ? 
                    ((analytics.contactForms / analytics.pageViews) * 100).toFixed(2) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Newsletter Signup Rate</span>
                <span className="text-sm">
                  {analytics?.pageViews ? 
                    ((analytics.newsletterSignups / analytics.pageViews) * 100).toFixed(2) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Portfolio Engagement</span>
                <span className="text-sm">
                  {analytics?.pageViews ? 
                    ((analytics.portfolioViews / analytics.pageViews) * 100).toFixed(2) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>
              Your most engaging content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Portfolio Views</span>
                <Badge variant="outline">{analytics?.portfolioViews || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Blog Views</span>
                <Badge variant="outline">{analytics?.blogViews || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Contact Forms</span>
                <Badge variant="outline">{analytics?.contactForms || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
