import { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import EmailAutomation from '../components/EmailAutomation';
import LeadMagnet from '../components/LeadMagnet';
import ContentGenerator from '../components/ContentGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Mail, Users, TrendingUp, FileText, Instagram, Zap } from 'lucide-react';

const Dashboard = () => {
  const { stats } = useEmailAutomation();
  const { analyticsData, getPopularPages, getTopReferrers } = useAnalytics();
  const [activeTab, setActiveTab] = useState('overview');

  const popularPages = getPopularPages();
  const topReferrers = getTopReferrers();

  return (
    <Layout>
      <SEO 
        title="Dashboard - Jeff Honforloco Photography"
        description="Analytics and automation dashboard for Jeff Honforloco Photography"
        url="/dashboard"
      />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Analytics, automation, and content management for your photography business
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.thisWeekSignups} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalPageViews}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.uniqueVisitors} unique visitors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Email signups to completions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.bounceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(analyticsData.averageSessionDuration / 60)}m avg session
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Lead Magnets</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <Instagram className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {popularPages.slice(0, 5).map((page, index) => (
                        <div key={page.page} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm font-medium">{page.page}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{page.views} views</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Referrers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topReferrers.slice(0, 5).map((referrer, index) => (
                        <div key={referrer.referrer} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm font-medium">{referrer.referrer}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{referrer.visits} visits</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.events.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">{event.event.replace('_', ' ')}</Badge>
                          <span className="text-sm">{event.page}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <EmailAutomation />
            </TabsContent>

            <TabsContent value="leads">
              <LeadMagnet />
            </TabsContent>

            <TabsContent value="content">
              <ContentGenerator />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detailed Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Page Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {popularPages.map((page) => (
                        <div key={page.page} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{page.page}</div>
                            <div className="text-sm text-muted-foreground">{page.views} total views</div>
                          </div>
                          <Badge variant="outline">{page.views}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Event Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        analyticsData.events.reduce((acc: Record<string, number>, event) => {
                          acc[event.event] = (acc[event.event] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([event, count]) => (
                        <div key={event} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{event.replace('_', ' ')}</div>
                            <div className="text-sm text-muted-foreground">Total occurrences</div>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;