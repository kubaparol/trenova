# Database Action Implementation Plan: completeTrainingSession

## 1. Przegląd Akcji

Ta akcja bazy danych (`completeTrainingSession`) zapisuje rekord ukończonej sesji treningowej w tabeli `training_sessions` dla **aktualnie uwierzytelnionego** użytkownika. Przyjmuje ona identyfikator planu (`plan_id`), nazwę ukończonego dnia (`plan_day_name`) oraz czas trwania sesji (`duration_seconds`). Akcja jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Action) i **sama tworzy instancję klienta Supabase po stronie serwera**.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/training-sessions/complete.ts`
- **Nazwa Funkcji:** `completeTrainingSession`
- **Argumenty:**
  - `input`: `CompleteTrainingSessionInput` (obiekt zawierający):
    - `plan_id`: `string` (UUID planu treningowego, do którego należy sesja)
    - `plan_day_name`: `string` (Nazwa konkretnego dnia planu, który został ukończony)
    - `duration_seconds`: `number` (Całkowity czas trwania sesji w sekundach)
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`. Rzuca błąd `Error("Unauthorized")`, jeśli użytkownik nie jest uwierzytelniony.
- **Walidacja:** Funkcja jest odpowiedzialna za walidację danych wejściowych `input` za pomocą Zod. Rzuca `Error("Invalid input: [szczegóły błędu]")`, jeśli walidacja nie powiedzie się (np. `duration_seconds <= 0`).

## 3. Wykorzystywane typy

- **Input Type:** `src/types/api.ts#CompleteTrainingSessionInput`
- **Output Type (Success):** `src/types/api.ts#CompleteTrainingSessionOutput`
- **Database Model:** `src/db/database.types.ts#Tables<'training_sessions'>`
- **Supabase Client:** `SupabaseClient` (z `@/db/supabase.server`)
- **Validation Schema:** Schemat Zod oparty na `CompleteTrainingSessionInput` (np. w `src/lib/validators/trainingSessionValidators.ts`).

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `CompleteTrainingSessionOutput`:
  ```typescript
  {
    id: string; // ID nowo utworzonego rekordu w training_sessions
    message: string; // Komunikat potwierdzający sukces (np. "Session completed successfully")
  }
  ```
- **Błędy:** W przypadku niepowodzenia, funkcja rzuca wyjątek (`Error`) z odpowiednim komunikatem:
  - `Error("Invalid input: [szczegóły błędu Zod]")`: Dane wejściowe nie przeszły walidacji Zod.
  - `Error("Unauthorized")`: Użytkownik nie jest zalogowany.
  - `Error("Plan not found or access denied")`: Plan o podanym `plan_id` nie istnieje lub użytkownik nie ma do niego dostępu (RLS).
  - `Error("Database error: [wiadomość błędu Supabase]")`: Wystąpił błąd podczas operacji `insert` na bazie danych.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej z argumentem `input` (`plan_id`, `plan_day_name`, `duration_seconds`).
2.  **Walidacja Danych Wejściowych:** Funkcja waliduje obiekt `input` przy użyciu odpowiedniego schematu Zod (w tym sprawdzenie `duration_seconds > 0`). Jeśli walidacja nie powiedzie się, rzuca `Error("Invalid input: ...")`.
3.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `await supabaseClient()` (zaimportowany z `@/db/supabase.server`).
4.  **Weryfikacja Uwierzytelnienia:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie. Jeśli wystąpi błąd lub `user` jest `null`, rzuca `Error("Unauthorized")`. Zapisuje `userId` dla dalszych kroków.
5.  **(Opcjonalnie, ale zalecane) Weryfikacja Dostępu do Planu:** Wykonaj zapytanie `select` na `training_plans`, filtrując po `input.plan_id` i `user_id` pobranym w kroku 4. `supabase.from('training_plans').select('id').eq('id', input.plan_id).maybeSingle()`. Jeśli wynikiem jest `error` lub `data` jest `null`, rzuć `Error("Plan not found or access denied")`. To zapobiega błędom FK i zapewnia, że użytkownik rzeczywiście "widzi" plan, do którego próbuje zapisać sesję, zanim nastąpi próba zapisu.
6.  **Przygotowanie Danych do Zapisu:** Tworzy obiekt do wstawienia do tabeli `training_sessions`, zawierający:
    - `user_id`: Pobrany z `auth.getUser()`.
    - `plan_id`: Z `input.plan_id`.
    - `plan_day_name`: Z `input.plan_day_name`.
    - `duration_seconds`: Z `input.duration_seconds`.
    - `completed_at`: Aktualny timestamp (`new Date().toISOString()`).
7.  **Operacja Zapisu w Bazie Danych:** Wykonuje zapytanie do Supabase przy użyciu utworzonego klienta:
    `supabase.from('training_sessions').insert(dataToInsert).select('id').single()`
8.  **Sprawdzenie Wyniku Zapisu:** Analizowany jest wynik operacji `insert()`:
    - Jeśli `error` istnieje, analizuj błąd. Jeśli jest to błąd naruszenia klucza obcego dla `plan_id` (kod `23503` z ograniczeniem `fk_plan_id`), rzuć `Error("Plan not found")` (na wypadek, gdyby opcjonalny krok 5 nie został zaimplementowany). W przeciwnym razie rzucany jest generyczny `Error("Database error: ${error.message}")`.
    - Jeśli `data` jest `null` (co nie powinno się zdarzyć przy sukcesie `insert().select().single()` z poprawnym RLS i FK), rzucany jest `Error("Database error: Failed to retrieve inserted session ID")`.
9.  **Formatowanie Wyniku:** Tworzy obiekt `CompleteTrainingSessionOutput` z `id` zwróconym przez bazę danych i komunikatem sukcesu.
10. **Zwrot Wyniku:** Funkcja zwraca obiekt `CompleteTrainingSessionOutput` lub rzuca wyjątek w przypadku błędu.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Weryfikowane na początku funkcji przez `supabase.auth.getUser()`.
- **Autoryzacja (RLS):**
  - Polityka RLS Supabase `"Allow individual user to insert own sessions"` (`WITH CHECK (auth.uid() = user_id)`) zapewnia, że użytkownik może wstawiać sesje tylko dla swojego `user_id`. Funkcja musi poprawnie przekazać `userId` pobrany z `auth.getUser()` podczas zapisu.
  - Opcjonalna weryfikacja dostępu do planu (krok 5 przepływu danych) dodatkowo potwierdza, że użytkownik ma uprawnienia do odczytu planu, zanim spróbuje zapisać sesję.
  - Klucz obcy `plan_id` i polityka RLS na `training_plans` zapewniają integralność referencyjną.
- **Walidacja Danych Wejściowych:** Rygorystyczna walidacja `input` za pomocą Zod jest kluczowa dla zapobiegania błędom i zapewnienia spójności danych.
- **Tworzenie Klienta:** Funkcja musi używać `createServerSupabaseClient` lub odpowiednika dla kontekstu serwerowego.

## 7. Obsługa Błędów

- **Błędy Walidacji:** Rzucany `Error("Invalid input: ...")` z komunikatem Zod.
- **Błędy Uwierzytelnienia:** Rzucany `Error("Unauthorized")`.
- **Błędy Dostępu/Nieznalezienia Planu:** Rzucany `Error("Plan not found or access denied")` (z opcjonalnego kroku 5 lub analizy błędu FK).
- **Błędy Bazy Danych:** Błędy z Supabase rzucane jako `Error("Database error: ...")`.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. Server Action) jest odpowiedzialny za przechwycenie (`try...catch`) wyjątków rzucanych przez tę akcję i przetłumaczenie ich na odpowiednie odpowiedzi dla klienta (np. kody statusu HTTP 400, 401, 404, 500, komunikaty o błędach).

## 8. Rozważania dotyczące Wydajności

- **Wywołania Bazy Danych:** Akcja wykonuje zazwyczaj jedno zapytanie `insert` (i opcjonalnie jedno `select`). Są to zazwyczaj szybkie operacje, zwłaszcza gdy bazują na kluczach głównych i indeksowanych kluczach obcych.
- **Walidacja:** Walidacja Zod jest szybka.
- **Synchroniczność:** Akcja jest asynchroniczna (zwraca `Promise`). Kod wywołujący musi czekać na jej zakończenie.

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/training-sessions/complete.ts`.
2.  **Utworzenie Walidatora (jeśli nie istnieje):** W `src/lib/validators/trainingSessionValidators.ts` (lub podobnym pliku) zdefiniuj schemat Zod dla `CompleteTrainingSessionInput`, w tym regułę dla `duration_seconds`.
3.  **Importy:** Dodaj niezbędne importy: `supabaseClient` z `@/db/supabase.server`, typy `CompleteTrainingSessionInput`, `CompleteTrainingSessionOutput` z `@/types/api`, schemat walidacji Zod.
4.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `completeTrainingSession` przyjmującą `input: CompleteTrainingSessionInput` i zwracającą `Promise<CompleteTrainingSessionOutput>`.
5.  **Implementacja Walidacji:** Dodaj walidację `input` za pomocą `zodSchema.parse(input)` w bloku `try...catch`, rzucając `Error("Invalid input: ...")` w razie błędu.
6.  **Implementacja Tworzenia Klienta Supabase:** Dodaj `const supabase = await supabaseClient();`.
7.  **Implementacja Weryfikacji Uwierzytelnienia:** Dodaj logikę `supabase.auth.getUser()` i rzucenia `Error("Unauthorized")`. Zapisz `userId`.
8.  **(Opcjonalnie) Implementacja Weryfikacji Dostępu do Planu:** Dodaj zapytanie `select` na `training_plans` i rzuć `Error("Plan not found or access denied")`, jeśli plan nie zostanie znaleziony lub wystąpi błąd.
9.  **Implementacja Zapisu do Bazy Danych:**
    - Przygotuj obiekt `dataToInsert` z `userId`, danymi z `input` i `completed_at`.
    - Wywołaj `supabase.from('training_sessions').insert(dataToInsert).select('id').single()`.
    - Sprawdź `error` i `data` z wyniku. Rzuć odpowiednie błędy bazy danych (w tym potencjalny błąd FK dla `plan_id`, jeśli krok 8 nie został zaimplementowany).
10. **Implementacja Zwracania Sukcesu:** Jeśli wszystko się powiodło, utwórz i zwróć obiekt `CompleteTrainingSessionOutput` z `data.id` i komunikatem sukcesu.
11. **Typowanie i Komentarze JSDoc:** Upewnij się, że funkcja jest poprawnie otypowana i zawiera JSDoc opisujący jej działanie, argumenty, zwracaną wartość i rzucane błędy.
