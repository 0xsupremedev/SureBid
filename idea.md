SureBid: A Fail-Safe Solana NFT Auction House

Auctions demand reliability: transactions must land quickly and atomically. Failures erode trust and value. SureBid is a Solana NFT auction platform engineered for guaranteed bid settlement and finalization. In a traditional setting, network congestion or front-running can make bids fail or linger, destroying user experience. Sanctum Gateway solves this by optimizing and multiplexing transactions under the hood. Its Optimize stage automatically simulates each bid transaction, setting compute-unit limits and priority fees based on current network conditions
sanctum.so
. The Delivery stage then routes the signed transaction simultaneously through multiple channels – public RPC nodes, Triton/PALADIN relayers, and Jito bundle channels
sanctum.so
gateway.sanctum.so
 – dramatically increasing the chance a bid lands successfully. For example, the Sanctum team notes that Gateway’s multi-path delivery “ensures that the transaction has the best chances of landing, even in times of congestion”
sanctum.so
. By contrast, a single-RPC approach leaves bids vulnerable to dropped or attacked transactions.

Overcoming Auction Challenges on Solana

Solana auctions (e.g. using Metaplex Auction House or custom programs) often involve multiple on-chain steps (e.g. placing a bid, moving funds to escrow, and later finalizing the sale). These steps are highly latency-sensitive and must succeed in order. In practice, failed bids mean lost sales; front-running bots can snipe bids by spotting pending transactions in mempools. SureBid overcomes these problems in several ways:

Multi-Path Delivery & Tip Refunds: SureBid uses Gateway’s sendTransaction API to send each bid via both RPC and Jito bundles in parallel
sanctum.so
gateway.sanctum.so
. If the RPC path includes the bid into a block first, Gateway automatically refunds the Jito bundle tip so the user only pays the cheaper RPC fee
sanctum.so
sanctum.so
. This “best of both worlds” approach ensures fast inclusion without double-paying, as Sanctum describes: “you can send transactions through RPCs and Jito Bundles at the same time. If they land through RPC, we refund the Jito tip, saving the user from paying it”
sanctum.so
. In practice, projects report saving hundreds of thousands of dollars by recovering these tips.

Atomic Bidding via Jito Bundles: For auction logic that spans multiple transactions (for example, moving SOL to escrow and placing a bid), SureBid can leverage Jito bundles for atomicity. Gateway’s builder stage (buildGatewayTransaction) can automatically append Jito tip instructions to group transactions into a bundle
gateway.sanctum.so
. As QuickNode explains, “a Jito Bundle is a group of up to five Solana transactions that are executed sequentially and atomically… ensuring that either all transactions in the Bundle succeed or none are processed”
quicknode.com
. By bundling the bid and any related steps, SureBid guarantees all-or-nothing execution, eliminating partial failures (and preventing a front-runner from inserting an intermediate sale).

Real-Time Control & Observability: Unlike hard-coded RPC setups, Gateway provides a live dashboard. SureBid developers can adjust fee tiers, delivery methods, and timeouts on the fly without code redeployments
gateway.sanctum.so
sanctum.so
. During an auction, the team will monitor each bid transaction in real time. Gateway’s logs and metrics (inherited from Ironforge’s transaction monitoring) allow instantly diagnosing issues
sanctum.so
sanctum.so
. For example, if one RPC endpoint slows or fails, SureBid can immediately re-route future bids through alternate nodes via Gateway’s “round-robin” routing settings (configuring weighted traffic across RPCs, relayers, and Sanctum Sender) without touching a line of code. This level of observability means any potential problem (e.g. rising latency or dropped bids) can be caught and addressed in seconds rather than hours.

SureBid Architecture & Integration

To build SureBid, the team would integrate Sanctum Gateway into the auction workflow as follows:

Deploy Auction Program: Use an on-chain auction protocol (e.g. Metaplex’s Auction House or a custom Anchor program) that supports listing NFTs and placing bids. Configure the Auction House so bids escrow funds into a PDA and enable permissionless executeSale once bidding ends.

Gateway Setup: Sign up for Sanctum Gateway, obtain an API key, and choose network (devnet/mainnet) endpoints. In the code that constructs each bid transaction, replace the raw Solana SDK send with Gateway’s APIs. Specifically, call buildGatewayTransaction on the unsigned bid transaction. This single API call will simulate the transaction, determine the needed compute-unit limit and priority fee, fetch current priority-fee rates, and insert tip instructions as needed for Jito bundles or other senders
gateway.sanctum.so
sanctum.so
. The response returns a ready-to-sign, optimized transaction.

Signing & Sending: Sign the optimized transaction with the bidder’s keypair. Then call Gateway’s sendTransaction endpoint. This will route the signed transaction through all enabled channels: for example, a standard RPC path and a Jito bundle path
sanctum.so
github.com
. Gateway will automatically manage any protocol specifics (e.g. tipping, retries). Under the hood this uses Sanctum Sender or a relay for RPC vs. sending to Jito’s relayer for bundling, all abstracted from us.

Fallback and Retry Logic: Gateway handles retries automatically. If an RPC path fails (e.g. node outage), it will retry via another configured RPC or via a Jito bundle. Likewise, if a Jito bundle misses a block, Gateway can re-attempt or rely on the RPC result. All of this happens within milliseconds and requires no manual intervention.

Monitoring & Adjustment: Use the Sanctum Gateway dashboard to monitor each bid and sale transaction’s status. The team can see, for example, which channel delivered each transaction, how much priority fee was used, and if any got dropped. If congestion spikes, the team can increase priority-fee presets or switch delivery weights live. Any time a bid fails or is taking too long, Gateway’s logs let developers debug quickly.

Settlement Phase: When finalizing the auction (calling executeSale), use the same Gateway process. In one atomic operation or a small batch bundle, move the highest bid’s funds and transfer the NFT. Gateway ensures this settlement transaction also benefits from multi-route delivery and tip refunds, guaranteeing the final sale closure completes with minimal latency.

Implementation Plan and Deliverables

Code Integration: Incorporate the Sanctum Gateway SDK or API calls into SureBid’s frontend/backend. For example, use the Gateway’s fetch-based RPC: build each bid with buildGatewayTransaction, then deliver with sendTransaction
github.com
sanctum.so
. This replaces hundreds of lines of manual fee-calculation code
gateway.sanctum.so
. Provide environment variables for the Gateway endpoint and API key.

Testing & Metrics: Simulate auctions on devnet. Measure bid success rates and confirmation times with and without Gateway. We expect benchmarks similar to other projects: e.g. one Gateway-integrated marketplace reported “99.9%+ transaction success rate even during network congestion” and sub-5-second finality
github.com
. Capture cost metrics too: track how often the Jito tip is refunded (saving ~0.01 SOL per bid when RPC wins) versus traditional Jito-only sends.

Demo & Dashboard: Prepare a live demo showing bids submitted in succession. Use Gateway’s dashboard to highlight each transaction’s multi-path journey. Show toggling a fee tier or pausing an RPC node in real time to demonstrate Gateway’s control. Document examples: e.g. “Bid #5 landed via RPC in 400ms and refunded its Jito tip
sanctum.so
”, versus a normal fail scenario.

Front-Running Mitigation: Optionally, bundle sensitive transactions (like “place bid” plus “lock NFT”) to ensure atomicity. Although Gateway alone isn’t a silver bullet for all MEV, sending through Jito bundles bypasses the public mempool entirely, which inherently thwarts simple frontrunning strategies
quicknode.com
github.com
. In the demo, we can mention that even under simulated bot traffic, Gateway ensured our auction transactions hit the block early.

Why SureBid Wins

SureBid directly leverages all of Sanctum Gateway’s unique capabilities to solve a real pain point. Auctions are mission-critical use cases: a single dropped bid or last-minute frontrun can ruin an entire sale. Gateway’s simultaneous multi-channel delivery and Jito tip refunds ensure bids land reliably without extra cost. Its real-time optimization means SureBid never overpays fees or gets bottlenecked. And the built-in observability lets our team prove to judges that “Yes, 99.9% of bids landed on time, saving us X% on fees”
github.com
sanctum.so
.

In short, SureBid would be infeasible to guarantee at this reliability level without Gateway. Building our own RPC pool, fee oracle, retry logic, and monitoring system from scratch would take months; Gateway provides it out-of-the-box
github.com
. The implementation plan above yields a polished auction prototype that demonstrates concrete savings and robustness – exactly what the Sanctum prize track is looking for. By integrating Gateway into SureBid, we maximize transaction inclusion and user trust, validating the edge that Gateway gives Solana apps.

Sources: Sanctum Gateway documentation and announcements
sanctum.so
github.com
; SubFlow marketplace example with Gateway
github.com
; Jito Bundles guide
quicknode.com

build a production-feel Next.js frontend that lets users create/list auctions, place bids (via their wallet), and — most importantly for the hackathon — demonstrates Gateway integration: buildGatewayTransaction, getTipInstructions (optional), and sendTransaction. Also include an Admin Dashboard to change routing weights live, a Live Transaction Feed, and a Metrics panel (refunds, success rate, latency) so judges can see measurable wins.

Tech stack (recommended)

Framework: Next.js (React + SSR/ISR where useful)

Language: TypeScript

Styling: Tailwind CSS

Component primitives/UI: shadcn/ui + Headless UI (accessible primitives)

State: Zustand for local global state (small/simple) OR Redux Toolkit if you prefer more structure

Server state / networking: React Query (TanStack Query) or SWR (I prefer React Query)

Wallets / Solana: @solana/wallet-adapter-react, @solana/wallet-adapter-* wallets (Phantom, Solflare, Slope)

Solana utilities: @solana/kit (if available) or @solana/web3.js + Borsh/utilities for encoding/decoding

Charts: recharts (per guidelines) for metrics graphs

Icons: lucide-react

Animations: framer-motion (micro-interactions)

Table/grid: TanStack Table (optional)

Form handling: react-hook-form

Testing: Playwright (E2E) + Vitest (unit)

CI/CD: GitHub Actions, deploy to Vercel or Render

Optional: Sentry for error monitoring, Prometheus/Grafana for server metrics

Project layout (recommended)
/frontend
  /components
    AuctionCard.tsx
    AuctionDetail.tsx
    PlaceBidModal.tsx
    WalletConnect.tsx
    LiveTxFeed.tsx
    AdminRoutingSlider.tsx
    TipTuner.tsx
    MetricsPanel.tsx
  /hooks
    useGateway.ts
    useAuctions.ts
    useWalletSigner.ts
  /lib
    gateway.ts
    solana.ts
    api.ts
  /pages
    index.tsx
    /auction/[id].tsx
    /admin/dashboard.tsx
  /styles
    globals.css
  /scripts
    load-test.ts
  /utils
    encoding.ts
    format.ts
  next.config.js
  tailwind.config.js
  package.json

Key UI pieces & responsibilities

Top-level layout / Nav

Connect wallet control (wallet adapter)

Link to Admin Dashboard (authenticated by wallet address)

Auction List / AuctionCard

Show active auctions, current highest bid, time remaining

CTA: View / Place Bid

Auction Detail

NFT preview, metadata, bid history, current highest bid

Place Bid button → opens PlaceBidModal

PlaceBidModal

UX: show estimated cost (SOL), CU & tip presets (low/med/high)

Flow: build unsigned tx → call buildGatewayTransaction → decode result → wallet signs → call sendTransaction → show live status

Show “which delivery method landed?” after confirmation (RPC vs Jito vs Sanctum Sender) if Gateway returns that metadata (or manage via dashboard events/on-chain confirmation + Gateway observability).

LiveTxFeed

Show each transaction as a card: timestamp, tx signature, status (pending → confirmed → failed), route delivered (RPC/Jito), refunded tip amount (if any)

Real-time updates via polling or WebSocket (poll recommended if Gateway doesn’t provide WS)

AdminRoutingSlider

Sliders for weights: RPC / Jito / Sanctum Sender / Helius etc.

UI calls Gateway Admin endpoints or changes project routing settings (if you have API access) — OR shows instructions to change via Gateway Dashboard and reads back current config.

TipTuner

Presets to toggle cuPriceRange and jitoTipRange per action (bid vs finalize)

Buttons: Conservative / Balanced / Aggressive

MetricsPanel

Recharts graphs: success rate, avg confirmation time, jito refunds over time, average cost per tx

Show current numbers used in tweet

Replay / Forensics

View failed transactions and attempt resubmission with different routing parameters via buildGatewayTransaction again

Integration details — Gateway & transaction flow

Implement the transaction flow inside a reusable hook (useGateway) and utility (lib/gateway.ts). The flow:

Build unsigned transaction using @solana/kit or TransactionMessage utilities; do NOT set a real blockhash — Gateway will set it.

Call buildGatewayTransaction (POST to https://tpg.sanctum.so/v1/{network}?apiKey=...) with params:

skipSimulation: false (so Gateway simulates and returns CU estimate)

cuPriceRange: "low" | "medium" | "high" (from TipTuner)

jitoTipRange: "low" | "medium" | "high" | "max"

deliveryMethodType: optional override for finalization

Gateway returns encoded transaction (base64) and latestBlockhash and tip instructions. Decode into a Transaction object, sign with wallet.

Call sendTransaction with the signed base64 transaction. Gateway returns immedate response with a status or signature. Poll on-chain for confirmation or use Gateway observability for final route metadata.

Update UI: show pending, confirmed, show refund amount if RPC-landed and Jito tip refunded (if Gateway returns that info) — else calculate refund from logs if given.

For admin replays, call buildGatewayTransaction again and sendTransaction with modified params.

Utility example (lib/gateway.ts)
// lib/gateway.ts
const GATEWAY_ENDPOINT = (network: 'mainnet'|'devnet') =>
  `https://tpg.sanctum.so/v1/${network}?apiKey=${process.env.NEXT_PUBLIC_GATEWAY_API_KEY}`;

export async function buildGatewayTransaction(unsignedBase64Tx: string, opts = {}, network='devnet') {
  const res = await fetch(GATEWAY_ENDPOINT(network), {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id: 'surebid',
      jsonrpc: '2.0',
      method: 'buildGatewayTransaction',
      params: [unsignedBase64Tx, opts],
    }),
  });
  if (!res.ok) throw new Error('buildGatewayTransaction failed');
  return (await res.json()).result;
}

export async function sendGatewayTransaction(signedBase64Tx: string, network='devnet') {
  const res = await fetch(GATEWAY_ENDPOINT(network), {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id: 'surebid',
      jsonrpc: '2.0',
      method: 'sendTransaction',
      params: [signedBase64Tx],
    }),
  });
  if (!res.ok) throw new Error('sendTransaction failed');
  return res.json();
}

Hook example (hooks/useGateway.ts)

Exposes prepareAndSendTransaction(unsignedTxMessage, opts) that:

Calls buildGatewayTransaction

Decodes result to transaction message

Sends to wallet for signing

Calls sendGatewayTransaction

Returns immediate response + helper to poll on-chain

UX patterns & copy

Use clear states: “Fetching tip instructions…”, “Ready to sign”, “Broadcasting via Gateway”, “Confirmed via RPC — Jito tip refunded”.

Show small informative tooltips explaining Gateway behavior (e.g. “If RPC lands first we refund Jito tip — saves cost”).

For admin: make routing changes destructive only behind a confirmation modal with wallet sign for auditability.

Observability wiring

On every sendTransaction call store: { txSignature, timeSent, deliveryOptions, chosenCU, jitoTipRange, response } in local DB (or Supabase).

Poll on-chain via RPC getSignatureStatus to get final confirmation and ledger confirmation time; reconcile with Gateway response to derive route (if Gateway returns route metadata, use it).

Show metrics by aggregating this DB: success rate, avg latency, refunds.

For demo, add toggles:

"Show gateway dashboard" embed link

"Simulate node failure" — script that reroutes traffic to specific RPCs (if you control RPCs) or just showed simulated failing path in UI.

Security & Admin auth

Admin pages gated by wallet address whitelist (on server check: compare connected wallet to allowed admin address).

For admin server-side sensitive calls (if Gateway requires server secret), handle on backend only (never expose private keys).

Rate limit user actions: disallow spamming bids (server/redis lock), and guard against front-end replay.

Accessibility & Mobile

Design responsive with Tailwind; prioritize large tap targets for mobile bidding.

Use accessible labels for all buttons & forms; rely on shadcn/ui + Headless UI for modals, popovers.

Testing plan (quick)

Unit test lib/gateway functions with mocked fetch.

E2E using Playwright: simulate wallet connect (use test wallets), place bids, verify flow uses buildGatewayTransaction and sendTransaction (mock gateway or use devnet).

Load test script: scripts/load-test.ts launches multiple wallet instances to place bids concurrently (use local keys).