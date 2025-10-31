Sanctum is running a  hackathon teams that successfully integrate Gateway into their projects during the Solana Cypherpunk Hackathon.


What is Gateway?

Gateway allows developers to take complete control of their transactions on Solana. From optimizing the transactions based on the current network health to ensuring the transaction has the best chances of landing. With Gateway, developers gain real-time control, observability, and optimization over how their transactions are delivered on Solana.

Key features:
> Save money on Jito bundles. You can send transactions through RPCs and Jito Bundles at the same time. If they land through RPC, we refund the Jito Tip, so you can get the best of both worlds (better delivery + save cost). Jupiter saves hundreds of thousands of $$ a year with this service.
> Save developer time. We have a robust observability suite where you can see every transaction in real time and change parameters without any code redeployment. This means less developer time trying to track down delivery errors and fix them quicker.
> Send transactions with no RPCs required. For teams that don’t want to faff around with RPCs, we have Sanctum Sender, the simplest and cheapest way to send transactions on Solana — just plug in our API. We charge 0.0001 SOL per transaction, 10% that of Helius Sender, Nozomi, 0Slot etc.
> For bigger teams: We have a round robin functionality for transaction routing. Plug in all your RPCs and other delivery methods, specify the weights, and we will help you route your transactions to all of these in specified weights/probability. This is very useful for benchmarking and load balancing.


We’re looking for hackathon projects that meaningfully integrate Gateway and demonstrate real wins:

Integrate Gateway (calls to buildGatewayTransaction + sendTransaction)

Document and tweet how Gateway enabled something otherwise hard or impossible

Optionally, build additional tooling or UI around it



You said:
Sanctum is running a hackathon teams that successfully integrate Gateway into their projects during the Solana Cypherpunk Hackathon.


What is Gateway?

Gateway allows developers to take complete control of their transactions on Solana. From optimizing the transactions based on the current network health to ensuring the transaction has the best chances of landing. With Gateway, developers gain real-time control, observability, and optimization over how their transactions are delivered on Solana.

Key features:
> Save money on Jito bundles. You can send transactions through RPCs and Jito Bundles at the same time. If they land through RPC, we refund the Jito Tip, so you can get the best of both worlds (better delivery + save cost). Jupiter saves hundreds of thousands of $$ a year with this service.
> Save developer time. We have a robust observability suite where you can see every transaction in real time and change parameters without any code redeployment. This means less developer time trying to track down delivery errors and fix them quicker.
> Send transactions with no RPCs required. For teams that don’t want to faff around with RPCs, we have Sanctum Sender, the simplest and cheapest way to send transactions on Solana — just plug in our API. We charge 0.0001 SOL per transaction, 10% that of Helius Sender, Nozomi, 0Slot etc.
> For bigger teams: We have a round robin functionality for transaction routing. Plug in all your RPCs and other delivery methods, specify the weights, and we will help you route your transactions to all of these in specified weights/probability. This is very useful for benchmarking and load balancing.

What We Want from You (Prize Criteria):
We’re looking for hackathon projects that meaningfully integrate Gateway and demonstrate real wins:

Integrate Gateway (calls to buildGatewayTransaction + sendTransaction)

Document and tweet how Gateway enabled something otherwise hard or impossible

Optionally, build additional tooling or UI around it Skip to main content
Sanctum Gateway Docs home pagedark logo

Search...
Ctrl K
Support
Dashboard
Docs
Intro
Sanctum Gateway
Getting Started
Quickstart
Delivery Methods
Project Parameters
Gateway Endpoints
Concepts
Builder
Delivery
Observability
Optimization
Misc
Tip Accounts
Rate Limits
Press Kit

On this page
buildGatewayTransaction
getTipInstructions
Concepts
Builder
The Builder stage helps you to build your transactions to be sent via Gateway

This stage consists of the following JSON-RPC methods,
buildGatewayTransaction
getTipInstructions
This set of JSON-RPC methods allow users to abstract the complexity of building transactions according to the delivery method, such as Jito Bundles, Sanctum Sender etc, and allows users to update how their transaction traffic is routed in real-time, without any code changes or redeployments.
This stage is optional and users can manually handle building the transactions appropriately, to be sent via Gateway.
​
buildGatewayTransaction
This method acceps an existing transaction and returns an updated transaction that is ready to be sent to Gateway.
One can use the buildGatewayTransaction method to do the following:
Simulate the transaction for preflight checks, and get an estimate of the CUs consumed to set the CU limit accordingly.
Fetch the latest prioritization fees for the transaction, and set the CU price accordingly.
Add the tip instructions to route the trasaction to the desired delivery methods.
Set the appropriate latestBlockhash for the transaction, depending on whether you want the transaction to expire sooner than usual.

Copy

Ask AI
import {
  appendTransactionMessageInstructions,
  blockhash,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  getTransactionDecoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransaction,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

export const GATEWAY_ENDPOINT = https://tpg.sanctum.so/v1/mainnet?apiKey=${process.env.GATEWAY_API_KEY};

// Random source and destination used for example
const { alice, bob } = await getAccounts();

const transferIx = getTransferSolInstruction({
  source: alice,
  destination: bob,
  amount: 1000n,
});

const unsignedTransaction = pipe(
  createTransactionMessage({ version: 0 }),
  (txm) => appendTransactionMessageInstructions([transferIx], txm),
  (txm) => setTransactionMessageFeePayerSigner(alice, txm),
  // Since buildGatewayTransaction will set the blockhash for you,
  // We can avoid fetching the latest blockhash here
  (m) =>
    setTransactionMessageLifetimeUsingBlockhash(
      {
        blockhash: blockhash("11111111111111111111111111111111"),
        lastValidBlockHeight: 1000n,
      },
      m
    ),
  compileTransaction
);

const buildGatewayTransactionResponse = await fetch(GATEWAY_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "startup-village",
    jsonrpc: "2.0",
    method: "buildGatewayTransaction",
    params: [
      getBase64EncodedWireTransaction(unsignedTransaction),
      {
        // encoding: "base64" | "base58", default is "base64"
        // skipSimulation: boolean, if true, you need to set the CU limit yourself since simulation allows to find out cu consumed.
        // skipPriorityFee: boolean, if true, you need to set the CU price yourself. Use Triton Priority Fee API
        // cuPriceRange: "low" | "medium" | "high", defaults to project parameters
        // jitoTipRange: "low" | "medium" | "high" | "max", defaults to project parameters
        // expireInSlots: number, defaults to project parameters
        // deliveryMethodType: "rpc" | "jito" | "sanctum-sender" | "helius-sender", defaults to project parameters
      },
    ],
  }),
});

if (!buildGatewayTransactionResponse.ok) {
  throw new Error("Failed to build gateway transaction");
}

const {
  result: { transaction: encodedTransaction },
} = (await buildGatewayTransactionResponse.json()) as {
  result: {
    transaction: string;
    latestBlockhash: {
      blockhash: string;
      lastValidBlockHeight: string;
    };
  };
};

const transaction = getTransactionDecoder()
  .decode(getBase64Encoder().encode(encodedTransaction));

const signedTransaction = await signTransaction([alice.keyPair], transaction);

const sendTransactionResponse = await fetch(GATEWAY_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "startup-village",
    jsonrpc: "2.0",
    method: "sendTransaction",
    params: [getBase64EncodedWireTransaction(signedTransaction)],
  }),
});

if (!sendTransactionResponse.ok) {
  throw new Error("Failed to send transaction");
}

const data = await sendTransactionResponse.json();

console.log(data);
​
getTipInstructions
This method returns the tip instructions that need to be added to your transaction depending on what delivery method this transaction needs to be sent to.
One can either explicitly specify the delivery method for which to return the tip instructions for, or Gateway will use a weighted sampling algorithm to pick one depending on the Transaction Routing parameter configured on the Dashboard.

Copy

Ask AI
import {
  appendTransactionMessageInstructions,
  compileTransaction,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  type IInstruction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransaction,
} from "@solana/kit";
import {
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction,
} from "@solana-program/compute-budget";
import { getTransferSolInstruction } from "@solana-program/system";
import { getAccounts, getTritonPrioritizationFees } from "./utils.js";

export const GATEWAY_ENDPOINT = https://tpg.sanctum.so/v1/mainnet?apiKey=${process.env.GATEWAY_API_KEY};

// Random source and destination used for example
const { alice, bob } = await getAccounts();

const rpc = createSolanaRpc(process.env.RPC_URL as string);

const transferIx = getTransferSolInstruction({
  source: alice,
  destination: bob,
  amount: 1000n,
});

// Fetch latest blockhash, CU price and getTipInstructions response
const [{ value: latestBlockhash }, cuPrice, getTipInstructionsResponse] =
  await Promise.all([
    rpc.getLatestBlockhash().send(),
    getTritonPrioritizationFees([alice.address, bob]),
    fetch(GATEWAY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "demo",
        jsonrpc: "2.0",
        method: "getTipInstructions",
        params: [
          {
            feePayer: alice.address,
            // jitoTipRange: "low" | "medium" | "high" | "max", defaults to project parameters
            // deliveryMethodType: "rpc" | "jito" | "sanctum-sender" | "helius-sender", defaults to project parameters
          },
        ],
      }),
    }),
  ]);

if (!getTipInstructionsResponse.ok) {
  throw new Error("Failed to get tip instructions");
}

// Parse tip instructions response and convert to Instruction[]
const tipIxs: IInstruction[] = [];
const tipIxsData = await getTipInstructionsResponse.json();
for (const ix of tipIxsData.result) {
  tipIxs.push({
    ...ix,
    data: new Uint8Array(Object.values(ix.data)),
  });
}

// Hardcode CU limit, but you can also simulate the transaction to get the exact CU limit
const cuLimitIx = getSetComputeUnitLimitInstruction({
  units: 800,
});

const cuPriceIx = getSetComputeUnitPriceInstruction({
  microLamports: cuPrice,
});

const transaction = pipe(
  createTransactionMessage({ version: 0 }),
  (txm) =>
    appendTransactionMessageInstructions(
      [cuLimitIx, cuPriceIx, transferIx, ...tipIxs],
      txm
    ),
  (txm) => setTransactionMessageFeePayerSigner(alice, txm),
  (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
  compileTransaction
);

const signedTransaction = await signTransaction([alice.keyPair], transaction);

const sendTransactionResponse = await fetch(GATEWAY_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "demo",
    jsonrpc: "2.0",
    method: "sendTransaction",
    params: [getBase64EncodedWireTransaction(signedTransaction)],
  }),
});

if (!sendTransactionResponse.ok) {
  throw new Error("Failed to send transaction");
}

const data = await sendTransactionResponse.json();

console.log(data);
Gateway Endpoints
Delivery
Ask a question...

x
github
Powered by Mintlify
Builder - Sanctum Gateway Docs what can i build to win this hackathon 2025 tell me 1 best top idea to build in detail all tech stack everything write all
ChatGPT said:

Thought for 14s
Nice — here’s one focused, high-impact hackathon project that tightly maps to the Sanctum Gateway prize criteria and that clearly demonstrates a capability that would be hard or impossible without Gateway.

Project: Fail-Safe Auction House — “SureBid”
A Solana NFT auction / orderbook system that guarantees bid settlement and finalizes auctions without failed transactions, front-running, or costly retry plumbing. Uses Gateway for best-effort delivery (RPC + Jito bundles), tip refunds, real-time routing control, and live observability so you can demonstrate concrete savings and reliability wins to judges.

Why this wins

Auctions are extremely latency-sensitive and economically critical — failed bids or front-runs destroy UX and trust.

Gateway’s simultaneous RPC + Jito + Sanctum Sender routing + refunds lets you ensure bids and settlement transactions land with minimal cost and near-zero failure rate — something hard to guarantee otherwise.

Observability lets you show live transaction delivery state and dynamically tweak routing/fees in the demo (no redeploys) — exactly what the hackathon prize asks you to show & tweet.

Core functionality (what you’ll demo)
Live auctions for NFTs with on-chain finalization.

Bid placement from UI → signs tx client-side → passes through buildGatewayTransaction → sendTransaction to Gateway.

Guaranteed finalization: settlement tx uses Gateway routing (RPC + Jito) and CU prioritization; if one path fails, another lands — refunds Jito tip if RPC succeeded.

Admin dashboard (no redeploys) showing live transactions, routing weights, and ability to change delivery strategy on the fly to prove observability/optimization benefits.

Metrics shown live: failed_tx_rate, avg_cost_per_tx, percent_jito_refunds, median_settlement_time — before vs after Gateway.

Tech stack (complete)
Blockchain & smart contracts

Solana — on-chain settlement

Anchor v0.x — write auction program (Rust)

Auction program features: create_auction, place_bid (escrow lamports), finalize_auction, cancel_bid

SPL token support for tokenized payouts (if needed)

Backend / relayer / services

Node.js / TypeScript backend (serverless on Vercel or Render)

PostgreSQL (Supabase) — persistent auction metadata, user profiles

Redis — ephemeral locking / rate limiting

optional: indexer using The Graph / custom RPC for reconciliations

Frontend

Next.js (React) + TypeScript

TailwindCSS + Headless UI; components show live TX feed

Wallet adapters: Phantom / Solflare / Slope via @solana/wallet-adapter

Gateway integration

Sanctum Gateway endpoints (buildGatewayTransaction + sendTransaction + getTipInstructions)

Use @solana/kit (or solana/web3.js + your encoder/decoder) to create & sign transactions

Optional: Jito bundle usage is abstracted by Gateway (you still add tip instructions returned by Gateway)

Observability & monitoring

Use Gateway’s observability dashboard + in-app live feed via WebSocket or poll (Gateway may provide web UI; embed / link)

Prometheus metrics (server) + Grafana or simple chart UI

Sentry for errors

Dev/CI

GitHub Actions, Docker for dev containers

Testnet: Solana devnet / test validator / maybe localnet for unit tests

Architecture & sequence (detailed)
User clicks Place Bid in UI.

Frontend builds unsigned transaction (Anchor ix to place_bid, fee payer = user).

Call buildGatewayTransaction with the unsigned tx and options:

let Gateway simulate to get CU estimate (unless you precompute)

request cuPriceRange: "medium" and jitoTipRange: "low" (start conservative)

Gateway returns: encoded updated transaction, latestBlockhash, and tip instructions to append.

Frontend decodes, signs locally with the user wallet.

Call sendTransaction to Gateway with the signed tx (base64). Gateway attempts delivery across configured route(s). If RPC succeeds, Jito tip gets refunded (per their refund rule).

Gateway returns immediate receipt: tx signature or delivery status; follow up via observability (and on-chain confirmation).

On finalize auction, settlement tx is built via buildGatewayTransaction with higher jitoTipRange or deliveryMethodType: "jito" to maximize finalization success.

Admin UI: uses Gateway to update project routing params in real time (no redeploy) and shows live stream of transaction states.

Sequence diagram (short):

UI → buildGatewayTransaction → Gateway → returns encoded tx + tip instructions

UI → sign → sendTransaction → Gateway → attempts deliver (RPC + Jito) → returns delivery result

Backend listens and updates DB; UI shows final on-chain confirmation.

Concrete code snippets (TS) — minimal, copy-pasteable
Use the pattern you pasted; here's a compact version you can use in the frontend to place a bid (assumes @solana/kit or solana/web3.js utility wrappers):

// frontend/src/gateway.ts
const GATEWAY_ENDPOINT = `https://tpg.sanctum.so/v1/mainnet?apiKey=${process.env.NEXT_PUBLIC_GATEWAY_API_KEY}`;

async function buildTx(unsignedBase64Tx, options = {}) {
  const res = await fetch(GATEWAY_ENDPOINT, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      id: "surebid",
      jsonrpc: "2.0",
      method: "buildGatewayTransaction",
      params: [unsignedBase64Tx, options],
    }),
  });
  if (!res.ok) throw new Error("buildGatewayTransaction failed");
  const body = await res.json();
  return body.result; // { transaction: string (base64), latestBlockhash: {...} }
}

async function sendSignedTx(signedBase64Tx) {
  const res = await fetch(GATEWAY_ENDPOINT, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      id: "surebid",
      jsonrpc: "2.0",
      method: "sendTransaction",
      params: [signedBase64Tx],
    }),
  });
  if (!res.ok) throw new Error("sendTransaction failed");
  return res.json();
}
In your placeBid flow:

Build transaction message with the place_bid ix.

const built = await buildTx(getBase64EncodedWireTransaction(unsignedTx), { cuPriceRange: 'medium', jitoTipRange: 'low' });

decode and sign built.transaction → signedTx

await sendSignedTx(getBase64EncodedWireTransaction(signedTx))

(You’ll want to show this in the repo and the demo — it directly calls buildGatewayTransaction + sendTransaction as required.)

Admin Dashboard & Bonus UX (makes it demo-worthy)
Live Transactions feed: stream Gateway transaction states (use Gateway UI embedded or WebSocket if available; otherwise poll the sendTransaction response and on-chain confirmations).

Routing Control UI: sliders to adjust weights for RPC vs Jito vs Sanctum Sender. When you move a slider, Gateway changes routing without code changes — demo: flip to 100% Jito + high tip on finalization and show success.

Tip Tuner: a simple UI to change cuPriceRange and jitoTipRange with a/B testing toggle.

Replay & Forensics: show failed txs (if any) and let dashboard attempt re-send with different routing—Gateway should allow quick retry experiments.

Cost & Reliability dashboard: show “Savings vs baseline RPC only” and show number of refunded Jito tips (the hackathon wants to see hard wins).

Metrics to present to judges (how to prove Gateway enabled something otherwise impossible)
Collect baseline metrics (send same set of txs via RPC-only) vs Gateway routing for same txs:

Success rate (landing) = #confirmed / #attempted

Median confirmation time (ms)

Avg cost per tx (lamports or SOL, include refunded tips)

Jito refunds = number and sum refunded (shows cost savings)

Developer time saved — qualitative + show you changed routing in live demo with zero redeploy

Target demo claims you can defend:

Reduce failed_tx_rate to <1% for critical settlement txs (vs ~X% baseline).

Save Y% on tips via refund mechanism (show currency numbers — e.g., “we estimate $Z/month saved for N tx/day”).

Show live routing change and immediate effect on a small A/B test during demo.

(Collect these numbers during a 5–10 minute demo run on devnet with scripted traffic.)

Hackathon plan & milestones (48–72 hour sprint)
Day 1

Build Anchor auction contract + unit tests.

Basic Next.js UI for creating auctions & placing bids.

Integrate wallet sign flows.

Day 2

Integrate Gateway calls: implement buildGatewayTransaction + sendTransaction for place_bid and finalize flows.

Add admin dashboard controls for routing/weights; hook to Gateway project settings (or use Gateway endpoints to request tip instructions).

Instrument metrics + simple charts.

Day 3

Polish demo flows, write automated scripts to simulate bidders (so you can generate load during the demo).

Prepare 3 demo scenarios:

Baseline RPC-only delivery (show failures).

Gateway routing with conservative tips (show success + show refunded tips).

Switch to full Jito for finalization (show near-instant finalization).

Create tweet + docs.

What to tweet (prize asks you to document + tweet how Gateway enabled something otherwise hard)
Make a short, data-driven tweet thread (3–5 tweets). Example:

Tweet 1:

Built SureBid — a fail-safe NFT auction that guarantees settlement using @SanctumHQ Gateway at #SolanaCypherpunk 🚀. No more failed finalizations or costly retries.

Tweet 2 (show image of dashboard):

In live tests, Gateway routing (RPC + Jito) cut failed settlement attempts from 12% → 0.8% and refunded Jito tips when RPC landed — saving ~$X/month for our expected volume. #Solana #web3

Tweet 3 (show short GIF of toggling routing weights and instant effect):

Best part: changed routing weights in the dashboard live — no redeploys. Observability let us see every tx in real time. Integration used buildGatewayTransaction + sendTransaction. Docs + code: <repo-link>

Attach short 20–30s demo GIF showing: placing bid, dashboard live tx stream, toggling routing, finalization success.

Optional extra tooling (bonus for judges)
Auto-retry policies: automatic retry with different deliveryMethodType if first attempt fails (explain safe limits).

A/B cost optimizer: run live micro-experiments toggling tip ranges and compute unit ranges, ingest success/cost results and auto-suggest optimal settings for a given traffic profile.

Sanctum Sender fallback: for wallets that can’t sign or where you want to guarantee delivery without RPCs, show your optional server-side path using Sanctum Sender (0.0001 SOL per tx) for low-value micro-actions.

Demo checklist for judges (what to show on stage)
Create & list an auction.

Place multiple simultaneous bids (use scripted bidders).

Show baseline (RPC only) where at least one bid fails (replay).

Switch to Gateways routing (or enable in app) and place identical load — show near-zero failures.

Finalize auction with high priority delivery; show Jito tip refunded in one run where RPC landed.

Show routing slider change and immediate effect on live transactions.

Tweet thread posted (show tweet & link) and link to GitHub repo with code + how to reproduce.

Deliverables to include in your repo
smart-contracts/ — Anchor program + tests

frontend/ — Next.js UI + admin dashboard

scripts/ — load tester + demo runner (simulate N bidders)

docs/ — integration guide showing exactly where buildGatewayTransaction and sendTransaction are used

demo-assets/ — GIFs and short video clips for the submission page & tweet

README.md — one-click instructions for running devnet demo

Final pitch / one-liner for the judges
“SureBid: the first Solana auction house that guarantees on-chain finalization by using Sanctum Gateway’s multi-path delivery, live observability, and refundable Jito tips — giving users reliable auctions, and teams dramatically lower failed-tx costs without redeploys.”