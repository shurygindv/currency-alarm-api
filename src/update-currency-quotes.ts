import AWS from 'aws-sdk';
import fetch from 'node-fetch';

import { httpResponse } from './libs/http';
import { lambda } from './libs/lambda';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const API_KEY = process.env.API_KEY;

const fetchRates = async base => {
	const url = `https://api.currencyscoop.com/v1/latest?base=${base}&api_key=${API_KEY}`;

	try {
		const result = await fetch(url);
		const json = await result.json();

		return json.response;
	} catch (e) {
		console.info(`api.currencyscoop.com`);

		throw e;
	}
};

const updateTableCurrencyQuotesAsync = (data: any) => {
	const params = {
		TableName: process.env.CURRENCY_RATES_TABLE_NAME,
		Item: {
			id: 'usd-eur',
			date: new Date().toISOString(),
			data,
		},
	};

	return dynamoDb.put(params).promise();
};

// scheduled trigger
export const updateCurrencyQuotes = lambda(async () => {
	const [USD, EUR, RUB] = await Promise.all(
		['USD', 'EUR', 'RUB'].map(fetchRates),
	);

	const result = await updateTableCurrencyQuotesAsync({
		USD,
		EUR,
		RUB,
	});

	return httpResponse.accepted(result);
});
