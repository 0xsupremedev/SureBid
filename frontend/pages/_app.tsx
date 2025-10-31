import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function App({ Component, pageProps }: AppProps) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

