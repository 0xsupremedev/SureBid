import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletConnect() {
  return (
    <div className="flex justify-center p-4">
      <WalletMultiButton />
    </div>
  );
}

