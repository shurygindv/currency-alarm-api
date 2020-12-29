import fetch from 'node-fetch';

import { API_PATHS } from '../core/config';

// TODO: json constructor
// prefer simple object schemes over classes

type NormalizedData = {
	value: number;
	from: string;
	to: string;
};

type QueryParams = {
	from: string;
	to: string;
	amount: number;
};

interface ConverterApiContract {
	name: string;
	fetch(query: QueryParams): string;
	normalize(q: QueryParams, response: any): NormalizedData;
}

const exchangeRateApi: ConverterApiContract = {
	name: 'api.exchangeratesapi.io',

	fetch(params: QueryParams): string {
		const query = encodeURIComponent(params.from);

		return fetch(API_PATHS.exchangeConverter(query)).then(res => res.json());
	},
	normalize({ from, to }: QueryParams, data: any) {
		const convertedFrom = from.toUpperCase();
		const convertedTo = to.toUpperCase();

		const rates = data.rates;
		const value = rates.hasOwnProperty(convertedTo) ? rates[convertedTo] : null;

		return {
			from: convertedFrom,
			to: convertedTo,
			value,
		};
	},
};

/// ===========

const freeCurrencyApi: ConverterApiContract = {
	name: 'free.currconv.com',
	
	fetch(params: QueryParams) {
		const from = encodeURIComponent(params.from);
		const to = encodeURIComponent(params.to);

		const url = API_PATHS.freeCurrConverter(`${from}_${to}`);

		return fetch(url).then(res => res.json());
	},
	normalize({ from, to }: QueryParams, data: any) {
		const convertedFrom = from.toUpperCase();
		const convertedTo = to.toUpperCase();

		const key = `${convertedFrom}_${convertedTo}`;

		const value = data.hasOwnProperty(key) ? data[key] : null;

		return {
			from: convertedFrom,
			to: convertedTo,
			value: value,
		};
	},
};

const converters = [freeCurrencyApi, exchangeRateApi] as const;

const isOutputValid = ({ value, from, to }: NormalizedData): boolean => {
	return [
		typeof from === 'string',
		typeof to === 'string',
		Number(value) === value,
	].every(Boolean);
};

type DuckError = { message: string };

type Left = NormalizedData;
type Right = Error | DuckError;

type ConverterResult = [Left?, Right?];

export const convertCurrencyService = async (
	query: QueryParams,
): Promise<ConverterResult> => {
	for (const converterApi of converters) {
		try {
			const data = await converterApi.fetch(query);
			const normalizedData = converterApi.normalize(query, data);

			if (isOutputValid(normalizedData)) {
				return [normalizedData];
			}

			console.error(
				`Validation Error: can't process '${converterApi.name}' (%s)`,
				JSON.stringify(query),
			);
		} catch (e) {
			console.error(e);
		}
	}

	return [, { message: 'seems, converter capabilities are reached' }];
};
