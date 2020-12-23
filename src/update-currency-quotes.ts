import AWS from "aws-sdk";
import fetch from "node-fetch";
import type { APIGatewayProxyHandler } from "aws-lambda";

import { httpResponse } from "./libs/http";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const API_KEY = process.env.API_KEY;

const fetchRates = async (base) => {
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

const putNewCurrencyQuotesAsync = (data: any) => {
  const params = {
    TableName: process.env.CURRENCY_RATES_TABLE_NAME,
    Item: {
      id: "usd-eur",
      date: new Date().toISOString(),
      data,
    },
  };

  return dynamoDb.put(params).promise();
};

export const updateCurrencyQuotes: APIGatewayProxyHandler = async (_event) => {
  try {
    const [USD, EUR, RUB] = Promise.all(["USD", "EUR", "RUB"].map(fetchRates));

    const result = await putNewCurrencyQuotesAsync({
      USD,
      EUR,
      RUB,
    });

    console.info(result);

    return httpResponse.accepted();
  } catch (err) {
    console.error(err);

    return httpResponse.internalError("Something went wrong");
  }
};
