import jwktopem from 'jwk-to-pem';
import { getPublicKeys as svcGetPublicKeys } from '../services/userLoginService';

/**
 * Singleton pattern used to cache the authorization server's public keys
 */
export class AuthPublicKey {
  static instance: AuthPublicKey;
  private static publicKey: string;

  private constructor () {
    console.log('AuthPublicKey constructor called!');
  }

  public static getInstance (): AuthPublicKey {
    if (!AuthPublicKey.instance) {
      AuthPublicKey.instance = new AuthPublicKey();
    }
    return AuthPublicKey.instance;
  }

  public async getPublicKey ():Promise<string> {
    if (!AuthPublicKey.publicKey) {
      const publicKeys = await svcGetPublicKeys();
      const jwk = publicKeys.keys[0];
      const publicKey = jwktopem(jwk);
      AuthPublicKey.publicKey = publicKey;
      return AuthPublicKey.publicKey;
    }
    return AuthPublicKey.publicKey;
  }
};
