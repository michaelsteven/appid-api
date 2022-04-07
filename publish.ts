const { Publisher } = require('@pact-foundation/pact');
const path = require('path');
const childProcess = require('child_process');
require('dotenv').config();

const exec = (command: any) => childProcess.execSync(command).toString().trim();

// Usually, you would just use the CI env vars, but to allow these examples to run from
// local development machines, we'll fall back to the git command when the env vars aren't set.
// TODO: Update these for your particular CI server
const gitSha = process.env.TRAVIS_COMMIT || exec('git rev-parse HEAD || echo LOCAL_DEV');
// const branch =
//   process.env.TRAVIS_BRANCH || exec("git rev-parse --abbrev-ref HEAD || echo LOCAL_DEV");
const branch = 'master';

const opts = {
  pactFilesOrDirs: [path.resolve(process.cwd(), 'pact/pacts')],
  pactBroker: process.env.PACTFLOW_BROKER_URL,
  pactBrokerToken: process.env.PACTFLOW_TOKEN,
  consumerVersion: gitSha,
  tags: [branch],
};

new Publisher(opts)
  .publishPacts()
  .then(() => {
    console.log('Pact contract publishing complete!');
    console.log('');
    console.log(`Head over to ${process.env.PACTFLOW_BROKER_URL} to see your published contracts.`);
  })
  .catch((e: any) => {
    console.log('Pact contract publishing failed: ', e);
  });
