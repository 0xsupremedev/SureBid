import Head from 'next/head';
import { AdminRoutingSlider } from '../../components/AdminRoutingSlider';
import { MetricsPanel } from '../../components/MetricsPanel';
import { LiveTxFeed } from '../../components/LiveTxFeed';
import AppShell from '../../components/layout/AppShell';
import { KpiStrip } from '../../components/KpiStrip';
import { ChartsPanel } from '../../components/ChartsPanel';

export default function Dashboard() {
  return (
    <AppShell title="Live Dashboard">
      <Head>
        <title>SureBid Admin</title>
      </Head>
      <div className="space-y-8">
        <KpiStrip />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-gray-800 bg-[#0F172A] p-4">
            <div className="text-sm text-gray-400 mb-3">Live Transaction Feed</div>
            <LiveTxFeed />
          </div>
          <div className="lg:col-span-5">
            <ChartsPanel />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
            <div className="text-sm text-gray-400 mb-3">Transaction Routing</div>
            <AdminRoutingSlider />
          </div>
          <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-4">
            <div className="text-sm text-gray-400 mb-3">Metrics</div>
            <MetricsPanel />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

