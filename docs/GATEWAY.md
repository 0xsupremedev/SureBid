Sanctum Gateway Integration

- `frontend/lib/gateway.ts` uses JSON-RPC over `NEXT_PUBLIC_GATEWAY_ENDPOINT` with `NEXT_PUBLIC_GATEWAY_API_KEY`.
- Use in components via `hooks/useGateway.ts`.

Request examples (JSON-RPC):

Build
```
POST ${NEXT_PUBLIC_GATEWAY_ENDPOINT}?apiKey=... 
{
  "id": "surebid",
  "jsonrpc": "2.0",
  "method": "buildGatewayTransaction",
  "params": ["<unsignedBase64>", { "cuPriceRange": "medium", "jitoTipRange": "low" }]
}
```

Send
```
POST ${NEXT_PUBLIC_GATEWAY_ENDPOINT}?apiKey=...
{
  "id": "surebid",
  "jsonrpc": "2.0",
  "method": "sendTransaction",
  "params": ["<signedBase64>", { "deliveryMethodType": "balanced" }]
}
```

