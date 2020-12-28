import AWS from 'aws-sdk';

import { httpResponse } from './libs/http';
import { lambda } from './libs/lambda';

import { CurrencyType } from './api';

type Params = {
	base: CurrencyType;
};

type RateResponse = {
	result: {
		currencyType: CurrencyType,
		date: string,
		rates: Record<CurrencyType, number>
	},
	success: boolean
}

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
	const [data] = result.Items as RateResponse[];

	return httpResponse.success(data || null);
});
