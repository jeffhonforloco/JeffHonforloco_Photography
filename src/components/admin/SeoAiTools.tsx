import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Search, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import apiUrl from '../../lib/api-base';

async function authedPost(path: string, body: unknown) {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const SeoAiTools = () => {
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(apiUrl('/api/v1/admin/growth/seo-auto-runs'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAutoRuns(data.data || []);
      } catch {
        // auto-runs table may not exist yet
      } finally {
        setAutoLoading(false);
      }
      try {
        const scRes = await fetch(apiUrl('/api/v1/admin/growth/search-console'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const scJson = await scRes.json();
        if (scJson.success) setScData(scJson.data);
        else setScError(scJson.error || 'Search Console unavailable');
      } catch (e) {
        setScError(e instanceof Error ? e.message : 'Search Console unavailable');
      } finally {
        setScLoading(false);
      }
    })();
  }, []);
  const [seoInput, setSeoInput] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [autoRuns, setAutoRuns] = useState<{ run_type: string; target: string; analysis: string; created_at: string }[]>([]);
  const [autoLoading, setAutoLoading] = useState(true);
  const [scData, setScData] = useState<{
    site: string; days: number; fetchedAt: string;
    totals: { clicks: number; impressions: number };
    topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
    topPages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  } | null>(null);
  const [scLoading, setScLoading] = useState(true);
  const [scError, setScError] = useState<string | null>(null);

  const runSeoAnalysis = async () => {
    if (!seoInput.trim()) {
      toast({ title: 'Enter a search query or page URL', variant: 'destructive' });
      return;
    }
    setSeoLoading(true);
    setSeoResult(null);
    try {
      const isUrl = /^https?:\/\//i.test(seoInput.trim());
      const data = await authedPost(
        '/api/v1/admin/growth/seo-analyze',
        isUrl ? { url: seoInput.trim() } : { query: seoInput.trim() }
      );
      setSeoResult(data.data?.analysis || 'No analysis returned.');
    } catch (e) {
      toast({ title: 'SEO analysis failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSeoLoading(false);
    }
  };

  const runAiVisibility = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: 'Enter a prompt to test', variant: 'destructive' });
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const data = await authedPost('/api/v1/admin/growth/ai-visibility-check', { prompt: aiPrompt.trim() });
      setAiResult(data.data?.analysis || 'No analysis returned.');
    } catch (e) {
      toast({ title: 'AI visibility check failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Google Search Console
          </CardTitle>
          <CardDescription>
            Real clicks and impressions from Google Search for jeffhonforlocophotos.com (last 28 days).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading Search Console metrics…
            </div>
          ) : scError ? (
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium">Search Console unavailable</p>
                <p className="text-muted-foreground">{scError}</p>
              </div>
            </div>
          ) : scData ? (
            <div className="space-y-4">
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold">{scData.totals.clicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Clicks (28d)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{scData.totals.impressions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Impressions (28d)</p>
                </div>
              </div>
              {scData.topQueries.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Top queries</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-1 pr-4 font-medium">Query</th>
                          <th className="py-1 pr-4 font-medium">Clicks</th>
                          <th className="py-1 pr-4 font-medium">Impr.</th>
                          <th className="py-1 font-medium">Avg. pos.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scData.topQueries.slice(0, 10).map((q) => (
                          <tr key={q.query} className="border-t">
                            <td className="py-1 pr-4">{q.query}</td>
                            <td className="py-1 pr-4">{q.clicks}</td>
                            <td className="py-1 pr-4">{q.impressions}</td>
                            <td className="py-1">{q.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {scData.topQueries.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No search data yet for the last 28 days. Data appears here once Google records impressions.
                </p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Automatic Weekly Analysis
          </CardTitle>
          <CardDescription>
            Runs every Monday at 7:30 AM ET on your key search queries. Latest results below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {autoLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading latest auto-run…
            </div>
          ) : autoRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No automatic runs yet. The first runs Monday at 7:30 AM ET, or run a manual analysis below.
            </p>
          ) : (
            <div className="space-y-4">
              {autoRuns.slice(0, 10).map((run, i) => (
                <div key={i} className="rounded-md border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={run.run_type === 'seo' ? 'default' : 'secondary'}>
                      {run.run_type === 'seo' ? 'SEO' : 'AI Visibility'}
                    </Badge>
                    <span className="text-sm font-medium">{run.target}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(run.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{run.analysis}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Analyzer
          </CardTitle>
          <CardDescription>
            AI-powered SEO analysis for a search query or page URL, tuned for Jeff Honforloco Photography.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo-input">Search query or page URL</Label>
            <Input
              id="seo-input"
              placeholder='e.g. photographer Providence RI or https://jeffhonforlocophotos.com/pricing'
              value={seoInput}
              onChange={(e) => setSeoInput(e.target.value)}
            />
          </div>
          <Button onClick={runSeoAnalysis} disabled={seoLoading}>
            {seoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            {seoLoading ? 'Analyzing…' : 'Analyze'}
          </Button>
          {seoResult && (
            <div className="rounded-md border p-4 whitespace-pre-wrap text-sm">{seoResult}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Visibility Check
          </CardTitle>
          <CardDescription className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <span>
              Predicts whether the studio would likely surface in AI-generated answers.
              <Badge variant="outline" className="ml-2">Predictive only — not verified citations</Badge>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt">User prompt (as someone might ask an AI assistant)</Label>
            <Textarea
              id="ai-prompt"
              placeholder='e.g. Who is the best fashion photographer in Providence RI?'
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={runAiVisibility} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {aiLoading ? 'Checking…' : 'Check visibility'}
          </Button>
          {aiResult && (
            <div className="rounded-md border p-4 whitespace-pre-wrap text-sm">{aiResult}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoAiTools;
