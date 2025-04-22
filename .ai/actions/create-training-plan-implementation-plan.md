# Database Action Implementation Plan: createTrainingPlan

## 1. Przegląd Akcji

Ta akcja bazy danych (`createTrainingPlan`) tworzy nowy plan treningowy dla **aktualnie uwierzytelnionego** użytkownika. Wykorzystuje sztuczną inteligencję (za pośrednictwem OpenRouter.ai) do generowania szczegółów planu (`plan_details`) na podstawie preferencji użytkownika podanych jako argument. Akcja jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Component, Server Action, API Route Handler) i **sama tworzy instancję klienta Supabase po stronie serwera** oraz **wykonuje wywołanie do API AI**.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/training-plans/create.ts`
- **Nazwa Funkcji:** `createTrainingPlan`
- **Argumenty:**
  - `input`: `CreateTrainingPlanInput` (obiekt zawierający `name` i `preferences` dla nowego planu)
    - `name`: `string`
    - `preferences`: `TrainingPreferences` (obiekt zgodny z typem z `src/types/api.ts`)
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`. Rzuca błąd `Error("Unauthorized")`, jeśli użytkownik nie jest uwierzytelniony.
- **Walidacja:** Funkcja jest odpowiedzialna za walidację danych wejściowych `input` za pomocą Zod. Rzuca `Error("Invalid input: [szczegóły błędu]")`, jeśli walidacja nie powiedzie się.

## 3. Wykorzystywane typy

- **Input Type:** `src/types/api.ts#CreateTrainingPlanInput`
- **Nested Input Type:** `src/types/api.ts#TrainingPreferences`
- **Output Type (Success):** `src/types/api.ts#TrainingPlanDetailOutput`
- **Internal AI Types:** `src/types/api.ts#PlanDetails`, `PlanDay`, `Exercise`
- **Database Model:** `src/db/database.types.ts#Tables<'training_plans'>`
- **Supabase Client:** `SupabaseClient` (z `@/db/supabase.server`)
- **Validation Schema:** Schemat Zod oparty na `CreateTrainingPlanInput` (np. w `src/lib/validators/trainingPlanValidators.ts`).

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `TrainingPlanDetailOutput`, reprezentujący nowo utworzony plan treningowy pobrany z bazy danych.
  ```typescript
  // src/types/api.ts (fragment)
  type TrainingPlanDetailOutput = Pick<
    Tables<"training_plans">,
    "id" | "name" | "created_at" | "user_id"
  > & {
    plan_details: PlanDetails;
  };
  ```
- **Błędy:** W przypadku niepowodzenia, funkcja rzuca wyjątek (`Error`) z odpowiednim komunikatem:
  - `Error("Unauthorized")`: Użytkownik nie jest zalogowany.
  - `Error("Invalid input: [szczegóły błędu Zod]")`: Dane wejściowe nie przeszły walidacji Zod.
  - `Error("AI generation error: [powód]")`: Wystąpił błąd podczas komunikacji z OpenRouter.ai, parsowania odpowiedzi AI lub AI zwróciło błąd.
  - `Error("AI rate limit exceeded")`: Przekroczono limit zapytań do AI (jeśli informacja jest dostępna z odpowiedzi API AI).
  - `Error("Database error: [wiadomość błędu Supabase]")`: Wystąpił błąd podczas operacji `insert` na bazie danych.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej z argumentem `input` (`name` i `preferences`).
2.  **Walidacja Danych Wejściowych:** Funkcja waliduje obiekt `input` przy użyciu odpowiedniego schematu Zod. Jeśli walidacja nie powiedzie się, rzuca `Error("Invalid input: ...")`.
3.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `await supabaseClient()` (zaimportowany z `@/db/supabase.server`).
4.  **Weryfikacja Uwierzytelnienia:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie. Jeśli wystąpi błąd lub `user` jest `null`, rzuca `Error("Unauthorized")`. Zapisuje `userId` dla dalszych kroków.
5.  **Konstrukcja Promptu AI:** Funkcja konstruuje bezpieczny prompt dla modelu AI (w OpenRouter.ai) na podstawie zweryfikowanych `input.preferences`.
6.  **Wywołanie API AI:** Funkcja wysyła żądanie do OpenRouter.ai (używając `fetch` lub dedykowanego klienta, odczytując klucz API ze zmiennych środowiskowych).
7.  **Obsługa Błędów AI:** Przechwytuje błędy sieciowe, błędy odpowiedzi (statusy inne niż 2xx), błędy rate limiting (np. status 429). Rzuca odpowiedni `Error("AI generation error: ...")` lub `Error("AI rate limit exceeded")`.
8.  **Przetwarzanie Odpowiedzi AI:** Parsuje odpowiedź AI. Waliduje strukturę odpowiedzi, aby upewnić się, że pasuje do oczekiwanego formatu `PlanDetails` (np. za pomocą Zod lub ręcznej weryfikacji). Jeśli parsowanie lub walidacja struktury zawiodą, rzuca `Error("AI generation error: Invalid response structure")`.
9.  **Przygotowanie Danych do Zapisu:** Tworzy obiekt do wstawienia do tabeli `training_plans`, zawierający:
    - `user_id`: Pobrany z `auth.getUser()`.
    - `name`: Z `input.name`.
    - `plan_details`: Sparsowana i zweryfikowana odpowiedź AI (w formacie JSONB).
10. **Operacja Zapisu w Bazie Danych:** Wykonuje zapytanie do Supabase przy użyciu utworzonego klienta:
    `supabase.from('training_plans').insert(dataToInsert).select().single()`
11. **Sprawdzenie Wyniku Zapisu:** Analizowany jest wynik operacji `insert()`:
    - Jeśli `error` istnieje, rzucany jest `Error(\"Database error: \${error.message}\")`.
    - Jeśli `data` jest `null` (co nie powinno się zdarzyć przy sukcesie `insert().select().single()` z poprawnym RLS), rzucany jest `Error("Database error: Failed to retrieve inserted plan")`.
12. **Formatowanie Wyniku:** Mapuje zwrócone `data` (obiekt `Tables<'training_plans'>`) na typ `TrainingPlanDetailOutput` (powinny być zgodne, ale jawna konwersja typu może być potrzebna).
13. **Zwrot Wyniku:** Funkcja zwraca obiekt `TrainingPlanDetailOutput` lub rzuca wyjątek w przypadku błędu.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Weryfikowane na początku funkcji przez `supabase.auth.getUser()`.
- **Autoryzacja (RLS):** Polityka RLS Supabase `"Allow individual user insert access for own plans"` zapewnia, że użytkownik może wstawiać plany tylko dla swojego `user_id`. Funkcja polega na tej polityce oraz na użyciu `userId` z `auth.getUser()` podczas zapisu.
- **Walidacja Danych Wejściowych:** Rygorystyczna walidacja `input` za pomocą Zod jest kluczowa dla zapobiegania błędom i zapewnienia spójności danych przekazywanych do AI i bazy danych.
- **Prompt Injection:** Należy zachować szczególną ostrożność przy konstruowaniu promptu AI na podstawie `input.preferences`, zwłaszcza pola `restrictions`. Traktować te dane jako parametry, a nie jako część wykonywalnych instrukcji promptu.
- **Ochrona Kluczy API:** Klucz API do OpenRouter.ai musi być bezpiecznie zarządzany jako zmienna środowiskowa po stronie serwera.
- **Rate Limiting (AI):** Funkcja powinna być przygotowana na obsługę błędów rate limiting z API AI (np. przez rzucenie specyficznego błędu). Implementacja samego mechanizmu rate limiting dla wywołań tej _akcji_ leży po stronie kodu ją wywołującego (np. w API Route Handlerze lub Server Action).

## 7. Obsługa Błędów

- **Błędy Walidacji:** Rzucany `Error("Invalid input: ...")` z komunikatem Zod.
- **Błędy Uwierzytelnienia:** Rzucany `Error("Unauthorized")`.
- **Błędy AI:** Rzucane jako `Error("AI generation error: ...")` lub `Error("AI rate limit exceeded")`.
- **Błędy Bazy Danych:** Błędy z Supabase rzucane jako `Error("Database error: ...")`.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. API Route Handler, Server Action) jest odpowiedzialny za przechwycenie (`try...catch`) wyjątków rzucanych przez tę akcję i przetłumaczenie ich na odpowiednie odpowiedzi dla klienta (np. kody statusu HTTP, komunikaty o błędach).

## 8. Rozważania dotyczące Wydajności

- **Wywołanie AI:** Jest to potencjalnie najdłuższy krok. Czas odpowiedzi zależy od modelu AI i złożoności generowania planu.
- **Wywołania Bazy Danych:** Operacja `insert` i `auth.getUser` są zazwyczaj szybkie.
- **Walidacja:** Walidacja Zod jest szybka.
- **Synchroniczność:** Akcja jest synchroniczna (zwraca `Promise`). Kod wywołujący musi czekać na jej zakończenie, co obejmuje czas oczekiwania na AI.

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/training-plans/create.ts`.
2.  **Importy:** Dodaj niezbędne importy: `supabaseClient` z `@/db/supabase.server`, typy `CreateTrainingPlanInput`, `TrainingPreferences`, `TrainingPlanDetailOutput`, `PlanDetails` itp. z `@/types/api`, schemat walidacji Zod z `src/lib/validators/...`.
3.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `createTrainingPlan` przyjmującą `input: CreateTrainingPlanInput` i zwracającą `Promise<TrainingPlanDetailOutput>`.
4.  **Implementacja Walidacji:** Dodaj walidację `input` za pomocą `zodSchema.parse(input)` w bloku `try...catch`, rzucając `Error("Invalid input: ...")` w razie błędu.
5.  **Implementacja Tworzenia Klienta Supabase:** Dodaj `const supabase = await supabaseClient();`.
6.  **Implementacja Weryfikacji Uwierzytelnienia:** Dodaj logikę `supabase.auth.getUser()` i rzucenia `Error("Unauthorized")`. Zapisz `userId`.
7.  **Implementacja Logiki AI:**
    - Skonstruuj prompt na podstawie `input.preferences`.
    - Wywołaj API OpenRouter.ai (np. przez `fetch`), odczytując klucz API ze zmiennych środowiskowych.
    - Obsłuż błędy odpowiedzi AI (sieciowe, statusy błędów, rate limit).
    - Sparsuj i zweryfikuj strukturę odpowiedzi AI. Rzuć błąd w przypadku problemów.
8.  **Implementacja Zapisu do Bazy Danych:**
    - Przygotuj obiekt `dataToInsert` z `userId`, `input.name`, `plan_details` (wynik AI).
    - Wywołaj `supabase.from('training_plans').insert(dataToInsert).select().single()`.
    - Sprawdź `error` i `data` z wyniku. Rzuć odpowiednie błędy bazy danych.
9.  **Implementacja Zwracania Sukcesu:** Jeśli wszystko się powiodło, dokonaj konwersji typu `data` na `TrainingPlanDetailOutput` (jeśli konieczne) i zwróć wynik.
10. **Typowanie i Komentarze JSDoc:** Upewnij się, że funkcja jest poprawnie otypowana i zawiera JSDoc opisujący jej działanie, argumenty, zwracaną wartość i rzucane błędy.
11. **Konfiguracja Zmiennych Środowiskowych:** Upewnij się, że `OPENROUTER_API_KEY` jest dostępna jako zmienna środowiskowa serwera.
