## Currency Alarm API

serverless back-end for `Flutter app` https://github.com/shurygindv/currency-alarm

`Platform:` Node.js 12.x.x AWS services

### Usage

run: `serverless deploy -s dev`

### Intro

`GET` - https://.execute-api.eu-west-1.amazonaws.com/dev/convert-currency
* convert `from` -> `to` with `amount`: `/dev/convert-currency?from=USD&to=RUB&amount=100`

`GET` - https://.execute-api.eu-west-1.amazonaws.com/dev/get-currency-rate
* rate info by `base`: `/dev/get-currency-rate?base=USD`

### Stack
* AWS Lambda
* AWS DynamoDb
* AWS APIGateway
* AWS EventBridge (scheduler, to limit requests for currency rates)
* `...`


### Required iam permissions (granting access)

* AWS CloudFormation
* AWS S3 
* AWS IAM readonly 
* AWS API Gateway Administrator

### Deployment (CI&CD)

see `.github/workflows/ci.yml` file for details
