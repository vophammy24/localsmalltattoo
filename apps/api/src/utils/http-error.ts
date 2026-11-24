export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public field?: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
