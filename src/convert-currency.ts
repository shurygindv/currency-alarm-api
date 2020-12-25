import { convertCurrencyApi } from "./providers/currency-converter-provider";
import { chiefProvider } from "./providers/chief-provider";

import { httpResponse } from "./libs/http";
import { lambda } from "./libs/lambda";

const isInvalidParams = (params) => {
  return !(params.from && params.to && params.amount > 0);
};

export const convertCurrency = lambda(async (event) => {
  const params = event.queryStringParameters || {};

  if (isInvalidParams(params)) {
    return httpResponse.validationError(`Invalid params`);
  }

  const { from, to, amount } = params;

  const [data, error] = await convertCurrencyApi({
    from,
    to,
    amount: Number(amount),
  });

  if (data) {
    return httpResponse.success(data);
  }

  await chiefProvider.reportAboutError({
    description: error.message,
  });

  return httpResponse.internalError("Smth went wrong");
});
