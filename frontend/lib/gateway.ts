const ENDPOINT = process.env.NEXT_PUBLIC_GATEWAY_ENDPOINT || 'https://tpg.sanctum.so/v1/devnet';

export async function buildGatewayTransaction(unsignedTxBase64: string, options: Record<string, unknown> = {}) {
  const apiKey = process.env.NEXT_PUBLIC_GATEWAY_API_KEY;
  const res = await fetch(`${ENDPOINT}?apiKey=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'surebid',
      jsonrpc: '2.0',
      method: 'buildGatewayTransaction',
      params: [unsignedTxBase64, options]
    })
  });
  if (!res.ok) throw new Error('Gateway build failed');
  const json = await res.json();
  if (json.error) throw new Error(json.error?.message || 'Gateway build error');
  return json.result || json;
}

export async function sendTransaction(signedTxBase64: string, options: Record<string, unknown> = {}) {
  const apiKey = process.env.NEXT_PUBLIC_GATEWAY_API_KEY;
  const res = await fetch(`${ENDPOINT}?apiKey=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'surebid',
      jsonrpc: '2.0',
      method: 'sendTransaction',
      params: [signedTxBase64, options]
    })
  });
  if (!res.ok) throw new Error('Gateway send failed');
  const json = await res.json();
  if (json.error) throw new Error(json.error?.message || 'Gateway send error');
  return json.result || json;
}

