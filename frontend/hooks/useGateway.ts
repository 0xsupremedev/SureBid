import { useCallback } from 'react';
import { buildGatewayTransaction, sendTransaction } from '../lib/gateway';

export function useGateway() {
  const build = useCallback(buildGatewayTransaction, []);
  const send = useCallback(sendTransaction, []);
  return { build, send };
}

