import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {completeTests} from '../../endpoints/testUtils/helpers/testFns.js';
import {initTests} from '../../endpoints/testUtils/testUtils.js';
import {ServerError} from '../../utils/errors.js';
import {kUtilsInjectables} from '../injection/injectables.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('SessionContext', () => {
  test.each([true, false])(
    'encodeToken, shouldRefresh=%s',
    async shouldRefresh => {
      const token = await kUtilsInjectables.session().encodeToken({
        shouldRefresh,
        tokenId: 'tokenId',
        expiresAt: Date.now() + 10_000,
        issuedAt: Date.now(),
      });
      expect(token.jwtToken).toBeDefined();
      expect(token.jwtTokenExpiresAt).toBeDefined();

      if (shouldRefresh) {
        expect(token.refreshToken).toBeDefined();
      } else {
        expect(token.refreshToken).not.toBeDefined();
      }

      const decodedToken = kUtilsInjectables
        .session()
        .decodeToken(token.jwtToken);
      expect(decodedToken).toBeDefined();
      expect(decodedToken.exp).toBeDefined();
      expect(decodedToken.iat).toBeDefined();
      expect(decodedToken.sub.id).toBe('tokenId');

      if (shouldRefresh) {
        expect(decodedToken.sub.refreshToken).toBeDefined();
      } else {
        expect(decodedToken.sub.refreshToken).not.toBeDefined();
      }
    }
  );

  test('encodeToken fails if shouldRefresh is true but expires is not provided', async () => {
    await expect(async () => {
      await kUtilsInjectables
        .session()
        .encodeToken({tokenId: 'tokenId', shouldRefresh: true});
    }).rejects.toThrow(ServerError);
  });
});
