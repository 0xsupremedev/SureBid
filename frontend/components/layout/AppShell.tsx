import Link from 'next/link';
import { ReactNode } from 'react';
import { WalletConnect } from '../WalletConnect';

type Props = { title?: string; children: ReactNode };

export default function AppShell({ title = 'Live Dashboard', children }: Props) {
  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-[#0B1220]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><span className="text-cyan-300 font-bold">SureBid</span></Link>
            <span className="text-sm text-gray-400">/ {title}</span>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnect />
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-2 space-y-2">
          <nav className="space-y-1">
            <NavItem href="/admin/dashboard" label="Dashboard" active />
            <NavItem href="#" label="Auctions" />
            <NavItem href="#" label="Analytics" />
            <NavItem href="#" label="Forensics" />
            <NavItem href="#" label="Settings" />
            <NavItem href="/docs" label="Docs" />
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`block px-3 py-2 rounded ${active ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800/60'}`}>{label}</Link>
  );
}


