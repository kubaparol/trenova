# Database Action Implementation Plan: getTrainingPlanById

## 1. Przegląd Akcji

Ta akcja bazy danych (`getTrainingPlanById`) pobiera **szczegółowe dane** pojedynczego planu treningowego na podstawie jego unikalnego identyfikatora (`id`). Jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Component, Server Action) i **sama tworzy instancję klienta Supabase po stronie serwera**, aby zapewnić pobranie planu należącego do **aktualnie uwierzytelnionego** użytkownika.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/training-plans/get-by-id.ts`
- **Argumenty:**
  - `input`: `GetTrainingPlanInput` (obiekt zawierający ID planu)
    - `id`: `string` (UUID planu treningowego do pobrania)
- **Walidacja Wejścia:** Walidacja formatu `id` (czy jest to poprawny UUID) powinna być wykonana _przed_ wywołaniem tej funkcji przez kod wywołujący (np. za pomocą Zod). Funkcja zakłada, że otrzymała poprawny `id`.
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`, rzucając błąd, jeśli użytkownik nie jest uwierzytelniony.

## 3. Wykorzystywane typy

- **Input Type:** `src/types/api.ts#GetTrainingPlanInput`
- **Output Type (Success):** `src/types/api.ts#TrainingPlanDetailOutput`
- **Database Model:** `src/db/database.types.ts#Tables<'training_plans'>` (Używany niejawnie przez zwracane typy Supabase)

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `TrainingPlanDetailOutput`, zawierający pełne dane planu treningowego.
- **Błędy:** W przypadku niepowodzenia (np. błąd uwierzytelnienia, plan nie znaleziony, brak dostępu, błąd bazy danych), funkcja rzuca wyjątek (`Error`) z odpowiednim komunikatem, który zostanie obsłużony przez kod wywołujący.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej z argumentem `input` zawierającym `id` planu.
2.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `await createServerSupabaseClient()` (zaimportowany z `@/db/supabase.server.ts`), aby uzyskać instancję klienta Supabase po stronie serwera.
3.  **Pobranie ID Użytkownika:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie, aby uzyskać ID aktualnie uwierzytelnionego użytkownika. Rzuca błąd `Error("User not authenticated")`, jeśli użytkownik nie jest zalogowany lub wystąpił błąd.
4.  **Zapytanie o Dane:** Wykonywane jest zapytanie do Supabase przy użyciu utworzonego klienta, aby pobrać plan:
    `SELECT id, name, created_at, user_id, plan_details FROM training_plans WHERE id = $1 AND user_id = $2 LIMIT 1`. Zamiast `$1` używany jest `input.id`, a zamiast `$2` używane jest `userId` pobrane w kroku 3.
5.  **Przetwarzanie Wyniku:**
    - Sprawdzany jest potencjalny błąd zwrócony przez Supabase (`error`). Rzucany jest wyjątek `Error("Failed to retrieve training plan: <database error message>")` w przypadku błędu.
    - Sprawdzane jest, czy zapytanie zwróciło jakiekolwiek dane (`data`). Jeśli `data` jest `null` lub puste (co oznacza, że plan o podanym `id` nie istnieje lub użytkownik nie ma do niego dostępu zgodnie z RLS i warunkiem `user_id`), rzucany jest wyjątek `Error("Training plan not found or access denied")`.
6.  **Formatowanie Wyniku:** Jeśli dane zostały pomyślnie pobrane, są one zwracane bezpośrednio, ponieważ struktura zapytania pasuje do typu `TrainingPlanDetailOutput` (zakładając poprawne typowanie w Supabase). Należy upewnić się, że zapytanie zawiera pole `description`.
7.  **Zwrot Wyniku:** Funkcja zwraca pobrany obiekt planu treningowego lub rzuca wyjątek w przypadku błędu.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Funkcja sama weryfikuje uwierzytelnienie użytkownika na początku.
- **Autoryzacja (RLS & Zapytanie):** Polityki RLS Supabase (zdefiniowane w `db-plan.md`) zapewniają podstawową ochronę. Dodatkowo, jawne dodanie warunku `user_id = <authenticated_user_id>` do klauzuli `WHERE` zapytania SQL zapewnia, że użytkownik może pobrać tylko własne plany, nawet jeśli RLS z jakiegoś powodu zawiedzie lub zostanie błędnie skonfigurowane. To kluczowe dla zapobiegania IDOR.
- **Walidacja Danych Wejściowych:** Format `id` jest niejawnie walidowany przez bazę danych.

## 7. Obsługa Błędów

- **Błąd Uwierzytelnienia:** Rzucany jest `Error("User not authenticated")`. Kod wywołujący powinien mapować to na **HTTP 401**.
- **Plan Nie Znaleziony / Brak Dostępu:** Rzucany jest `Error("Training plan not found or access denied")`. Kod wywołujący powinien mapować to na **HTTP 404** (zgodnie z typowym zachowaniem RLS) lub **HTTP 403** (jeśli specyfikacja API tego wymaga i istnieje mechanizm rozróżnienia).
- **Błąd Bazy Danych:** Rzucany jest `Error("Failed to retrieve training plan: <database error message>")`. Kod wywołujący powinien mapować to na **HTTP 500**.
- **Błąd Tworzenia Klienta Supabase:** Rzucany jest błąd z `createServerSupabaseClient`. Kod wywołujący powinien mapować to na **HTTP 500**.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. Server Action, API Route) jest odpowiedzialny za opakowanie wywołania `getTrainingPlanById` w blok `try...catch`, logowanie błędów i zwracanie odpowiednich kodów statusu HTTP oraz komunikatów błędów do klienta.

## 8. Rozważania dotyczące Wydajności

- **Indeksowanie Bazy Danych:** Zapytanie filtruje po `id` (Primary Key) i `user_id`. Istniejący indeks `idx_training_plans_user_created_at` obejmuje `user_id` jako pierwszą kolumnę, co może pomóc, ale optymalny byłby indeks na `(id, user_id)` lub wykorzystanie indeksu PK dla `id` i pozwolenie na filtrowanie `user_id` na wyniku. PostgreSQL zazwyczaj efektywnie używa indeksu PK dla `WHERE id = ?`. Wydajność powinna być dobra dla pojedynczego pobrania.
- **Liczba Zapytań:** Tylko jedno zapytanie SQL jest wykonywane do pobrania danych planu.

## 9. Etapy Wdrożenia

1.  **Utworzenie Struktury Plików:** Utwórz plik `src/db/actions/training-plans/get-by-id.ts`.
2.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `getTrainingPlanById` przyjmującą argument `input: GetTrainingPlanInput` i zwracającą `Promise<TrainingPlanDetailOutput>`.
3.  **Implementacja Tworzenia Klienta:** Dodaj logikę importu i wywołania `await createServerSupabaseClient()` na początku funkcji.
4.  **Implementacja Pobierania ID Użytkownika:** Dodaj logikę wywołania `supabase.auth.getUser()`. Sprawdź wynik i rzuć `Error("User not authenticated")` w przypadku braku użytkownika lub błędu. Przechowaj `userId`.
5.  **Implementacja Logiki Zapytania:**
    - Użyj utworzonego `supabase` i pobranego `userId` oraz `input.id` do wykonania zapytania `SELECT id, name, created_at, user_id, plan_details FROM training_plans WHERE id = input.id AND user_id = userId LIMIT 1`. Użyj `.single()` lub `.maybeSingle()` w Supabase JS Client.
6.  **Obsługa Błędów Supabase:** Sprawdź pole `error` w wyniku zapytania. Jeśli `error` istnieje, rzuć `Error("Failed to retrieve training plan: ${error.message}")`.
7.  **Obsługa Braku Danych:** Sprawdź, czy `data` jest `null` (jeśli użyto `.maybeSingle()`) lub czy wystąpił błąd oznaczający brak wiersza (jeśli użyto `.single()`). Jeśli planu nie znaleziono (lub dostęp zablokowany), rzuć `Error("Training plan not found or access denied")`.
8.  **Formatowanie i Zwrot Wyniku:** Jeśli dane (`data`) istnieją i nie ma błędu, zwróć `data` (powinno już pasować do `TrainingPlanDetailOutput`).
9.  **Typowanie:** Upewnij się, że funkcja, jej argumenty, zmienne i zwracana wartość są poprawnie otypowane przy użyciu typów z `src/types/api.ts` i `src/db/database.types.ts`. Sprawdź, czy typ `TrainingPlanDetailOutput` zawiera `description`.
10. **Testowanie:** Napisz testy jednostkowe dla tej akcji:
    - Zamockuj `createServerSupabaseClient` i zwracany przez niego mock klienta Supabase.
    - Zamockuj `mockSupabaseClient.auth.getUser()` zwracając użytkownika lub błąd/null.
    - Zamockuj metody zapytań (`from`, `select`, `eq`, `limit`, `single`/`maybeSingle`) na mocku klienta Supabase, aby symulować różne scenariusze (sukces, błąd DB, plan nie znaleziony).
    - Sprawdź, czy funkcja poprawnie wywołuje metody Supabase z oczekiwanymi argumentami (`id`, `user_id`).
    - Sprawdź, czy funkcja poprawnie zwraca dane w przypadku sukcesu.
    - Sprawdź, czy funkcja poprawnie rzuca odpowiednie błędy w różnych scenariuszach niepowodzenia.
11. **Dokumentacja (opcjonalnie):** Dodaj lub zaktualizuj komentarze JSDoc dla funkcji.
