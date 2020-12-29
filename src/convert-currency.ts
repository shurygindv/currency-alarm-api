import { convertCurrencyService } from './services/currency-converter-service';
import { coreService } from './services/core-service';

import { httpResponse } from './libs/http';
import { lambda } from './libs/lambda';

type QueryParams = {
	from: string;
	to: string;
	amount: number;
};

const isInvalidParams = (params: Partial<QueryParams>) => {
	return !(params.from && params.to && params.amount > 0);
};

const callConverterService = ({ from, to, amount }: QueryParams) => {
	return convertCurrencyService({
		from,
		to,
		amount: Number(amount),
	});
};

export const convertCurrency = lambda(async event => {
	const params = Object(event.queryStringParameters);

	if (isInvalidParams(params)) {
		return httpResponse.validationError(`Invalid params`);
	}

	const [data, error] = await callConverterService(params);

	if (data) {
		return httpResponse.success(data);
	}

	await coreService.reportAboutError({
		description: error.message,
	});

	return httpResponse.internalError('Smth went wrong');
});
