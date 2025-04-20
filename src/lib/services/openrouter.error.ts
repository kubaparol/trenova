/**
 * Custom error representing errors returned by the OpenRouter API.
 */
export class OpenRouterApiError extends Error {
  public readonly status: number;
  public readonly code: string | null;
  public readonly data?: unknown;

  constructor(
    message: string,
    status: number,
    code: string | null = null,
    data?: unknown
  ) {
    super(message);
    this.name = "OpenRouterApiError";
    this.status = status;
    this.code = code;
    this.data = data;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenRouterApiError);
    }
  }
}

// Other specific error types can be added here as needed
