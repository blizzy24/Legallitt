import { ApiError } from '@legalitt/shared';
import { instructedCopy } from '../copy/instructed';

/** Only diagnose the explicitly selected loopback proxy, never S3 uploads or
 * direct API requests. An upstream failure is a 502 response from the proxy. */
export function withLocalProxyErrors(baseUrl: string, transport: typeof fetch = fetch): typeof fetch {
  const origin = new URL(baseUrl).origin;
  return async (input, init) => {
    try { return await transport(input, init); }
    catch (error) {
      const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
      if (url.origin === origin && url.pathname.startsWith('/api/v1/') && !init?.signal?.aborted)
        throw new ApiError(instructedCopy.localProxyUnavailable, 0, 'offline');
      throw error;
    }
  };
}
