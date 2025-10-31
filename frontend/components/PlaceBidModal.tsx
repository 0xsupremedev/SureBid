import { useState } from 'react';
import { useGateway } from '../hooks/useGateway';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPlaceBid: (lamports: number) => Promise<string>;
};

export function PlaceBidModal({ isOpen, onClose, onPlaceBid }: Props) {
  const { } = useGateway();
  const [amount, setAmount] = useState('');
  const [preset, setPreset] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'preparing' | 'broadcasting' | 'pending' | 'none'>('preparing');

  if (!isOpen) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    setStatus('broadcasting');
    try {
      const lamports = Math.floor(Number(amount));
      await onPlaceBid(lamports);
      setStatus('pending');
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md w-full max-w-md p-4" role="dialog" aria-modal="true" aria-labelledby="place-bid-title">
        <h2 id="place-bid-title" className="text-xl font-semibold">Place a bid</h2>
        <div className="mt-2 text-xs" aria-live="polite">
          {status === 'preparing' && <span className="text-blue-600">Preparing your bid — Gateway simulating & optimizing fees…</span>}
          {status === 'broadcasting' && <span className="text-amber-700">Broadcasting via Sanctum Gateway (RPC + Jito)…</span>}
          {status === 'pending' && <span className="text-gray-700">Pending — awaiting inclusion…</span>}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Amount (lamports)</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000000"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Delivery priority</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={preset}
            onChange={(e) => setPreset(e.target.value as any)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex gap-2 justify-end">
          <button className="px-4 py-2 rounded bg-gray-100" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={submit} disabled={loading}>
            {loading ? 'Placing…' : 'Place bid'}
          </button>
        </div>
      </div>
    </div>
  );
}

