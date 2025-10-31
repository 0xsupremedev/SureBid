import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

export function useWalletSigner() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signMessage } = useWallet();

  const signer = useMemo(() => ({ connection, publicKey, signTransaction, signMessage }), [connection, publicKey, signTransaction, signMessage]);

  async function sign(tx: Transaction): Promise<Transaction> {
    if (!signTransaction) throw new Error('Wallet not connected');
    return await signTransaction(tx);
  }

  async function signBytes(message: Uint8Array): Promise<Uint8Array> {
    if (!signMessage) throw new Error('Wallet cannot sign messages');
    return await signMessage(message);
  }

  return { connection, publicKey, sign, signBytes };
}

