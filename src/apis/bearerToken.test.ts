import { setBearerToken } from './bearerToken';
import fetch from 'cross-fetch';

jest.mock('cross-fetch');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('test AppId SetBearerToken', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  it('should add bearer token to request', async () => {
    mockFetch.mockResolvedValue(
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => 'abc123',
      } as Response)
    );
    const bearerToken = await setBearerToken();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(bearerToken).toBe('abc123');
  });
});
