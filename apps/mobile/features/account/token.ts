import {storedTokens} from '../../lib/auth';
/** Cognito account calls need the signed-in access token (D-21, D-24). */
export async function accessToken() {
  const tokens = await storedTokens();
  if (!tokens?.accessToken) throw new Error('Your session has ended. Sign in again to continue.');
  return tokens.accessToken;
}
