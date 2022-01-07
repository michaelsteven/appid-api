interface Email {
  value: string;
  primary: boolean;
}

export interface CloudDirectoryUser {
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
