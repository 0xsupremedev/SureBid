import { useEffect } from 'react';
import { useTxFeed } from '../store/txFeed';
import { useConnection } from '@solana/wallet-adapter-react';

export function LiveTxFeed() {
  const { items, update } = useTxFeed();
  const { connection } = useConnection();
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
  const cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as string) || 'devnet';

  useEffect(() => {
    const id = setInterval(async () => {
      const pending = items.filter((i) => i.status === 'pending').map((i) => i.signature);
      if (!connection || pending.length === 0) return;
      const res = await connection.getSignatureStatuses(pending);
      res.value.forEach((st, idx) => {
        const sig = pending[idx];
        if (!st) return;
        if (st.err) {
          update(sig, 'failed');
          fetch(`${backend}/tx`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signature: sig, status: 'failed', timeConfirmed: Date.now() }) }).catch(() => {});
        } else if (st.confirmations === null || (st.confirmationStatus === 'confirmed' || st.confirmationStatus === 'finalized')) {
          update(sig, 'confirmed');
          fetch(`${backend}/tx`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signature: sig, status: 'confirmed', timeConfirmed: Date.now() }) }).catch(() => {});
        }
      });
    }, 4000);
    return () => clearInterval(id);
  }, [items, connection, update]);

  const badgeCls = (s: string) => s === 'confirmed' ? 'bg-green-100 text-green-700' : s === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800';

  const copy = async (sig: string) => {
    try { await navigator.clipboard.writeText(sig); } catch {}
  };

  return (
    <div className="space-y-2" aria-live="polite">
      {items.length === 0 && <p className="text-sm text-gray-500">No transactions yet.</p>}
      {items.map((tx) => (
        <div key={tx.signature} className="border rounded p-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">{new Date(tx.ts).toLocaleTimeString()}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2 py-0.5 rounded ${badgeCls(tx.status)}`}>{tx.status}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">{tx.route ?? 'unknown'}</span>
              <a className="text-xs text-indigo-700 underline" href={`https://explorer.solana.com/tx/${tx.signature}?cluster=${cluster}`} target="_blank" rel="noreferrer">Explorer</a>
              <button className="text-xs text-gray-600 underline" onClick={() => copy(tx.signature)}>Copy</button>
            </div>
            <div className="text-sm font-mono truncate max-w-[360px]">{tx.signature}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

