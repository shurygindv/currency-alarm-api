
type Data = {
    statusCode: number;
    headers?: Record<string,string>,
    body: any;
}

const res = (data: Data) => ({
  statusCode: data.statusCode,
  headers: data.headers,
  body: JSON.stringify(data.body),
});

const internalError = (message: string) =>
  res({
    statusCode: 500,
    body: {message}
  });

const success = <T>(body?: T) => res({
    body,
    statusCode: 200
});

export const httpResponse = {
  internalError,
  success,
};
