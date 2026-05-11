export type ApiSuccess<T> = {
  data: T;
  requestId?: string;
};

export type ApiErrorBody = {
  code?: string;
  message?: string;
  requestId?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
