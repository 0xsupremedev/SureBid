import { useEffect, useState } from 'react';

export function KpiStrip() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(`${backend}/metrics/json?window=24h`).then(r => r.json()).then(setData).catch(() => setData(null));
  }, [backend]);

  const success = data ? (100 * (1 - (data.failed_tx_rate ?? 0))).toFixed(1) + '%' : '—';
  const median = data ? ((data.median_confirmation_time_ms ?? 0) / 1000).toFixed(1) + 's' : '—';
  const refunds = data ? `${data.jito_refund_count ?? 0}` : '—';
  const avgCost = data ? ((data.avg_cost_per_tx_lamports ?? 0) / 1e9).toFixed(6) + ' SOL' : '—';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="Success Rate (24h)" value={success} subtitle="% of critical finalize transactions confirmed" />
      <KpiCard title="Median Confirm Time" value={median} subtitle="finalize tx" />
      <KpiCard title="Jito Refunds (24h)" value={refunds} subtitle="count saved" />
      <KpiCard title="Avg Cost / tx" value={avgCost} subtitle="incl. tips" />
    </div>
  );
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}


