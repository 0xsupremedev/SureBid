import { useEffect, useMemo, useState } from 'react';

type Metric = { label: string; value: string };

export function MetricsPanel() {
  const [windowSel, setWindowSel] = useState<'5m' | '1h' | '24h'>('5m');
  const [data, setData] = useState<any | null>(null);
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';

  useEffect(() => {
    fetch(`${backend}/metrics/json?window=${windowSel}`).then((r) => r.json()).then(setData).catch(() => setData(null));
  }, [backend, windowSel]);

  const metrics: Metric[] = useMemo(() => {
    if (!data) return [
      { label: 'Failed Tx Rate', value: '—' },
      { label: 'Avg Cost / Tx (SOL)', value: '—' },
      { label: 'Jito Refunds (count)', value: '—' },
      { label: 'Median Settlement (s)', value: '—' }
    ];
    const failed = (data.failed_tx_rate ?? 0) * 100;
    const avgCostSol = (data.avg_cost_per_tx_lamports ?? 0) / 1e9;
    const medianSecs = (data.median_confirmation_time_ms ?? 0) / 1000;
    return [
      { label: 'Failed Tx Rate', value: `${failed.toFixed(2)}%` },
      { label: 'Avg Cost / Tx (SOL)', value: avgCostSol.toFixed(6) },
      { label: 'Jito Refunds (count)', value: String(data.jito_refund_count ?? 0) },
      { label: 'Median Settlement (s)', value: medianSecs.toFixed(2) }
    ];
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Window</span>
        <select className="border rounded px-2 py-1 text-sm" value={windowSel} onChange={(e) => setWindowSel(e.target.value as any)}>
          <option value="5m">Last 5m</option>
          <option value="1h">Last 1h</option>
          <option value="24h">Last 24h</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="border rounded p-3">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className="text-xl font-semibold">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

