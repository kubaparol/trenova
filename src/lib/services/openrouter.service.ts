import {
  OpenRouterServiceConfig,
  ChatCompletionParams,
  ChatCompletionResponse,
} from "./openrouter.types";
import { OpenRouterApiError } from "./openrouter.error";

/**
 * Provides methods to interact with the OpenRouter AI API.
 * Handles request formation, API key management, and error handling.
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseURL: string;

  /**
   * Creates an instance of OpenRouterService.
   * @param config Optional configuration containing the API key and base URL.
   *               Defaults to environment variable OPENROUTER_API_KEY and OpenRouter's V1 API URL (https://openrouter.ai/api/v1).
   */
  constructor(config?: OpenRouterServiceConfig) {
    this.apiKey = config?.apiKey ?? process.env.OPENROUTER_API_KEY ?? "";
    this.baseURL = config?.baseURL ?? "https://openrouter.ai/api/v1";

    if (!this.apiKey) {
      console.error(
        "[OpenRouterService] API Key is missing. Provide it via constructor config or OPENROUTER_API_KEY environment variable."
      );
      // Consider throwing if the key is mandatory for all operations
    }
  }

  /**
   * Sends a chat completion request to the OpenRouter API.
   *
   * @param params The parameters for the chat completion request, including model, messages, and optional settings.
   * @returns A promise that resolves to the chat completion response from the API.
   * @throws {Error} If the model or messages are missing in the params.
   * @throws {Error} If the API key is missing when the request is made.
   * @throws {OpenRouterApiError} If the OpenRouter API returns an error response.
   * @throws {Error} For network issues or other unexpected errors during the API call.
   */
  public async createChatCompletion(
    params: ChatCompletionParams
  ): Promise<ChatCompletionResponse> {
    // Basic input validation
    if (!params.model) {
      throw new Error("[OpenRouterService] Missing required parameter: model");
    }
    if (!params.messages || params.messages.length === 0) {
      throw new Error(
        "[OpenRouterService] Missing required parameter: messages (must be a non-empty array)"
      );
    }

    // Call the private method to handle the actual request sending
    // The <ChatCompletionResponse> type argument ensures sendRequest returns the expected type
    return this.sendRequest<ChatCompletionResponse>(
      "/chat/completions",
      params
    );
  }

  // Private helper methods

  /**
   * Sends a request to the specified OpenRouter API endpoint.
   * Handles basic request setup, response parsing, and error handling.
   * @template T The expected response type.
   * @param endpoint The API endpoint path (e.g., /chat/completions).
   * @param payload The request body payload.
   * @returns A promise resolving to the parsed API response.
   * @throws {OpenRouterApiError} If the API returns an error status.
   * @throws {Error} For network issues or other unexpected errors.
   */
  private async sendRequest<T>(endpoint: string, payload: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      // Optional: Add 'HTTP-Referer' and 'X-Title' headers as recommended by OpenRouter
    };

    if (!this.apiKey) {
      throw new Error(
        "[OpenRouterService] Cannot send request: API Key is missing."
      );
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await this.handleApiError(response);
        // This line is technically unreachable as handleApiError always throws
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof OpenRouterApiError) {
        throw error; // Re-throw specific API errors
      } else if (error instanceof Error) {
        // Log and throw a generic communication error
        console.error(
          `[OpenRouterService] Network or unexpected error: ${error.message}`,
          error
        );
        throw new Error(
          `Failed to communicate with OpenRouter API: ${error.message}`
        );
      } else {
        // Handle rare non-Error throwables
        console.error(`[OpenRouterService] Unknown error occurred:`, error);
        throw new Error(
          "An unknown error occurred while communicating with OpenRouter API."
        );
      }
    }
  }

  /**
   * Parses an error response from the API and throws a structured OpenRouterApiError.
   * @param response The raw Response object from the fetch call.
   * @throws {OpenRouterApiError} Always throws after parsing the error details.
   */
  private async handleApiError(response: Response): Promise<void> {
    let errorData: unknown = null;
    let errorMessage = `HTTP error ${response.status}`;
    let errorCode: string | null = null;

    try {
      errorData = await response.json();
      if (typeof errorData === "object" && errorData !== null) {
        // Attempt to extract details from common error structures
        const potentialError = errorData as {
          error?: { message?: string; code?: string };
          message?: string;
          code?: string;
        };
        errorMessage =
          potentialError.error?.message ||
          potentialError.message ||
          `HTTP error ${response.status}`; // Fallback
        errorCode = potentialError.error?.code || potentialError.code || null;
      }
    } catch {
      // If JSON parsing fails, use response text
      try {
        errorMessage = await response.text();
      } catch {
        errorMessage = `HTTP error ${response.status} (Failed to read error body)`;
      }
      errorData = { message: errorMessage };
    }

    console.error(
      `[OpenRouterService] API Error: ${response.status} ${
        response.statusText
      }. Code: ${errorCode || "N/A"}. Message: ${errorMessage}`,
      errorData
    );

    throw new OpenRouterApiError(
      errorMessage,
      response.status,
      errorCode,
      errorData
    );
  }
}
