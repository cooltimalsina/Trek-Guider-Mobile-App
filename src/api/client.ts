import { assertApiConfigured, ENV } from "@/constants/env";
import { ApiError } from "@/types/api";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export type RequestOptions = {
  method?: Method;
  body?: unknown;
  token?: string | null;
  /** Skip Authorization header */
  public?: boolean;
};

/**
 * Low-level JSON client. Successful responses use `{ data: T }` from Trek Guider backend.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  assertApiConfigured();
  const { method = "GET", body, token, public: isPublic } = options;
  const url = `${ENV.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (!isPublic && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await parseBody(res)) as Record<string, unknown>;

  if (res.status === 401) {
    unauthorizedHandler?.();
    const msg =
      typeof payload.message === "string" ? payload.message : "Session expired. Please sign in again.";
    throw new ApiError(msg, 401, typeof payload.code === "string" ? payload.code : undefined);
  }

  if (!res.ok) {
    const msg = typeof payload.message === "string" ? payload.message : res.statusText;
    const code = typeof payload.code === "string" ? payload.code : undefined;
    throw new ApiError(msg || `Request failed (${res.status})`, res.status, code);
  }

  if ("data" in payload) {
    return payload.data as T;
  }
  return payload as T;
}
