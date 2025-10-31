SureBid – Implementation Overview

What’s implemented
- Anchor program (Solana)
  - Accounts: Auction PDA, separate escrow PDA (program-owned)
  - Instructions: create_auction, place_bid, finalize_auction, cancel_auction
  - Events: AuctionCreatedEvent, BidPlacedEvent, AuctionFinalizedEvent, AuctionCancelledEvent
  - Safety: CPI transfers from escrow PDA via invoke_signed; stored PDA bumps; no direct lamports mutation

- Frontend (Next.js + TypeScript)
  - Wallet: @solana/wallet-adapter (Phantom/Solflare)
  - Gateway: frontend/lib/gateway.ts using JSON-RPC (buildGatewayTransaction, sendTransaction) with NEXT_PUBLIC_GATEWAY_API_KEY
  - Solana utils: frontend/lib/solana.ts
    - Builders: buildCreateAuctionTx, buildPlaceBidTx, buildFinalizeAuctionTx
    - PDA derive: deriveAuctionPda
    - Listing: fetchAuctions via account discriminator
  - Hooks: useGateway, useWalletSigner, useAuctions (create/bid/finalize + list/refresh)
  - UI: PlaceBidModal, FinalizeButton, WalletConnect, LiveTxFeed, AdminRoutingSlider, MetricsPanel
  - Pages: / (create/bid/finalize + list), /admin/dashboard

- Backend (optional)
  - Minimal HTTP server at backend/src/index.js with /metrics placeholder

- CI
  - GitHub Actions workflow builds the frontend

Gateway usage
- Build: buildGatewayTransaction(unsignedBase64, options)
- Sign: decode result and sign in wallet
- Send: sendTransaction(signedBase64, options)
- Env: NEXT_PUBLIC_GATEWAY_ENDPOINT (e.g., https://tpg.sanctum.so/v1/devnet), NEXT_PUBLIC_GATEWAY_API_KEY

Key files
- smart-contracts/programs/surebid-auction/src/lib.rs
- frontend/lib/gateway.ts
- frontend/lib/solana.ts
- frontend/hooks/*
- frontend/pages/index.tsx, frontend/pages/admin/dashboard.tsx

Run locally
1) Create frontend/.env.local
   - NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   - NEXT_PUBLIC_GATEWAY_ENDPOINT=https://tpg.sanctum.so/v1/devnet
   - NEXT_PUBLIC_GATEWAY_API_KEY=YOUR_KEY
2) npm i
3) npm run dev -w frontend

Next improvements
- Populate LiveTxFeed with real signatures and statuses; route/tip metadata if available
- Extend backend metrics and display aggregates in MetricsPanel
- Add tests (Anchor + frontend) and extend CI to run them

