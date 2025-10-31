import { useState } from 'react';
import { useGateway } from '../hooks/useGateway';

type Props = {
  onFinalize: () => Promise<string>;
};

export function FinalizeButton({ onFinalize }: Props) {
  const { } = useGateway();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const click = async () => {
    setLoading(true);
    setError(null);
    try {
      await onFinalize();
    } catch (e: any) {
      setError(e?.message || 'Failed to finalize');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={click} disabled={loading}>
        {loading ? 'Finalizing…' : 'Finalize Auction'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

