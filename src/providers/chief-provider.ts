import AWS from "aws-sdk";

type Report = {
  name?: string,
  description: string;
}

const handleResult = (e: Error) => {
  if (e) {
    console.info(">> EMERGENCY <<");
    console.error(e.message);
    return;
  }

  console.info("Successfuly emailed with report");
};

const parametrized = (payload: Report) => ({
  Message: JSON.stringify(payload),
  TopicArn: process.env.EMERGENCY_TOPIC,
  Subject: `[API] ACHTUNG! Help me, we are falling`,
});

export const chiefProvider = {
  reportAboutError(report: Report) {
    const sns = new AWS.SNS();

    return sns.publish(parametrized(report), handleResult).promise();
  },
};
