import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildGatewayTransaction, sendTransaction } from '../lib/gateway';

describe('gateway client', () => {
  const endpoint = 'https://tpg.sanctum.so/v1/devnet?apiKey=KEY';
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url: any, init: any) => {
      expect(String(url)).toContain('https://');
      const body = JSON.parse(init.body);
      if (body.method === 'buildGatewayTransaction') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 'surebid', result: { encodedTransactionBase64: 'AA==' } }), { status: 200 });
      }
      if (body.method === 'sendTransaction') {
        return new Response(JSON.stringify({ jsonrpc: '2.0', id: 'surebid', result: { signature: 'SIG' } }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: { message: 'bad method' } }), { status: 400 });
    }) as any);
    (globalThis as any).process = { env: { NEXT_PUBLIC_GATEWAY_ENDPOINT: 'https://tpg.sanctum.so/v1/devnet', NEXT_PUBLIC_GATEWAY_API_KEY: 'KEY' } } as any;
  });

  it('builds a transaction', async () => {
    const res: any = await buildGatewayTransaction('AA==', { cuPriceRange: 'low' });
    expect(res.encodedTransactionBase64).toBeDefined();
  });

  it('sends a transaction', async () => {
    const res: any = await sendTransaction('AA==', { deliveryMethodType: 'balanced' });
    expect(res.signature).toBe('SIG');
  });
});

