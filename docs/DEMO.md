SureBid – Demo Script

Demo 1 — Baseline vs Gateway
1) Set routing to RPC-only (or run Mode A): Admin → set RPC 100%.
2) Run load (Mode A): 200 tx/min for ~2 min. Observe LiveTxFeed + Metrics.
3) Switch to Gateway routing (e.g., RPC 60 / Jito 40) or run Mode B.
4) Run load (Mode B) identically; compare failed rate, median confirmation, refunds.

Demo 2 — Finalization Guarantee
1) Finalize auction with jitoTipRange: high, show near-instant confirmation.
2) Repeat with RPC-only to contrast.

Demo 3 — Live tuning
1) Move AdminRoutingSlider from balanced → jito-heavy while sending.
2) Show improved confirmations and lower failures in feed/metrics.

Commands
- Frontend: npm run dev -w frontend
- Backend: node backend/src/index.js
- Load (placeholder): node scripts/load-test.js (ts-node or build first)

Artifacts
- Capture GIFs of each demo and place under demo-assets/.

