import { create } from 'zustand';

export type TxStatus = 'pending' | 'confirmed' | 'failed';
export type TxRoute = 'rpc' | 'jito' | 'sender' | 'unknown';

export type TxItem = {
  signature: string;
  status: TxStatus;
  route?: TxRoute;
  ts: number;
};

type TxFeedState = {
  items: TxItem[];
  add: (sig: string, route?: TxRoute) => void;
  update: (sig: string, status: TxStatus, route?: TxRoute) => void;
};

export const useTxFeed = create<TxFeedState>((set) => ({
  items: [],
  add: (signature, route) =>
    set((s) => ({ items: [{ signature, status: 'pending', route, ts: Date.now() }, ...s.items].slice(0, 200) })),
  update: (signature, status, route) =>
    set((s) => ({
      items: s.items.map((it) => (it.signature === signature ? { ...it, status, route: route ?? it.route } : it))
    }))
}));

