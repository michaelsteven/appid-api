export interface JWK {
    kty: any;
    use: string;
    n: string;
    e: string;
    kid: string;
}

export interface PublicKeys {
    keys: Array<JWK>;
};
