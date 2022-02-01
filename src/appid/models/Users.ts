import { UserProfile } from '.';

interface RequestOptions {
  count?: number;
}

export interface Users {
  totalResults: number;
  itemsPerPage: number;
  requestOptions: RequestOptions;
  users: Array<UserProfile>;
}
