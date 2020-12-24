import fetch from "node-fetch";

type NormalizedData = {
  result: number;
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
  normalize(): NormalizedData;
  validate(response: Response): boolean;
}

const API_EXCHANGE_URL = (q: string) => `https://api.exchangeratesapi.io/latest?base=${q}`

const exchangeRateApi: ConverterApiContract = {
  name: "api.exchangeratesapi.io",
  reliabilityApi: 1,
  fetch(params: QueryParams): string {
    return fetch(API_EXCHANGE_URL(encodeURIComponent(params.from)))
      .then((res) => res.json())
      .then(console.info);
  },
  normalize({ from, to }: QueryParams, data: any) {
    const convertedFrom = from.toUpperCase();
    const convertedTo = to.toUpperCase();

    const rates = data.rates;
    const result = rates.hasOwnProperty(convertedTo)
      ? rates[convertedTo]
      : null;

    return {
      from: convertedFrom,
      to: convertedTo,
      result,
    };
  },
};

/// ===========

const FREE_CURRCONV_API_KEY = process.env.FREE_CURRCONV_API_KEY;
const FREE_CURRCONV_URL = (q: string) =>
  `https://free.currconv.com/api/v7/convert?q=${q}&compact=ultra&apiKey=${FREE_CURRCONV_API_KEY}`;

const freeCurrencyApi: ConverterApiContract = {
  name: "free.currconv.com",
  reliabilityApi: 2,
  fetch(params: QueryParams) {
    const from = encodeURIComponent(params.from);
    const to = encodeURIComponent(params.to);

    const url = FREE_CURRCONV_URL(`${from}_${to}`);

    return fetch(url)
      .then((res) => res.json())
      .then(console.info);
  },
  normalize({ from, to }: QueryParams, data: any) {
    const convertedFrom = from.toUpperCase();
    const convertedTo = to.toUpperCase();

    const key = `${convertedFrom}_${convertedTo}`;

    const result = data.hasOwnProperty(key) ? data[key] : null;

    return {
      from: convertedFrom,
      to: convertedTo,
      result: result,
    };
  },
};

const converters = [
  exchangeRateApi,
  freeCurrencyApi,
] as const;

const isOutputValid = ({ result, from, to }: NormalizedData): boolean => {
  return [
    typeof from === "string",
    typeof to === "string",
    Number(result) === result,
  ].every(Boolean);
};

export const convertCurrencyApi = async (params: QueryParams) => {
  for (const converterApi of converters) {
    try {
      const data = await converterApi.fetch(params);
      const normalizedData = converterApi.normalize(data);

      if (isOutputValid(normalizedData)) {
        return normalizedData;
      }

      console.error(
        `Validation Error: can't process '${convertCurrencyApi.name}' (%s)`,
        JSON.stringify(params)
      );
    } catch (e) {
      console.error(e);
    }
  }

  throw new Error("any provider is unavailable");
};
