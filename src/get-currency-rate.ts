import AWS from "aws-sdk";

import { APIGatewayProxyHandler } from "aws-lambda";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const fetchRates = () => {
  const params = {
    TableName: process.env.currencyRatesTableName,
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
  let body;

  try {
    const result = await fetchRates();

    [body] = result.Items;
  } catch (err) {
    return {
      statusCode: 500,
      body: { error: err.message },
    };
  }

  return {
    statusCode: 200,
    body,
  };
};
