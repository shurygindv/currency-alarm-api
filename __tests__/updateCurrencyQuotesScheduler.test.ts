import * as jestPlugin from "serverless-jest-plugin";

import * as mod from '../src/update-currency-quotes';

const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'updateCurrencyQuotes' });

describe('[base] updateCurrencyQuotesScheduler', () => {
  beforeAll((done) => {
//  lambdaWrapper.init(liveFunction); // Run the deployed lambda

    done();
  });

  it('should run lambda', () => {
    return wrapped.run({}).then((response) => {
      expect(response).toBeDefined();
    });
  });
});
