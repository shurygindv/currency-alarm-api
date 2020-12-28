import AWS from 'aws-sdk';

import { httpResponse } from './libs/http';
import { lambda } from './libs/lambda';

import { CurrencyType } from './api';

type Params = {
	base: CurrencyType;
};

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const fetchRates = (currencyType: CurrencyType) => {
	const params = {
		TableName: process.env.CURRENCY_RATES_TABLE_NAME,
		KeyConditionExpression: 'currencyType = :v',
		ExpressionAttributeValues: {
			':v': currencyType,
		},
		ScanIndexForward: false,
		limit: 1,
	};

	console.info(params);

	return dynamoDb.query(params).promise();
};

const isInvalidParams = (v: string) => !v;

export const getCurrencyRates = lambda(async event => {
	// @ts-expect-error
	const params: Params = event.queryStringParameters || {};

	if (isInvalidParams(params.base)) {
		return httpResponse.validationError(`Invalid params`);
	}

	const result = await fetchRates(params.base);
	console.log(result);
	const [body] = result.Items;

	return httpResponse.success(body);
});
