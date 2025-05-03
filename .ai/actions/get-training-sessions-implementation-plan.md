# Database Action Implementation Plan: getTrainingSessions

## 1. Przegląd Akcji

Ta akcja bazy danych (`getTrainingSessions`) pobiera historię ukończonych sesji treningowych (`training_sessions`) dla **aktualnie uwierzytelnionego** użytkownika, wraz z paginacją i nazwą powiązanego planu treningowego. Akcja jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Action, Server Component) i **sama tworzy instancję klienta Supabase po stronie serwera**.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/training-sessions/get-sessions.ts`
- **Nazwa Funkcji:** `getTrainingSessions`
- **Argumenty:**
  - `input`: `GetTrainingSessionsInput` (opcjonalny obiekt zawierający):
    - `page`: `number` (opcjonalny, domyślnie 1)
    - `limit`: `number` (opcjonalny, domyślnie 10)
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera (`createServerSupabaseClient`) i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`. Rzuca błąd `Error("Unauthorized")`, jeśli użytkownik nie jest uwierzytelniony.
- **Walidacja:** Funkcja wewnętrznie waliduje parametry `page` i `limit`. Ustawia wartości domyślne, jeśli nie zostały podane. Sprawdza, czy są to dodatnie liczby całkowite. Rzuca `Error("Invalid input: ...")`, jeśli walidacja się nie powiedzie. Rozważane jest również nałożenie górnego limitu na `limit` (np. 100).

## 3. Wykorzystywane typy

- **Input Type:** `src/types/api.ts#GetTrainingSessionsInput`
- **Output Type (Success):** `src/types/api.ts#TrainingSessionListOutput`
- **Nested Output Type:** `src/types/api.ts#TrainingSessionListItem`
- **Database Models:** `src/db/database.types.ts#Tables<'training_sessions'>`, `src/db/database.types.ts#Tables<'training_plans'>` (do złączenia)
- **Supabase Client:** `SupabaseClient` (z `@/db/supabase.server`)

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `TrainingSessionListOutput`, zawierający:

  ```typescript
  type TrainingSessionListOutput = {
    items: TrainingSessionListItem[]; // Tablica sesji
    total: number; // Całkowita liczba sesji użytkownika
    page: number; // Aktualny numer strony
    limit: number; // Limit wyników na stronie
  };

  type TrainingSessionListItem = Pick<
    Tables<"training_sessions">,
    "id" | "completed_at" | "plan_day_name" | "duration_seconds" | "plan_id"
  > & { plan_name?: string }; // Nazwa planu dołączona z training_plans
  ```

- **Błędy:** W przypadku niepowodzenia, funkcja rzuca wyjątek (`Error`) z odpowiednim komunikatem:
  - `Error("Unauthorized")`: Użytkownik nie jest zalogowany.
  - `Error("Invalid input: Page must be a positive integer.")`: Nieprawidłowa wartość `page`.
  - `Error("Invalid input: Limit must be a positive integer.")`: Nieprawidłowa wartość `limit`.
  - `Error("Invalid input: Limit cannot exceed [max_limit].")`: Przekroczono maksymalny limit (jeśli zaimplementowano).
  - `Error("Database error: [wiadomość błędu Supabase]")`: Wystąpił błąd podczas operacji `select` na bazie danych.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej z opcjonalnym argumentem `input`.
2.  **Walidacja i Domyślne Wartości:**
    - Sprawdź `input.page`. Jeśli podane, musi być dodatnią liczbą całkowitą. Jeśli nie podane lub `null`/`undefined`, użyj `1`.
    - Sprawdź `input.limit`. Jeśli podane, musi być dodatnią liczbą całkowitą (i opcjonalnie <= `max_limit`). Jeśli nie podane lub `null`/`undefined`, użyj `10`.
    - Rzuć odpowiedni `Error("Invalid input: ...")` w razie błędu walidacji.
    - Oblicz `offset`: `(page - 1) * limit`.
3.  **Utworzenie Klienta Supabase:** Wywołaj `await createServerSupabaseClient()`.
4.  **Weryfikacja Uwierzytelnienia:** Wywołaj `supabase.auth.getUser()`. Jeśli wystąpi błąd lub `user` jest `null`, rzuć `Error("Unauthorized")`. Zapisz `userId`.
5.  **Wykonanie Zapytania do Bazy Danych:** Wykonaj zapytanie do Supabase:
    ```javascript
    const { data, error, count } = await supabase
      .from("training_sessions")
      .select(
        `
        id,
        completed_at,
        plan_day_name,
        duration_seconds,
        plan_id,
        training_plans!inner ( name ) 
      `,
        { count: "exact" }
      ) // Pobierz całkowitą liczbę pasujących rekordów
      .eq("user_id", userId) // Jawne filtrowanie po user_id (RLS też to robi)
      .order("completed_at", { ascending: false }) // Sortuj od najnowszych
      .range(offset, offset + limit - 1); // Zastosuj paginację
    ```
    _Uwaga:_ Użycie `training_plans!inner ( name )` zakłada, że relacja jest poprawnie skonfigurowana w Supabase. Alternatywnie, można użyć jawnego `.select('..., training_plans(name)')`. `!inner` gwarantuje, że sesje bez powiązanego planu (co nie powinno mieć miejsca) nie zostaną zwrócone.
6.  **Obsługa Błędów Zapytania:** Jeśli `error` istnieje, rzuć `Error("Database error: ${error.message}")`.
7.  **Weryfikacja Danych:** Jeśli nie było błędu, ale `data` jest `null` (co jest mało prawdopodobne przy sukcesie, ale bezpiecznie sprawdzić), rzuć `Error("Database error: Failed to retrieve sessions")`. `count` również powinno być dostępne (>= 0).
8.  **Mapowanie Wyników:** Przekształć tablicę `data` (która zawiera obiekty z zagnieżdżonym `{ training_plans: { name: '...' } }`) na format `TrainingSessionListItem[]`. Dla każdego elementu `session` w `data`:
    - Utwórz nowy obiekt `TrainingSessionListItem`.
    - Skopiuj pola `id`, `completed_at`, `plan_day_name`, `duration_seconds`, `plan_id`.
    - Ustaw `plan_name` na `session.training_plans.name`. Obsłuż przypadek, gdyby `training_plans` było `null` (choć `!inner` powinien temu zapobiec).
9.  **Konstrukcja Odpowiedzi:** Stwórz obiekt `TrainingSessionListOutput`:
    - `items`: Wynik mapowania z kroku 8.
    - `total`: Wartość `count` zwrócona przez Supabase (upewnij się, że nie jest `null`, domyślnie 0).
    - `page`: Zweryfikowana wartość `page` z kroku 2.
    - `limit`: Zweryfikowana wartość `limit` z kroku 2.
10. **Zwrot Wyniku:** Zwróć obiekt `TrainingSessionListOutput`.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Weryfikowane na początku przez `supabase.auth.getUser()`.
- **Autoryzacja (RLS):** Polityka RLS `"Allow individual user access to own sessions"` jest głównym mechanizmem zapewniającym, że użytkownik widzi tylko swoje sesje. Jawny filtr `.eq("user_id", userId)` dodaje warstwę pewności i przejrzystości.
- **Walidacja Danych Wejściowych:** Walidacja parametrów `page` i `limit` zapobiega błędom i potencjalnemu nadużyciu (np. żądanie zbyt dużej liczby rekordów, jeśli nie ma górnego limitu).
- **Ekspozycja Danych:** Zapytanie `select` precyzyjnie określa zwracane pola, w tym tylko nazwę z powiązanego planu, minimalizując ekspozycję danych.

## 7. Obsługa Błędów

- **Błędy Walidacji:** Rzucane jako `Error("Invalid input: ...")`.
- **Błędy Uwierzytelnienia:** Rzucany `Error("Unauthorized")`.
- **Błędy Bazy Danych:** Błędy z Supabase rzucane jako `Error("Database error: ...")`.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. Server Action, Server Component) jest odpowiedzialny za przechwycenie (`try...catch`) wyjątków rzucanych przez tę akcję i przetłumaczenie ich na odpowiednie odpowiedzi dla użytkownika lub logikę interfejsu (np. komunikaty o błędach).

## 8. Rozważania dotyczące Wydajności

- **Zapytanie Bazy Danych:** Akcja wykonuje jedno zapytanie SQL, które obejmuje złączenie (`join`), filtrowanie (`where`), sortowanie (`order by`) i paginację (`limit`, `offset`).
- **Indeksy:** Kluczowe znaczenie ma indeks `idx_training_sessions_user_completed_at` (dla `WHERE user_id = ? ORDER BY completed_at DESC`). Indeks `idx_training_sessions_plan_id` (lub indeks na `training_plans.id`, który jest PK) wspiera wydajność złączenia.
- **Paginacja:** Użycie `range()` i `count: 'exact'` jest standardowym i wydajnym sposobem implementacji paginacji w Supabase/PostgreSQL.

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/training-sessions/get-sessions.ts`.
2.  **Importy:** Dodaj niezbędne importy: `createServerSupabaseClient` z `@/db/supabase.server`, typy `GetTrainingSessionsInput`, `TrainingSessionListOutput`, `TrainingSessionListItem`, `Tables` z `@/types/api` i `@/db/database.types`.
3.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `getTrainingSessions` przyjmującą `input: GetTrainingSessionsInput` (lub czyniąc ją opcjonalną) i zwracającą `Promise<TrainingSessionListOutput>`.
4.  **Implementacja Walidacji:** Dodaj logikę walidacji `page` i `limit`, ustawiania domyślnych wartości, obliczania `offset` i rzucania błędów `Invalid input`.
5.  **Implementacja Tworzenia Klienta Supabase:** Dodaj `const supabase = await createServerSupabaseClient();`.
6.  **Implementacja Weryfikacji Uwierzytelnienia:** Dodaj logikę `supabase.auth.getUser()` i rzucenia `Error("Unauthorized")`. Zapisz `userId`.
7.  **Implementacja Zapytania Supabase:** Skonstruuj i wykonaj zapytanie `.select()` z odpowiednimi kolumnami (w tym złączoną nazwą planu), filtrowaniem `.eq()`, sortowaniem `.order()` i paginacją `.range()`, a także opcją `{ count: 'exact' }`.
8.  **Implementacja Obsługi Błędów Zapytania:** Sprawdź `error` z wyniku zapytania i rzuć `Error("Database error: ...")`.
9.  **Implementacja Weryfikacji Danych:** Sprawdź, czy `data` i `count` nie są `null`.
10. **Implementacja Mapowania Wyników:** Przetwórz tablicę `data`, mapując ją na format `TrainingSessionListItem[]` i poprawnie wyodrębniając `plan_name`.
11. **Implementacja Konstrukcji Odpowiedzi:** Stwórz obiekt `TrainingSessionListOutput` z `items`, `total`, `page`, `limit`.
12. **Implementacja Zwracania Sukcesu:** Zwróć finalny obiekt `TrainingSessionListOutput`.
13. **Typowanie i Komentarze JSDoc:** Upewnij się, że funkcja jest poprawnie otypowana i zawiera JSDoc opisujący jej działanie, argumenty, zwracaną wartość i rzucane błędy.
14. **Konfiguracja (jeśli dotyczy):** Ustaw ewentualny `MAX_LIMIT` jako stałą.
