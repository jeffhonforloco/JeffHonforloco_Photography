import { useState } from 'react';
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
  const [seoInput, setSeoInput] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

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
