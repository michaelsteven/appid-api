import { Verifier } from '@pact-foundation/pact';
import { RegisterRoutes } from '../../build/routes';
import express from 'express';
import { Controller } from 'tsoa';

const app = express();
RegisterRoutes(app);
const server = app.listen('3001');

describe('Pact Verification', () => {
  it('validates the expectations of appid-api', () => {
    const baseOpts = {
      logLevel: process.env.LOG_LEVEL || 'INFO',
      providerBaseUrl: 'http://localhost:3001',
      providerVersion: '1.0.0+localdev', // TODO: set this to a version derived from your CI build, for example with travis:  process.env.TRAVIS_COMMIT
      providerVersionTags: 'LOCAL_DEV', // TODO: set this to the branch from your source control, for example with travis:  process.env.TRAVIS_BRANCH ? [process.env.TRAVIS_BRANCH] : [],
      verbose: process.env.VERBOSE === 'true',
      pactBrokerToken: process.env.PACTFLOW_TOKEN,
      publishVerificationResult: process.env.CI === 'true', // recommended to only publish from CI by setting the value to process.env.CI === 'true'
    };

    // For builds triggered by a 'contract content changed' webhook,
    // just verify the changed pact. The URL will bave been passed in
    // from the webhook to the CI job.
    const pactChangedOpts = {
      pactUrls: [process.env.PACT_URL]
    };

    // For 'normal' provider builds, fetch `master` and `prod` pacts for this provider
    const fetchPactsDynamicallyOpts = {
      provider: 'appid-api',
      consumerVersionSelectors: [{ tag: 'master', latest: true }, { tag: 'prod', latest: true }],
      pactBrokerUrl: 'https://michaelsteven.pactflow.io',
      enablePending: false,
      includeWipPactsSince: undefined
    };

    const stateHandlers = {
      'signup success': () => {
        
      }
    };

    const opts = {
      ...baseOpts,
      ...(process.env.PACT_URL ? pactChangedOpts : fetchPactsDynamicallyOpts),
      stateHandlers: stateHandlers,
      requestFilter: requestFilter
    };

    return new Verifier(opts).verifyProvider()
      .then(output => {
        console.log('Pact Verification Complete!');
        console.log(output);
      })
      .finally(() => {
        server.close();
      });
  });
});
