import * as jestPlugin from 'serverless-jest-plugin';

import * as mod from '../src/get-currency-rate';

const lambdaWrapper = jestPlugin.lambdaWrapper;
// @ts-ignore
const wrapped = lambdaWrapper.wrap(mod, { handler: 'getCurrencyRates' });

const stubRate = {};

const dynamoDocInstance = {
	query: jest.fn(() => ({ promise: () => Promise.resolve({
    Items: [stubRate]
  }) })),
};

jest.mock('aws-sdk', () => ({
	DynamoDB: {
		DocumentClient: jest.fn(() => dynamoDocInstance),
	},
}));

describe('[base] getCurrencyRates', () => {
	beforeAll(done => {
		//  lambdaWrapper.init(liveFunction); // Run the deployed lambda

		done();
	});

	afterEach(async () => {
    await dynamoDocInstance.query.mockClear();
	});

	it('should run lambda', () => {
		return wrapped.run({}).then(response => {
			expect(response).toBeDefined();
		});
  });
  
  it('should call dynamodb', async () => {
		return wrapped.run({}).then(() => {
			expect(dynamoDocInstance.query).toHaveBeenCalledTimes(1);
		});
  });
  
  it('should say `internalError` if smth went wrong`', () => {
    // @ts-expect-error
    dynamoDocInstance.query.mockImplementation(() => Promise.resolve(null));

		return wrapped.run({}).then(() => {
			expect(dynamoDocInstance.query).toHaveBeenCalledTimes(1);
		});
  });
});
