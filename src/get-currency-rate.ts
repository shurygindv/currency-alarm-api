import AWS from 'aws-sdk';

import { httpResponse } from './libs/http';
import { lambda } from './libs/lambda';

const fetchRates = () => {
	const dynamoDb = new AWS.DynamoDB.DocumentClient();

	const params = {
		TableName: process.env.CURRENCY_RATES_TABLE_NAME,
		KeyConditionExpression: 'id = :t',
		ExpressionAttributeValues: {
			':t': 'usd-eur', // hard=code todo
		},
		ScanIndexForward: false,
		limit: 1,
	};

	console.info(params);

	return dynamoDb.query(params).promise();
};

export const getCurrencyRates = lambda(async () => {
	const result = await fetchRates();

	const [body] = result.Items;

	return httpResponse.success(body);
});
