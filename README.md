SureBid
=======

Overview
--------

SureBid is a Solana transaction routing project that integrates a Sanctum Gateway to build and send transactions via JSON‑RPC with tunable compute unit (CU) price and Jito tipping strategies. It enables switching between direct RPC and gateway‑assisted routing and demonstrates trade‑offs in confirmation latency, failure rates, and refund behavior under load.

Key Features
------------

- Gateway client in `frontend/lib/gateway.ts` using JSON‑RPC over `NEXT_PUBLIC_GATEWAY_ENDPOINT` with `NEXT_PUBLIC_GATEWAY_API_KEY`
- React hook integration via `hooks/useGateway.ts`
- Routing modes: RPC‑only vs. Gateway (with adjustable splits, e.g., RPC 60 / Jito 40)
- Live demo flows to compare confirmation performance and failure rates
- Admin controls for live tuning (e.g., balanced → Jito‑heavy)

Gateway JSON‑RPC Examples
-------------------------

Build request:

```
POST ${NEXT_PUBLIC_GATEWAY_ENDPOINT}?apiKey=...
{
  "id": "surebid",
  "jsonrpc": "2.0",
  "method": "buildGatewayTransaction",
  "params": [
    "<unsignedBase64>",
    { "cuPriceRange": "medium", "jitoTipRange": "low" }
  ]
}
```

Send request:

```
POST ${NEXT_PUBLIC_GATEWAY_ENDPOINT}?apiKey=...
{
  "id": "surebid",
  "jsonrpc": "2.0",
  "method": "sendTransaction",
  "params": [
    "<signedBase64>",
    { "deliveryMethodType": "balanced" }
  ]
}
```

Quick Start
-----------

Prerequisites:

- Node.js 18+
- pnpm or npm
- Solana RPC endpoint (if applicable)
- Sanctum Gateway endpoint and API key

Environment:

- `NEXT_PUBLIC_GATEWAY_ENDPOINT` — Gateway base URL
- `NEXT_PUBLIC_GATEWAY_API_KEY` — Gateway API key

Scripts (example):

- Frontend: `npm run dev -w frontend`
- Backend: `node backend/src/index.js`
- Load tool (placeholder): `node scripts/load-test.js` (use ts-node or build first)

Demo Scenarios
--------------

1. Baseline vs Gateway
   - Mode A: RPC‑only at ~200 tx/min for ~2 minutes; observe LiveTxFeed and Metrics
   - Mode B: Gateway routing (e.g., RPC 60 / Jito 40) with identical load; compare failures, median confirmation, refunds
2. Finalization Guarantee
   - Use `jitoTipRange: high` to illustrate near‑instant confirmations vs. RPC‑only
3. Live Tuning
   - Adjust AdminRoutingSlider from balanced → Jito‑heavy while sending and observe improvements

Repository Structure (indicative)
---------------------------------

- `frontend/lib/gateway.ts` — Gateway client
- `frontend/hooks/useGateway.ts` — React hook integration
- `backend/` — API/back‑end (if present)
- `scripts/` — Load testing and utilities
- `docs/` — Additional documentation and demo assets

Contributing
------------

Issues and PRs are welcome. Please open an issue first for significant changes.

Architecture
------------

See the detailed Mermaid diagram at `docs/architecture.mmd`.

GitHub renders Mermaid directly; you can also preview in Markdown by embedding the file contents in a ```mermaid block.

License
-------

MIT

SureBid Monorepo

Packages:
- frontend/ – Next.js app with wallet adapter and Gateway integration
- smart-contracts/ – Anchor program for auctions
- backend/ – Optional minimal server (metrics endpoint)

Environment variables (frontend):
- NEXT_PUBLIC_SOLANA_RPC_URL
- NEXT_PUBLIC_GATEWAY_ENDPOINT (e.g., https://tpg.sanctum.so/v1/devnet)
- NEXT_PUBLIC_GATEWAY_API_KEY

Dev:
1) npm install
2) npm run dev -w frontend

Docs:
- docs/GATEWAY.md

