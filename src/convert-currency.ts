import { convertCurrencyApi } from "./providers/currency-converter-provider";
import { httpResponse } from "./libs/http";

const isInvalidParams = (params) => {
  return !(params.from && params.to && params.amount > 0);
};

export const convertCurrency = async (event) => {
  const params = event.queryStringParameters || {};

  console.log(params);

  if (isInvalidParams(params)) {
    return httpResponse.validationError(`Invalid params`);
  }

  const { from, to, amount } = params;

  try {
    const data = await convertCurrencyApi({
      from,
      to,
      amount,
    });

    console.info(data);

    return httpResponse.success(data);
  } catch (e) {
    console.error(e);

    return httpResponse.internalError(`Something went wrong`);
  }
};
