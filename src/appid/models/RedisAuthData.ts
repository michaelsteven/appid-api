import { AuthToken } from './AuthToken';

export interface RedisAuthData {
  clientIp: string;
  authToken: AuthToken;
}
