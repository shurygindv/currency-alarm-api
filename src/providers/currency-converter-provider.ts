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

// prefer plain object style
const rateExchangesApi: ConverterApiContract = {
  fetch(): string {
    throw new Error("Method not implemented.");
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

const exchangeRateApi: ConverterApiContract = {
  name: "api.exchangeratesapi.io",
  fetch(params: QueryParams): string {
    const from = encodeURIComponent(params.from);

    return fetch(
      `https://api.exchangeratesapi.io/latest?base=${from}`
    ).then((res) => res.json());
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

const freeCurrencyApi: ConverterApiContract = {
  name: "free.currconv.com",
  fetch(params: QueryParams) {
    const from = encodeURIComponent(params.from);
    const to = encodeURIComponent(params.to);

    const q = `${from}_${to}`;

    const url = `https://free.currconv.com/api/v7/convert?q=${q}&compact=ultra&apiKey=${FREE_CURRCONV_API_KEY}`;

    return fetch(url).then((res) => res.json());
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
  rateExchangesApi,
  exchangeRateApi,
  freeCurrencyApi,
] as const;

const isValid = ({ result, from, to }: NormalizedData): boolean => {
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

      if (isValid(normalizedData)) {
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
