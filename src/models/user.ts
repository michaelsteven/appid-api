interface Email {
  value: string;
  primary: boolean;
}

export interface User {
  active: boolean;
  emails: Array<Email>;
  userName: string;
  password: string;
  name: {
    familyName: string;
    givenName: string;
  };
}
