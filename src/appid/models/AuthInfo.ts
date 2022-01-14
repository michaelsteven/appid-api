import { IdentityToken } from './IdentityToken';

export interface AuthInfo {
  idToken?: IdentityToken;
  scope?: string;
}
