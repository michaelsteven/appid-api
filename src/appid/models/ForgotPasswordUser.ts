interface Email {
  value: string;
  primary: boolean;
}

export interface ForgotPasswordUser {
  displayName: string;
  active: boolean;
  emails: Array<Email>;
  meta: {
    created: Date;
    lastModified: Date;
    resourceType: string;
  }
  schemas: [String];
  name: {
    givenName: string;
    familyName: string;
    formatted: string;
  }
  id: string;
}
