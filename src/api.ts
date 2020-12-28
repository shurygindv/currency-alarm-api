export enum CurrencyType {
	USD = 'USD',
	EUR = 'EUR',
	RUB = 'RUB',
}

const RATE_API_KEY = process.env.RATES_API_KEY;
const FREE_CURR_API_KEY = process.env.FREE_CURRCONV_API_KEY;

export const API_PATHS = {
	currencyscoop: (base: CurrencyType) =>
		`https://api.currencyscoop.com/v1/latest?base=${base}&api_key=${RATE_API_KEY}`,

	// converters
	exchangeConverter: (q: string) =>
		`https://api.exchangeratesapi.io/latest?base=${q}`,

	freeCurrConverter: (q: string) =>
		`https://free.currconv.com/api/v7/convert?q=${q}&compact=ultra&apiKey=${FREE_CURR_API_KEY}`,
};
