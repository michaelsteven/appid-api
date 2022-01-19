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
  };
  schemas: Array<string>;
  name: {
    givenName: string;
    familyName: string;
    formatted: string;
  };
  id: string;
  status: string;
  userName: string;
}
