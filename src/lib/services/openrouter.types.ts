/**
 * Configuration options for the OpenRouterService.
 */
export interface OpenRouterServiceConfig {
  apiKey: string;
  baseURL?: string; // Optional, defaults to https://openrouter.ai/api/v1
}

/**
 * Represents a message in the chat conversation (compatible with OpenRouter/OpenAI API).
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  // Other fields supported by the API (e.g., 'name') can be added here.
}

/**
 * Represents the JSON schema definition for structured responses (as required by OpenRouter).
 */
export interface JsonSchema {
  name: string;
  strict?: boolean; // Defaults to false according to OpenRouter docs, but true is recommended
  schema: object; // JSON schema definition object
}

/**
 * Specifies the desired response format.
 */
export interface ResponseFormat {
  type: "json_schema";
  json_schema: JsonSchema;
}

/**
 * Parameters for the chat completion request.
 */
export interface ChatCompletionParams {
  model: string; // Required
  messages: ChatMessage[]; // Required
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?: ResponseFormat;
  stream?: boolean; // Whether to use streaming (out of scope for this initial plan)
  // Other parameters supported by OpenRouter and the specific model
}

/**
 * Represents a successful chat completion response from the API.
 */
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
    // May include logprobs, etc.
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  // Other fields returned by the API
}
