import * as jestPlugin from 'serverless-jest-plugin';

import * as mod from '../src/get-currency-rate';

const lambdaWrapper = jestPlugin.lambdaWrapper;
// @ts-ignore
const wrapped = lambdaWrapper.wrap(mod, { handler: 'getCurrencyRates' });

const stubRate = {};

const dynamoDocInstance = {
	query: jest.fn(() => ({
		promise: () =>
			Promise.resolve({
				Items: [stubRate],
			}),
	})),
};

jest.mock('aws-sdk', () => ({
	DynamoDB: {
		DocumentClient: jest.fn(() => dynamoDocInstance),
	},
}));

const validationErrorResponse = {
	statusCode: 400,
	headers: undefined,
	body: '{"message":"Invalid params","success":false}',
};


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

	it('[validation] should fail when invalid `base` query', () => {
		const params = {
			queryStringParameters: {base: ';select *'}
		};

		return wrapped.run(params).then((res) => {
			expect(res).toMatchObject(validationErrorResponse);
		});
	});

	it('[validation] should fail when invalid `base` query', () => {
		return wrapped.run({}).then((res) => {
			expect(res).toMatchObject(validationErrorResponse);
		});
	});
});
