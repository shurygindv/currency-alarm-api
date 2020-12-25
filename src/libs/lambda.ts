import type { APIGatewayProxyHandler } from 'aws-lambda';

import { httpResponse } from './http';

export const lambda = (fn: APIGatewayProxyHandler) => event => {
	console.info('=============');

	console.group('lambda handler');
	console.info(event);

	try {
		// @ts-ignore
		const result = await fn(event);

		console.info(result);

		return result;
	} catch (e) {
		console.error(e);

		return httpResponse.internalError('something went wrong');
	} finally {
		console.groupEnd();
		console.info('=============');
	}
};
