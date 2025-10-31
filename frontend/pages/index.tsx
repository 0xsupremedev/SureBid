import Head from 'next/head';
import { WalletConnect } from '../components/WalletConnect';
import { useState } from 'react';
import { useAuctions } from '../hooks/useAuctions';
import { PlaceBidModal } from '../components/PlaceBidModal';
import { FinalizeButton } from '../components/FinalizeButton';
import { useWalletSigner } from '../hooks/useWalletSigner';

export default function Home() {
  const { createAuction, placeBid, finalize, auctions } = useAuctions();
  const { publicKey } = useWalletSigner();
  const [modalOpen, setModalOpen] = useState(false);
  // Demo values: seller = current wallet; auction ends in 5 minutes
  const [duration] = useState(5 * 60);
  const [minBid] = useState(1000000);
  const [minInc] = useState(100000);
  const [sellerKey, setSellerKey] = useState<string | null>(null);
  const [endTs, setEndTs] = useState<number | null>(null);

  const create = async () => {
    const tsEnd = Math.floor(Date.now() / 1000) + duration;
    const sig = await createAuction(duration, minBid, minInc);
    setEndTs(tsEnd);
    if (publicKey) setSellerKey(publicKey.toBase58());
    console.log('create sig', sig);
  };

  const onPlaceBid = async (lamports: number) => {
    if (!endTs) throw new Error('Create auction first');
    if (!sellerKey) throw new Error('Missing seller');
    const sig = await placeBid(sellerKey, endTs, lamports);
    console.log('bid sig', sig);
    return sig;
  };

  const onFinalize = async () => {
    if (!endTs) throw new Error('Create auction first');
    if (!sellerKey) throw new Error('Missing seller');
    const sig = await finalize(sellerKey, endTs);
    console.log('finalize sig', sig);
    return sig;
  };
  return (
    <>
      <Head>
        <title>SureBid</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-3xl w-full px-4">
          <h1 className="text-3xl font-bold">SureBid</h1>
          <p className="text-gray-500">Solana auctions with Sanctum Gateway</p>
          <div className="mt-6">
            <WalletConnect />
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={create}>Create Auction</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setModalOpen(true)}>Place Bid</button>
            <FinalizeButton onFinalize={onFinalize} />
          </div>
          <PlaceBidModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onPlaceBid={onPlaceBid} />
          <div className="mt-10 text-left">
            <h2 className="text-xl font-semibold mb-3">Active Auctions</h2>
            {!auctions && <p className="text-gray-500">Loading…</p>}
            {auctions && auctions.length === 0 && <p className="text-gray-500">No auctions yet.</p>}
            {auctions && auctions.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {auctions.map(a => (
                  <div key={a.pubkey.toBase58()} className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-mono">{a.pubkey.toBase58().slice(0, 8)}…</div>
                      <div className="text-xs text-gray-500">Seller: {a.seller.toBase58().slice(0, 8)}…</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Ends: {new Date(a.endTs * 1000).toLocaleTimeString()}</div>
                      <div className="text-xs text-gray-600">Highest: {(Number(a.highestBidLamports) / 1e9).toFixed(4)} SOL</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

