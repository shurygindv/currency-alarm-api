type Data = {
	statusCode: number;
	headers?: Record<string, string>;
	body: any;
};

const res = (data: Data) => ({
	statusCode: data.statusCode,
	headers: data.headers,
	body: JSON.stringify(data.body),
});

const errorStatusCode = (statusCode: number, msg: string) =>
	res({
		statusCode: statusCode,
		body: { message: msg, success: false },
	});

const successStatusCode = <T>(statusCode: number, body: T) =>
	res({
		statusCode: statusCode,
		body: { result: body, success: true },
	});

const internalError = (message: string) => errorStatusCode(500, message);
const validationError = (message: string) => errorStatusCode(400, message);

const success = <T>(body: T) => successStatusCode(200, body);
const accepted = <T>(body?: T) => successStatusCode(202, body);

export const httpResponse = {
	internalError,
	validationError,
	//=
	success,
	accepted,
};
