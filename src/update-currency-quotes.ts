import AWS from 'aws-sdk';
import fetch from 'node-fetch';

import { httpResponse } from './libs/http';
import { lambda } from './libs/lambda';

import { API_PATHS, CurrencyType } from './api';

// @ts-ignore
type CurrencyScoopResponse = {
	meta: {
		code: number;
	};
	response: {
		date: string;
		base: CurrencyType;
		rates: Record<CurrencyType, number>;
	};
};

// TODO: dynamob transactions
const saveRateInDatabase = (
	type: CurrencyType,
	relateRates: Record<CurrencyType, number>,
) => {
	const dynamoDb = new AWS.DynamoDB.DocumentClient();

	const params = {
		TableName: process.env.CURRENCY_RATES_TABLE_NAME,
		Item: {
			currencyType: type,
			date: new Date().toISOString(),
			rates: relateRates,
		},
	};

	return dynamoDb.put(params).promise();
};

const fetchRates = async base => {
	try {
		const result = await fetch(API_PATHS.currencyscoop(base));
		const json = (await result.json()) as CurrencyScoopResponse;

		return json.response.rates;
	} catch (e) {
		console.error(e);
		console.info('api.currencyscoop.com');

		throw e;
	}
};

const availableCurrencies = [
	CurrencyType.USD,
	CurrencyType.EUR,
	CurrencyType.RUB,
];

// scheduled trigger
export const updateCurrencyQuotes = lambda(async () => {
	for (const type of availableCurrencies) {
		const rate = await fetchRates(type);

		await saveRateInDatabase(type, rate);
	}

	return httpResponse.accepted();
});
