type Options = { bidders: number; bidsPerBidder: number; mode: 'rpc' | 'gateway'; csvPath?: string };

export async function runLoadTest(opts: Options = { bidders: 5, bidsPerBidder: 3, mode: 'gateway' }) {
  const tasks: Promise<{ id: number; bid: number; ms: number; status: 'ok' | 'fail' }>[] = [];
  for (let i = 0; i < opts.bidders; i++) {
    tasks.push(simulateBidder(i, opts.bidsPerBidder, opts.mode));
  }
  const results = await Promise.allSettled(tasks);
  const flat = results
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean) as { id: number; bid: number; ms: number; status: 'ok' | 'fail' }[];
  if (opts.csvPath) {
    const header = 'bidder,bid_idx,latency_ms,status,mode\n';
    const rows = flat.map((r) => `${r.id},${r.bid},${r.ms},${r.status},${opts.mode}`).join('\n');
    // eslint-disable-next-line no-console
    console.log(header + rows);
  }
}

async function simulateBidder(id: number, bids: number, mode: 'rpc' | 'gateway') {
  for (let i = 0; i < bids; i++) {
    const start = Date.now();
    // Placeholder: plug in real send flows
    await new Promise((r) => setTimeout(r, 100 + Math.random() * 400));
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ id, bid: i, ms, mode }));
  }
}

