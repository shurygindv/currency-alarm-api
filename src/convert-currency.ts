
import {
  rateExchangesApi,
  exchangeRateApi,
  freeCurrency,
} from "./providers/currency-rates-provider"

const variants = [rateExchangesApi, exchangeRateApi, freeCurrency];

const stub = {
  from: "USD",
  to: "RUB",
  amount: 1,
};

const isInvalidParams = (params) => {
  return !(params.from && params.to && params.amount > 0);
};

const json = ({ body, statusCode }) => ({
  statusCode: statusCode || 200,
  body: JSON.stringify(body),
  headers: {
    "Content-Type": "application/json",
  },
});

const invalidResponse = (message) =>
  json({
    statusCode: 200,
    body: {
      success: false,
      message: message || "error",
    },
  });

const convertFromToCurrency = async (params) => {
  for (const method of variants) {
    let body;

    try {
      let res = await method.fetch(params);

      if (res.status !== 200) {
        continue;
      }

      body = await res.json();
    } catch (e) {
      console.error(e);
    }

    if (!body) {
      continue;
    }

    if (method.successIf(body)) {
      return method.normalize(body);
    }
  }
};

export const convertCurrency = async (event) => {
  const params = event.queryStringParameters || {};

  console.log(params);

  if (isInvalidParams(params)) {
    return invalidResponse("where parameters");
  }

  const from = params["from"];
  const to = params["to"];
  const amount = params["amount"];

  let data;

  try {
    data = await convertFromToCurrency({
      from,
      to,
      amount,
    });
  } catch (e) {
    return invalidResponse(e.message);
  }

  return json({ body: { data, success: true } });
};
