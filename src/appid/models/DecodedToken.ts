export interface DecodedToken {
  iss: string;
  exp: number;
  aud: Array<string>;
  sub: string;
  // eslint-disable-next-line camelcase
  email_verified: boolean;
  amr: Array<string>;
  iat: number;
  tenant: string;
  scope: string;
};
