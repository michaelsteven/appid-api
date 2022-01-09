/**
 * Singleton pattern used to cache the authorization server's public keys
 */
export class AuthPublicKey {
  static instance: AuthPublicKey;

  private constructor () {
    console.log('AuthPublicKey constructor called!');
  }

  public static getInstance (): AuthPublicKey {
    if (!AuthPublicKey.instance) {
      AuthPublicKey.instance = new AuthPublicKey();
    }
    return AuthPublicKey.instance;
  }

  public getKeys () {
    console.log('my logic!');
  }
};
