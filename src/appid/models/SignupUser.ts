interface Email {
  value: string;
  primary: boolean;
}

export interface SignupUser {
  active: boolean;
  emails: Array<Email>;
  userName: string;
  password: string;
  name: {
    familyName: string;
    givenName: string;
  };
}
