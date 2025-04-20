# Przewodnik Implementacji Usługi OpenRouter

Ten dokument opisuje plan wdrożenia usługi `OpenRouterService` w aplikacji Next.js/TypeScript, która będzie komunikować się z API OpenRouter.ai.

## 1. Opis Usługi

`OpenRouterService` będzie stanowić abstrakcję nad API OpenRouter.ai, umożliwiając łatwe wysyłanie żądań do modeli językowych i odbieranie odpowiedzi. Usługa będzie odpowiedzialna za:

- Zarządzanie konfiguracją (klucz API, URL).
- Konstruowanie poprawnych żądań do API, w tym formatowanie wiadomości, parametrów i opcjonalnego schematu odpowiedzi JSON.
- Wysyłanie żądań HTTP do API OpenRouter.
- Parsowanie odpowiedzi (sukcesu i błędów).
- Centralną obsługę błędów.

Usługa będzie zlokalizowana w `./src/lib/services/openrouter.service.ts`.

## 2. Opis Konstruktora

Konstruktor usługi powinien inicjalizować podstawową konfigurację.

```typescript
// src/lib/services/openrouter.service.ts

interface OpenRouterServiceConfig {
  apiKey: string;
  baseURL?: string; // Opcjonalnie, domyślnie https://openrouter.ai/api/v1
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(config?: OpenRouterServiceConfig) {
    this.apiKey = config?.apiKey ?? process.env.OPENROUTER_API_KEY ?? "";
    this.baseURL = config?.baseURL ?? "https://openrouter.ai/api/v1";

    if (!this.apiKey) {
      console.error(
        "OpenRouter API Key is missing. Provide it via config or OPENROUTER_API_KEY env variable."
      );
      // Rozważ rzucenie błędu konfiguracyjnego, jeśli klucz jest absolutnie wymagany do działania
      // throw new Error('Missing OpenRouter API Key');
    }
  }

  // ... reszta implementacji
}
```

Klucz API powinien być ładowany ze zmiennych środowiskowych (`OPENROUTER_API_KEY`) jako domyślna metoda. Należy unikać hardkodowania klucza.

## 3. Publiczne Metody i Pola

Główną publiczną metodą będzie metoda do wysyłania żądania do API czatu.

```typescript
// src/lib/services/openrouter.service.ts

// Typy dla wiadomości (zgodne z API OpenRouter/OpenAI)
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  // Można dodać inne pola, jeśli API je obsługuje, np. 'name'
}

// Typ dla schematu JSON (zgodnie z wymaganiami OpenRouter)
export interface JsonSchema {
  name: string;
  strict?: boolean; // Domyślnie false wg OpenRouter, ale zalecane true
  schema: object; // Definicja schematu JSON
}

// Typ dla formatu odpowiedzi
export interface ResponseFormat {
  type: "json_schema";
  json_schema: JsonSchema;
}

// Typ dla parametrów żądania
export interface ChatCompletionParams {
  model: string; // Wymagane
  messages: ChatMessage[]; // Wymagane
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?: ResponseFormat;
  stream?: boolean; // Czy używać streamingu (poza zakresem tego planu)
  // Inne parametry wspierane przez OpenRouter i dany model
}

// Typ dla odpowiedzi sukcesu
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
    // Może zawierać logprobs, itp.
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  // Inne pola zwracane przez API
}

export class OpenRouterService {
  // ... konstruktor ...

  /**
   * Wysyła żądanie ukończenia czatu do API OpenRouter.
   * @param params Parametry żądania, w tym model, wiadomości i opcjonalne ustawienia.
   * @returns Obiekt odpowiedzi z API lub rzuca błąd w przypadku niepowodzenia.
   */
  public async createChatCompletion(
    params: ChatCompletionParams
  ): Promise<ChatCompletionResponse> {
    // Implementacja zostanie opisana w planie
    // ...
  }

  // Potencjalnie inne metody publiczne, np. do listowania modeli (jeśli API wspiera)
}

// Instancja singleton może być przydatna (opcjonalnie)
// export const openRouterService = new OpenRouterService();
```

## 4. Prywatne Metody i Pola

Prywatne metody będą obsługiwać logikę wewnętrzną.

```typescript
// src/lib/services/openrouter.service.ts

import { OpenRouterApiError } from "@/lib/errors"; // Założenie istnienia pliku z błędami

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(config?: OpenRouterServiceConfig) {
    // ... implementacja konstruktora ...
  }

  public async createChatCompletion(
    params: ChatCompletionParams
  ): Promise<ChatCompletionResponse> {
    // ... implementacja metody publicznej ...
    // Wywołanie metody prywatnej do wysłania żądania
    return this.sendRequest<ChatCompletionResponse>(
      "/chat/completions",
      params
    );
  }

  /**
   * Prywatna metoda do wysyłania żądań do API OpenRouter.
   * @param endpoint Ścieżka endpointu API (np. /chat/completions).
   * @param payload Ciało żądania.
   * @returns Sparsowana odpowiedź JSON.
   */
  private async sendRequest<T>(endpoint: string, payload: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      // Można dodać inne nagłówki, np. 'HTTP-Referer', 'X-Title' jak sugeruje dokumentacja OpenRouter
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Obsługa błędów HTTP
        await this.handleApiError(response); // Rzuci błąd
      }

      // Parsowanie odpowiedzi sukcesu
      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof OpenRouterApiError) {
        // Przekazanie błędu API dalej
        throw error;
      } else if (error instanceof Error) {
        // Obsługa błędów sieciowych lub innych nieoczekiwanych
        console.error(
          `[OpenRouterService] Network or unexpected error: ${error.message}`,
          error
        );
        throw new Error(
          `Failed to communicate with OpenRouter API: ${error.message}`
        );
      } else {
        // Obsługa nieznanych błędów
        console.error(`[OpenRouterService] Unknown error occurred:`, error);
        throw new Error(
          "An unknown error occurred while communicating with OpenRouter API."
        );
      }
    }
  }

  /**
   * Prywatna metoda do obsługi i rzucania błędów API.
   * @param response Odpowiedź z fetch API.
   */
  private async handleApiError(response: Response): Promise<void> {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // Błąd parsowania JSON odpowiedzi błędu - użyj tekstu
      errorData = { message: await response.text() };
    }

    const errorMessage =
      errorData?.error?.message ||
      errorData?.message ||
      `HTTP error ${response.status}`;
    const errorCode = errorData?.error?.code || errorData?.code || null;

    console.error(
      `[OpenRouterService] API Error: ${response.status} ${response.statusText}. Message: ${errorMessage}`,
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
```

## 5. Obsługa Błędów

Błędy będą zarządzane centralnie przez metodę `handleApiError` oraz bloki try-catch w `sendRequest`.

- **Błędy Konfiguracji:** Sprawdzane w konstruktorze (brak klucza API).
- **Błędy Sieciowe:** Łapane w głównym bloku try-catch `sendRequest`. Logowane i rzucane jako generyczny błąd komunikacji.
- **Błędy API (4xx, 5xx):** Wykrywane przez sprawdzanie `response.ok`. Odpowiedź błędu jest parsowana (jeśli to JSON) i rzucany jest niestandardowy błąd `OpenRouterApiError` zawierający status, wiadomość, kod błędu (jeśli dostępny) i oryginalne dane błędu.
- **Niestandardowy Błąd:** Należy zdefiniować klasę `OpenRouterApiError`.

```typescript
// src/lib/errors/index.ts (lub dedykowany plik np. openrouter.error.ts)

/**
 * Niestandardowy błąd reprezentujący błędy zwrócone przez API OpenRouter.
 */
export class OpenRouterApiError extends Error {
  public readonly status: number;
  public readonly code: string | null;
  public readonly data?: any;

  constructor(
    message: string,
    status: number,
    code: string | null = null,
    data?: any
  ) {
    super(message);
    this.name = "OpenRouterApiError";
    this.status = status;
    this.code = code;
    this.data = data;

    // Utrzymanie poprawnego śladu stosu
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenRouterApiError);
    }
  }
}

// Można dodać inne specyficzne typy błędów w miarę potrzeb
```

## 6. Kwestie Bezpieczeństwa

- **Klucz API:** Najważniejszy element. Musi być przechowywany bezpiecznie jako zmienna środowiskowa (`OPENROUTER_API_KEY`) i **nigdy** nie może być ujawniony po stronie klienta (frontend). Usługa powinna działać wyłącznie po stronie serwera (np. w Next.js API Routes, Server Actions lub backendzie).
- **Walidacja Wejścia:** Chociaż OpenRouter API wykonuje walidację, warto rozważyć podstawową walidację parametrów wejściowych (np. obecność `model` i `messages`) w metodzie publicznej, aby szybko wykrywać błędy.
- **Rate Limiting:** Należy być świadomym limitów OpenRouter API. Implementacja logiki ponawiania (`retry`) z `exponential backoff` dla błędu 429 może być konieczna w środowiskach o dużym ruchu. (Poza zakresem podstawowego planu, ale warto zanotować).
- **Logowanie:** Należy uważać, aby nie logować wrażliwych danych (np. pełnych wiadomości użytkownika, jeśli zawierają dane osobowe) w logach produkcyjnych, chyba że jest to zgodne z polityką prywatności.

## 7. Plan Wdrożenia Krok po Kroku

1.  **Konfiguracja Środowiska:**
    - Dodaj zmienną `OPENROUTER_API_KEY` do pliku `.env.local` (dla dewelopmentu) i do zmiennych środowiskowych na platformie hostingowej (dla produkcji). Upewnij się, że plik `.env*.local` jest w `.gitignore`.
2.  **Struktura Plików:**
    - Utwórz plik dla usługi: `src/lib/services/openrouter.service.ts`.
    - Utwórz plik dla niestandardowych błędów: `src/lib/errors/index.ts` (lub `src/lib/errors/openrouter.error.ts`).
3.  **Definicja Typów:**
    - W pliku `openrouter.service.ts` zdefiniuj interfejsy/typy: `ChatMessage`, `JsonSchema`, `ResponseFormat`, `ChatCompletionParams`, `ChatCompletionResponse`, `OpenRouterServiceConfig`.
4.  **Implementacja Klasy Błędu:**
    - W pliku błędów zaimplementuj klasę `OpenRouterApiError` zgodnie z sekcją 5.
5.  **Implementacja Klasy Usługi:**
    - W `openrouter.service.ts` zaimplementuj klasę `OpenRouterService`.
    - **Konstruktor:** Zaimplementuj logikę ładowania konfiguracji (API Key, Base URL) zgodnie z sekcją 2.
    - **Metoda `handleApiError`:** Zaimplementuj prywatną metodę do obsługi błędów API zgodnie z sekcją 4.
    - **Metoda `sendRequest`:** Zaimplementuj prywatną metodę do wysyłania żądań HTTP POST za pomocą `fetch`, włączając ustawienie nagłówków, serializację payloadu, obsługę błędów (wywołanie `handleApiError` i łapanie błędów sieciowych) oraz parsowanie odpowiedzi sukcesu, zgodnie z sekcją 4.
    - **Metoda `createChatCompletion`:** Zaimplementuj publiczną metodę, która przyjmuje `ChatCompletionParams`, wykonuje podstawową walidację (np. sprawdza obecność `model` i `messages`) i wywołuje `sendRequest` z odpowiednim endpointem (`/chat/completions`) i parametrami, zgodnie z sekcją 3 i 4.
6.  **Użycie Usługi:**
    - W miejscach, gdzie potrzebna jest interakcja z OpenRouter (np. w Next.js API Route lub Server Action):
      - Zaimportuj `OpenRouterService`.
      - Utwórz instancję usługi: `const openRouter = new OpenRouterService();` (lub użyj instancji singleton, jeśli została zdefiniowana).
      - Przygotuj obiekt `ChatCompletionParams`, zawierający:
        - `model`: Nazwa modelu (np. `'google/gemini-pro-1.5-flash'`).
        - `messages`: Tablica obiektów `ChatMessage` (w tym `system` prompt, jeśli potrzebny).
        - Opcjonalnie: `temperature`, `max_tokens`.
        - Opcjonalnie: `response_format`, jeśli wymagany jest JSON. Przygotuj obiekt `JsonSchema` i zagnieźdź go w `response_format` zgodnie z przykładem w sekcji 3.3.
      - Wywołaj metodę:
        ```typescript
        try {
          const response = await openRouter.createChatCompletion(params);
          // Przetwarzaj odpowiedź sukcesu (response.choices[0].message.content)
          console.log(response.choices[0].message.content);
          // Jeśli użyto response_format, sparsuj content jako JSON
          if (params.response_format?.type === "json_schema") {
            try {
              const jsonData = JSON.parse(response.choices[0].message.content);
              // Przetwarzaj jsonData
            } catch (parseError) {
              console.error(
                "Failed to parse JSON response from LLM",
                parseError
              );
              // Obsłuż błąd parsowania
            }
          }
        } catch (error) {
          if (error instanceof OpenRouterApiError) {
            // Obsłuż błąd API (np. zwróć odpowiedni status HTTP klientowi)
            console.error(
              `API Error ${error.status}: ${error.message}`,
              error.data
            );
          } else {
            // Obsłuż inne błędy (sieciowe, konfiguracyjne)
            console.error("Service Error:", error.message);
          }
        }
        ```
7.  **Dokumentacja:**
    - Dodaj komentarze JSDoc do klasy usługi, metod publicznych i typów, wyjaśniając ich przeznaczenie i parametry.
    - Zaktualizuj ten przewodnik lub inną dokumentację projektu, jeśli pojawią się istotne zmiany podczas implementacji.

Postępując zgodnie z tym planem, developer powinien być w stanie sprawnie i poprawnie wdrożyć `OpenRouterService`, integrując aplikację z możliwościami oferowanymi przez OpenRouter.ai.
