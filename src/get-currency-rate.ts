import AWS from "aws-sdk";
import type { APIGatewayProxyHandler } from "aws-lambda";

import { httpResponse } from "./libs/http";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const fetchRates = () => {
  const params = {
    TableName: process.env.CURRENCY_RATES_TABLE_NAME,
    KeyConditionExpression: "id = :t",
    ExpressionAttributeValues: {
      ":t": "usd-eur",
    },
    ScanIndexForward: false,
    limit: 1,
  };

  return dynamoDb.query(params).promise();
};

export const getCurrencyRates: APIGatewayProxyHandler = async (_event) => {
  try {
    const result = await fetchRates();
    let [body] = result.Items;

    return httpResponse.success(body);
  } catch (err) {
    console.error(err);

    return httpResponse.internalError(`Something went wrong`);
  }
};
