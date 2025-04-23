import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "./openrouter.service";
import { OpenRouterApiError } from "./openrouter.error";
import type { ChatCompletionParams, ChatMessage } from "./openrouter.types";

// Mock global fetch
const mockFetch = vi.fn();
// Define a type for the mock environment or use a more flexible approach
const mockProcessEnv: { [key: string]: string | undefined } = {
  OPENROUTER_API_KEY: "test-api-key",
};

vi.stubGlobal("fetch", mockFetch);
vi.stubGlobal("process", { env: mockProcessEnv });

describe("OpenRouterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.env mock
    mockProcessEnv.OPENROUTER_API_KEY = "test-api-key";
    // No need to re-stub process here if mockProcessEnv object is mutated directly
    // However, re-stubbing ensures consistency if the object reference changes
    vi.stubGlobal("process", { env: mockProcessEnv });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Re-stub for next test run
    vi.stubGlobal("fetch", mockFetch);
    vi.stubGlobal("process", { env: mockProcessEnv });
  });

  // Testy konstruktora
  describe("constructor", () => {
    it("should initialize with API key from config", () => {
      const config = { apiKey: "config-key", baseURL: "http://localhost" };
      const service = new OpenRouterService(config);
      // Internal properties are not directly testable without hacks,
      // so we infer correct initialization by successful requests later.
      // We can test the base URL if needed by having sendRequest expose it or through fetch calls.
      expect(service).toBeInstanceOf(OpenRouterService);
    });

    it("should initialize with API key from environment variable if config is missing", () => {
      mockProcessEnv.OPENROUTER_API_KEY = "env-key";
      vi.stubGlobal("process", { env: mockProcessEnv }); // Re-stub with new value
      const service = new OpenRouterService();
      expect(service).toBeInstanceOf(OpenRouterService);
      // Again, inferring API key usage from sendRequest tests
    });

    it("should use default base URL if not provided", () => {
      const service = new OpenRouterService({ apiKey: "some-key" });
      expect(service).toBeInstanceOf(OpenRouterService);
      // We will verify the URL in sendRequest tests
    });

    it("should initialize without throwing if API key is missing (logs error)", () => {
      // mockProcessEnv.OPENROUTER_API_KEY = undefined; // Set to undefined instead of delete
      // A bit more type-safe way to handle potential absence:
      const envWithoutKey: { [key: string]: string | undefined } = {
        ...mockProcessEnv,
      };
      delete envWithoutKey.OPENROUTER_API_KEY; // delete is fine on a plain object copy

      vi.stubGlobal("process", { env: envWithoutKey }); // Re-stub with the modified copy
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(() => new OpenRouterService()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[OpenRouterService] API Key is missing")
      );
      consoleSpy.mockRestore();
      // Restore stub for subsequent tests in this block if needed
      vi.stubGlobal("process", { env: mockProcessEnv });
    });
  });

  // Testy metody createChatCompletion
  describe("createChatCompletion", () => {
    let service: OpenRouterService;
    const validParams: ChatCompletionParams = {
      model: "test-model",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(() => {
      mockProcessEnv.OPENROUTER_API_KEY = "test-api-key";
      vi.stubGlobal("process", { env: mockProcessEnv });
      service = new OpenRouterService();
    });

    it("should throw an error if model is missing", async () => {
      // Use Partial<ChatCompletionParams> for incomplete objects
      const params: Partial<ChatCompletionParams> = {
        messages: [{ role: "user", content: "Hi" }],
      };
      // Cast to ChatCompletionParams for the function call if necessary,
      // though testing the runtime check is the goal.
      await expect(
        service.createChatCompletion(params as ChatCompletionParams)
      ).rejects.toThrow(
        "[OpenRouterService] Missing required parameter: model"
      );
    });

    it("should throw an error if messages are missing or empty", async () => {
      const paramsNoMessages: Partial<ChatCompletionParams> = { model: "test" };
      const paramsEmptyMessages: ChatCompletionParams = {
        model: "test",
        messages: [],
      };

      await expect(
        service.createChatCompletion(paramsNoMessages as ChatCompletionParams)
      ).rejects.toThrow(
        "[OpenRouterService] Missing required parameter: messages"
      );
      await expect(
        service.createChatCompletion(paramsEmptyMessages)
      ).rejects.toThrow(
        "[OpenRouterService] Missing required parameter: messages"
      );
    });

    it("should throw an error if API key is missing when making the request", async () => {
      // mockProcessEnv.OPENROUTER_API_KEY = undefined; // Set to undefined
      const envWithoutKey: { [key: string]: string | undefined } = {
        ...mockProcessEnv,
      };
      delete envWithoutKey.OPENROUTER_API_KEY; // delete is fine on a plain object copy
      vi.stubGlobal("process", { env: envWithoutKey }); // Stub before creating service

      const serviceWithoutKey = new OpenRouterService(); // Create service instance *after* modifying env
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {}); // Suppress constructor warning

      await expect(
        serviceWithoutKey.createChatCompletion(validParams)
      ).rejects.toThrow(
        "[OpenRouterService] Cannot send request: API Key is missing."
      );
      consoleSpy.mockRestore();
      // Restore stub for subsequent tests
      vi.stubGlobal("process", { env: mockProcessEnv });
    });

    it("should make a POST request to the correct URL with correct headers and body", async () => {
      const mockResponse = {
        id: "chatcmpl-123",
        choices: [],
        created: 1677652288,
        model: "test-model",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await service.createChatCompletion(validParams);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validParams),
        }
      );
    });

    it("should return the chat completion response on successful API call", async () => {
      const mockResponseData = {
        id: "chatcmpl-123",
        choices: [
          {
            message: { role: "assistant", content: "Hi there!" } as ChatMessage,
            finish_reason: "stop",
            index: 0,
          },
        ],
        created: 1677652288,
        model: "test-model",
        object: "chat.completion",
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const result = await service.createChatCompletion(validParams);

      expect(result).toEqual(mockResponseData);
    });

    it("should throw OpenRouterApiError on API error response (non-ok status)", async () => {
      const errorResponse = {
        error: { message: "Invalid API key", code: "invalid_api_key" },
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => errorResponse,
        text: async () => JSON.stringify(errorResponse), // Provide text fallback
      });

      await expect(
        service.createChatCompletion(validParams)
      ).rejects.toThrowError(
        new OpenRouterApiError(
          "Invalid API key",
          401,
          "invalid_api_key",
          errorResponse
        )
      );
    });

    it("should throw OpenRouterApiError with details from different error structures", async () => {
      const errorResponse = { message: "Rate limit exceeded" }; // Different structure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => errorResponse,
        text: async () => JSON.stringify(errorResponse),
      });

      await expect(
        service.createChatCompletion(validParams)
      ).rejects.toThrowError(
        new OpenRouterApiError("Rate limit exceeded", 429, null, errorResponse)
      );
    });

    it("should throw OpenRouterApiError when API returns non-JSON error", async () => {
      const errorText = "Internal Server Error";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => {
          throw new Error("Not JSON");
        }, // Simulate JSON parse failure
        text: async () => errorText,
      });

      await expect(
        service.createChatCompletion(validParams)
      ).rejects.toThrowError(
        new OpenRouterApiError(errorText, 500, null, { message: errorText })
      );
    });

    it("should throw a generic error on network failure", async () => {
      const networkError = new Error("Network connection lost");
      mockFetch.mockRejectedValueOnce(networkError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(service.createChatCompletion(validParams)).rejects.toThrow(
        `Failed to communicate with OpenRouter API: ${networkError.message}`
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Network or unexpected error"),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
