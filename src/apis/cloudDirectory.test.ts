import { cloudDirectorySignUp } from './cloudDirectory';
import fetch from 'cross-fetch';

jest.mock('cross-fetch');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('test AppId CloudDirectorySignUp', () => {
  const user = {
    active: true,
    emails: [
      {
        value: 'foo@bar.com',
        primary: true,
      },
    ],
    userName: 'foo',
    password: 'bar',
    name: {
      familyName: 'Smith',
      givenName: 'John',
    },
  };

  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  it('should add bearer token and post request', async () => {
    // mock the fetch call to get the bearer token
    mockFetch.mockResolvedValue(
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => 'abc123',
      } as Response)
    );

    // mock the fetch call to create the user
    mockFetch.mockResolvedValue(
      Promise.resolve({
        ok: true,
        status: 201,
        json: async () => JSON.stringify(user),
      } as Response)
    );

    // invoke the method
    const returnedUser = await cloudDirectorySignUp(user);

    // validate the response
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(returnedUser).toBe(JSON.stringify(user));
  });
});
