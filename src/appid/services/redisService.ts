import { createClient } from 'redis';
import { REDIS_URL } from '../../helpers/env';

const client = createClient({ url: REDIS_URL });
(async () => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
})();

export const set = async (key: string, value: string, timeout: number): Promise<void> => {
  await client.set(key, value, { EX: timeout });
};

export const get = (key: string): Promise<string|null> => {
  return client.get(key);
};

export const remove = async (key: string): Promise<void> => {
  await client.del(key);
};
