import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWalletSigner } from './useWalletSigner';
import { useGateway } from './useGateway';
import { buildCreateAuctionTx, buildFinalizeAuctionTx, buildPlaceBidTx, deriveAuctionPda, fetchAuctions, txToBase64, type AuctionAccount } from '../lib/solana';
import { useTxFeed } from '../store/txFeed';

export function useAuctions() {
  const { connection, publicKey, sign } = useWalletSigner();
  const { build, send } = useGateway();
  const [creating, setCreating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [auctions, setAuctions] = useState<AuctionAccount[] | null>(null);

  const refresh = useCallback(async () => {
    if (!connection) return;
    const list = await fetchAuctions(connection);
    setAuctions(list);
  }, [connection]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAuction = useCallback(async (durationSeconds: number, minBidLamports: number, minIncrementLamports: number) => {
    if (!connection || !publicKey) throw new Error('Connect wallet');
    setCreating(true);
    try {
      const endTs = Math.floor(Date.now() / 1000) + durationSeconds;
      const tx = await buildCreateAuctionTx(connection, publicKey, endTs, minBidLamports, minIncrementLamports);
      const unsignedBase64 = txToBase64(tx);
      const built = await build(unsignedBase64, { cuPriceRange: 'medium', jitoTipRange: 'low' });
      const decoded = Buffer.from(built.encodedTransactionBase64, 'base64');
      const txSigned = await sign(Transaction.from(decoded));
      const signedBase64 = Buffer.from(txSigned.serialize()).toString('base64');
      const options = { deliveryMethodType: 'balanced', cuPriceRange: 'medium', jitoTipRange: 'low' } as const;
      const res = await send(signedBase64, options as any);
      const signature: string = res?.txSignature || res?.signature || '';
      if (signature) useTxFeed.getState().add(signature, 'unknown');
      // persist to backend feed
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
      fetch(`${backend}/tx`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signature, options, response: res, timeSent: Date.now(), status: 'pending' }) }).catch(() => {});
      await refresh();
      return signature || 'ok';
    } finally {
      setCreating(false);
    }
  }, [connection, publicKey, build, send, sign, refresh]);

  const placeBid = useCallback(async (seller: string, auctionEndTs: number, amountLamports: number, previousHighestBidder?: string) => {
    if (!connection || !publicKey) throw new Error('Connect wallet');
    setPlacing(true);
    try {
      const sellerPk = new PublicKey(seller);
      const [auctionPda] = await deriveAuctionPda(sellerPk, auctionEndTs);
      const prev = previousHighestBidder ? new PublicKey(previousHighestBidder) : publicKey; // fallback
      const tx = await buildPlaceBidTx(connection, publicKey, auctionPda, sellerPk, prev, amountLamports);
      const unsignedBase64 = txToBase64(tx);
      const built = await build(unsignedBase64, { cuPriceRange: 'medium', jitoTipRange: 'low' });
      const decoded = Buffer.from(built.encodedTransactionBase64, 'base64');
      const txSigned = await sign(Transaction.from(decoded));
      const signedBase64 = Buffer.from(txSigned.serialize()).toString('base64');
      const options = { deliveryMethodType: 'balanced', cuPriceRange: 'medium', jitoTipRange: 'low' } as const;
      const res = await send(signedBase64, options as any);
      const signature: string = res?.txSignature || res?.signature || '';
      if (signature) useTxFeed.getState().add(signature, 'unknown');
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
      fetch(`${backend}/tx`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signature, options, response: res, timeSent: Date.now(), status: 'pending' }) }).catch(() => {});
      await refresh();
      return signature || 'ok';
    } finally {
      setPlacing(false);
    }
  }, [connection, publicKey, build, send, sign, refresh]);

  const finalize = useCallback(async (seller: string, auctionEndTs: number) => {
    if (!connection || !publicKey) throw new Error('Connect wallet');
    setFinalizing(true);
    try {
      const sellerPk = new PublicKey(seller);
      const [auctionPda] = await deriveAuctionPda(sellerPk, auctionEndTs);
      const tx = await buildFinalizeAuctionTx(connection, publicKey, auctionPda, sellerPk);
      const unsignedBase64 = txToBase64(tx);
      const built = await build(unsignedBase64, { cuPriceRange: 'high', jitoTipRange: 'high', deliveryMethodType: 'jito' });
      const decoded = Buffer.from(built.encodedTransactionBase64, 'base64');
      const txSigned = await sign(Transaction.from(decoded));
      const signedBase64 = Buffer.from(txSigned.serialize()).toString('base64');
      const options = { deliveryMethodType: 'jito', cuPriceRange: 'high', jitoTipRange: 'high' } as const;
      const res = await send(signedBase64, options as any);
      const signature: string = res?.txSignature || res?.signature || '';
      if (signature) useTxFeed.getState().add(signature, 'jito');
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';
      fetch(`${backend}/tx`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signature, options, response: res, timeSent: Date.now(), status: 'pending' }) }).catch(() => {});
      await refresh();
      return signature || 'ok';
    } finally {
      setFinalizing(false);
    }
  }, [connection, publicKey, build, send, sign, refresh]);

  return { createAuction, placeBid, finalize, creating, placing, finalizing, auctions, refresh };
}

