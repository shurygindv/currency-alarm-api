import AWS from 'aws-sdk';

type Report = {
	name?: string;
	description: string;
};

const handleResult = (e: Error) => {
	if (e) {
		console.info('>> EMERGENCY <<');
		console.error(e.message);
		return;
	}

	console.info('Successfuly emailed with report');
};

const parametrized = (payload: Report) => ({
	Message: JSON.stringify(payload),
	TopicArn: process.env.EXCEPTION_REPORT_TOPIC_ARN,
	Subject: `[API] ACHTUNG! Help me, we are falling`,
});

export const coreService = {
	reportAboutError(report: Report) {
		const sns = new AWS.SNS();

		return sns.publish(parametrized(report), handleResult).promise();
	},
};
