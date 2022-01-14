/* eslint-disable camelcase */
interface Identity {
  provider: string;
  id: string;
}

export interface IdentityToken {
  iss?: string;
  aud?: Array<string>;
  exp: number;
  tenant?: string;
  iat: number;
  email: string;
  name: string;
  sub?: string;
  email_verified: boolean;
  preferred_username: string;
  given_name: string;
  family_name: string;
  identities?: Array<Identity>;
  amr?: Array<string>;
}
