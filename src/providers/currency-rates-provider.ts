// api rates providers
// prefer plain object style
import fetch from 'node-fetch';

interface CurrencyRateProvider {
    fetch(): string;
    normalize(): boolean;
    successResponseIf(): boolean;
}

export const rateExchangesApi = {};
export const exchangeRateApi = {};
export const freeCurrency = {};
