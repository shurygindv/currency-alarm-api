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

const internalError = (message: string) =>
  res({
    statusCode: 500,
    body: { errorMessage: message, success: false },
  });

const validationError = (message: string) =>
  res({
    statusCode: 400,
    body: { errorMessage: message, success: false },
  });

const success = <T>(body: T) =>
  res({
    body: { result: body, success: true },
    statusCode: 200,
  });

const accepted = <T>(body?: T) =>
  res({
    body: { result: body, success: true },
    statusCode: 202,
  });

export const httpResponse = {
  internalError,
  validationError,
  //=
  success,
  accepted,
};
