interface Email {
  value: string;
  primary: boolean;
}

interface Identity {
  'provider': string;
  'id': string;
  'idpUserInfo': {
    'displayName': string;
    'active': boolean
    'userName': string;
    'mfaContext': {};
    'emails': Array<Email>;
    'meta': {
      'lastLogin': string;
      'created': string;
      'location': string;
      'lastModified': string;
      'resourceType': string;
    },
    'schemas': Array<string>;
    'name': {
      'familyName': string;
      'givenName': string;
      'formatted': string;
    },
    'id': string;
    'status': string;
    'idpType': string;
  }
}

export interface UserProfile {
  'id': string;
  'name': string;
  'email': string;
  'preferred_username': string;
  'given_name': string;
  'family_name': string;
  'identities': Array<Identity>;
  'attributes': {};
}
