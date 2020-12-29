import * as jestPlugin from 'serverless-jest-plugin';

import * as mod from '../src/convert-currency';

const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'convertCurrency' });

const converterApiResponse = jest.fn(() => Promise.resolve({}));

const snsInstance = {
	publish: jest.fn(() => ({ promise: () => Promise.resolve() })),
};

jest.mock('aws-sdk', () => ({ SNS: jest.fn(() => snsInstance) }));

jest.mock('node-fetch', () => ({
	__esModule: true,
	default: jest.fn(() =>
		Promise.resolve({
			json: converterApiResponse,
		}),
	),
}));

const validationErrorResponse = {
	statusCode: 400,
	headers: undefined,
	body: '{"message":"Invalid params","success":false}',
};

describe('[base] convertCurrency', () => {
	beforeAll(done => {
		//  lambdaWrapper.init(liveFunction); // Run the deployed lambda

		done();
	});

	afterAll(() => {
		converterApiResponse.mockClear();
	});

	it('should run lambda', () => {
		return wrapped.run({}).then(response => {
			expect(response).toBeDefined();
		});
	});

	it('[validation] should fail when invalid query [1]', () => {
		return wrapped.run({}).then(response => {
			expect(response).toMatchObject(validationErrorResponse);
		});
	});

	it('[validation] should fail when invalid query [2]', () => {
		const params = {
			queryStringParameters: {
				from: 'usd',
				to: 'rub',
				amount: -1,
			},
		};

		return wrapped.run(params).then(response => {
			expect(response).toMatchObject(validationErrorResponse);
		});
	});

	it('[validation] should fail when invalid query [3]', () => {
		const params = {
			queryStringParameters: {
				from: null,
				to: null,
				amount: null,
			},
		};

		return wrapped.run(params).then(response => {
			expect(response).toMatchObject(validationErrorResponse);
		});
	});

	it('[validation] should fail when invalid query [3]', () => {
		const params = {
			queryStringParameters: {
				from: 'usd',
				to: 'rub',
				amount: '-2',
			},
		};

		return wrapped.run(params).then(response => {
			expect(response).toMatchObject(validationErrorResponse);
		});
	});

	it('[validation] should fail when invalid query [4]', () => {
		const params = {
			queryStringParameters: {
				from: 'usd',
				to: 'rub',
				amount: NaN,
			},
		};

		return wrapped.run(params).then(response => {
			expect(response).toMatchObject(validationErrorResponse);
		});
	});

	it('[api] should call converter-api when a correct query', () => {
		const params = {
			queryStringParameters: {
				from: 'usd',
				to: 'rub',
				amount: 1,
			},
		};

		converterApiResponse.mockImplementation(() =>
			Promise.resolve({
				USD_RUB: 74,
			}),
		);

		return wrapped.run(params).then(response => {
			expect(response).toMatchObject({
				body: '{"result":{"from":"USD","to":"RUB","value":74},"success":true}',
				headers: undefined,
				statusCode: 200,
			});
		});
	});

	it('[api] shouldn`t panic when unexpected behavior (call SNS)', () => {
		const params = {
			queryStringParameters: {
				from: 'usd',
				to: 'rub',
				amount: 1,
			},
		};

		converterApiResponse.mockImplementation(() => Promise.resolve(null));

		return wrapped.run(params).then(response => {
			expect(snsInstance.publish).toHaveBeenCalledTimes(1);
			expect(response).toMatchObject({
				statusCode: 500,
				headers: undefined,
				body: '{"message":"Smth went wrong","success":false}',
			});
		});
	});
});
