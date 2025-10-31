import { useEffect, useState } from 'react';
import { useWalletSigner } from '../hooks/useWalletSigner';

export function AdminRoutingSlider() {
  const { publicKey, signBytes } = useWalletSigner();
  const [rpc, setRpc] = useState(50);
  const [jito, setJito] = useState(40);
  const [sender, setSender] = useState(10);
  const total = rpc + jito + sender;
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${backend}/admin/routing`).then((r) => r.json()).then((d) => {
      if (d?.weights) {
        setRpc(d.weights.rpc);
        setJito(d.weights.jito);
        setSender(d.weights.sender);
      }
    }).catch(() => {});
  }, [backend]);

  const apply = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // fetch challenge nonce
      const chal = await fetch(`${backend}/admin/challenge`).then((r) => r.json());
      if (!chal?.nonce) throw new Error('Challenge unavailable');
      if (!publicKey) throw new Error('Connect admin wallet');
      const msg = new TextEncoder().encode(`${chal.nonce}|${rpc},${jito},${sender}`);
      const sig = await signBytes(msg);
      const res = await fetch(`${backend}/admin/routing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpc, jito, sender, admin: publicKey.toBase58(), signature: Buffer.from(sig).toString('base64'), nonce: chal.nonce })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to apply');
      setMessage('Applied');
    } catch (e: any) {
      setMessage(e?.message || 'Error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">RPC {rpc}%</label>
        <input type="range" min={0} max={100} value={rpc} onChange={(e) => setRpc(Number(e.target.value))} className="w-full" />
      </div>
      <div>
        <label className="text-sm font-medium">Jito {jito}%</label>
        <input type="range" min={0} max={100} value={jito} onChange={(e) => setJito(Number(e.target.value))} className="w-full" />
      </div>
      <div>
        <label className="text-sm font-medium">Sender {sender}%</label>
        <input type="range" min={0} max={100} value={sender} onChange={(e) => setSender(Number(e.target.value))} className="w-full" />
      </div>
      <div className={`text-sm ${total === 100 ? 'text-green-700' : 'text-amber-700'}`}>Total: {total}%</div>
      <div className="flex items-center gap-3">
        <button className="px-3 py-2 rounded bg-indigo-600 text-white" disabled={total !== 100 || saving} onClick={apply}>{saving ? 'Saving…' : 'Apply'}</button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
}

