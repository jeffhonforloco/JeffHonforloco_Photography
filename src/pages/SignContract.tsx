import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Loader2, CheckCircle2, AlertTriangle, PenLine } from 'lucide-react';
import { apiUrl } from '@/lib/api-base';

interface ContractData {
  type: 'paid' | 'collab'; title: string; client_name: string; body_text: string;
  status: string; signer_name: string | null; signed_at: string | null; alreadySigned: boolean;
}

/**
 * Public contract signing page — /sign/:token
 * No login required; the 32-char token is the only gate.
 */
const SignContract: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const [signerName, setSignerName] = useState('');
  const [agree, setAgree] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  // Proper tab title (was showing "Page Not Found")
  useEffect(() => {
    document.title = contract
      ? `${contract.title} | Jeff Honforloco Photography`
      : 'Contract Signing | Jeff Honforloco Photography';
  }, [contract]);

  useEffect(() => {
    (async () => {
      if (!token) { setError('Invalid signing link.'); setLoading(false); return; }
      try {
        const res = await fetch(apiUrl(`/api/v1/contracts/sign/${token}`));
        const d = await res.json();
        if (!res.ok) {
          setExpired(!!d.expired);
          throw new Error(d.error || 'Could not load this contract.');
        }
        setContract(d.data);
        if (d.data.alreadySigned) setSigned(true);
      } catch (e) { setError(e instanceof Error ? e.message : 'Could not load this contract.'); }
      setLoading(false);
    })();
  }, [token]);

  const sign = async () => {
    if (!token) return;
    setSigning(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/contracts/sign/${token}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signer_name: signerName, agree }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Signing failed.');
      setSigned(true);
      setContract((c) => c ? { ...c, signer_name: signerName, signed_at: new Date().toISOString(), status: 'signed', alreadySigned: true } : c);
    } catch (e) { setError(e instanceof Error ? e.message : 'Signing failed.'); }
    setSigning(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Jeff Honforloco Photography</p>
          <h1 className="mt-2 flex items-center justify-center gap-2 text-2xl font-bold"><FileText className="h-6 w-6" /> Contract Signing</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
        ) : error && !contract ? (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <p className="font-semibold text-red-200">{expired ? 'This link has expired' : 'Unable to open contract'}</p>
            <p className="mt-1 text-sm text-red-300/80">{error}</p>
            <p className="mt-4 text-xs text-slate-400">Please contact Jeff Honforloco Photography for a new signing link.</p>
          </div>
        ) : contract ? (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {contract.type === 'paid' ? 'Photography Services Agreement' : 'Collaboration (TFP) Agreement'}
              </p>
              <h2 className="mt-1 text-xl font-bold">{contract.title}</h2>
              <p className="mt-1 text-sm text-slate-400">Prepared for {contract.client_name}</p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto border-b border-slate-800 bg-white p-6">
              <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-slate-800">{
                // Safety net: never show raw {placeholders} to signers
                contract.body_text.replace(/\{[a-z_]+\}/g, 'TBD')
              }</pre>
            </div>

            {signed ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
                <p className="text-lg font-bold text-emerald-300">Contract signed</p>
                <p className="mt-1 text-sm text-slate-400">
                  Signed by {contract.signer_name}{contract.signed_at ? ` on ${contract.signed_at.slice(0, 10)}` : ''}.
                  Jeff has been notified — he'll be in touch shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {error && <p className="rounded-lg bg-red-950/60 p-3 text-sm text-red-300">{error}</p>}
                <div>
                  <label className="flex items-center gap-1 text-sm font-semibold"><PenLine className="h-4 w-4" /> Type your full legal name to sign</label>
                  <input value={signerName} onChange={(e) => setSignerName(e.target.value)}
                    placeholder="e.g. Jane Marie Doe"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-lg text-white placeholder:text-slate-500 focus:border-slate-500 focus:outline-none" />
                  {signerName.trim() && (
                    <p className="mt-2 border-b border-slate-700 pb-1 font-serif text-2xl italic text-slate-200">{signerName.trim()}</p>
                  )}
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 accent-emerald-500" />
                  <span className="text-sm text-slate-300">
                    I have read the agreement above, I understand its terms, and I agree to be bound by them.
                    I confirm that typing my name constitutes my electronic signature.
                  </span>
                </label>
                <button onClick={sign} disabled={signing || !signerName.trim() || !agree}
                  className="w-full rounded-xl bg-emerald-600 py-4 text-base font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">
                  {signing ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Sign Contract'}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Your name, the signing time, and device info are recorded as proof of signature.
                </p>
              </div>
            )}
          </div>
        ) : null}

        <p className="mt-8 text-center text-xs text-slate-500">
          Questions? Email <a href="mailto:info@jeffhonforlocophotos.com" className="underline">info@jeffhonforlocophotos.com</a> or call +1-646-379-4237
        </p>
      </div>
    </div>
  );
};

export default SignContract;
