# Database Action Implementation Plan: getUserTrainingPlans

## 1. Przegląd Akcji

Ta akcja bazy danych (`getUserTrainingPlans`) pobiera listę planów treningowych należących do **aktualnie uwierzytelnionego** użytkownika. Obsługuje paginację, aby umożliwić pobieranie planów w partiach. Jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Component, Server Action) i **sama tworzy instancję klienta Supabase po stronie serwera**.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/training-plans/get-user-plans.ts`
- **Argumenty:**
  - ~~`supabaseClient`: `SupabaseClient` (instancja klienta Supabase z kontekstem sesji użytkownika)~~ - **Usunięto:** Klient Supabase jest tworzony wewnątrz funkcji.
  - ~~`userId`: `string` (ID uwierzytelnionego użytkownika)~~ - **Usunięto:** ID użytkownika jest pobierane wewnątrz funkcji.
  - `options`: `GetUserPlansInput` (opcjonalny obiekt)
    - `page?`: `number` (liczba całkowita dodatnia, domyślnie: 1) - Numer strony do pobrania.
    - `limit?`: `number` (liczba całkowita dodatnia, domyślnie: 10) - Liczba planów na stronę.
- **Walidacja Wejścia:** Walidacja `page` i `limit` (np. za pomocą Zod) powinna być wykonana _przed_ wywołaniem tej funkcji przez kod wywołujący. Funkcja zakłada, że otrzymała prawidłowe lub domyślne wartości.
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`, rzucając błąd, jeśli użytkownik nie jest uwierzytelniony.

## 3. Wykorzystywane typy

- **Input Type (Options):** `src/types/api.ts#GetUserPlansInput`
- **Output Type (Success):** `src/types/api.ts#TrainingPlanListOutput`
- **List Item Type:** `src/types/api.ts#TrainingPlanListItem`
- **Database Model:** `src/db/database.types.ts#Tables<'training_plans'>` (Używany niejawnie przez zwracane typy Supabase)

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `TrainingPlanListOutput`:
  ```typescript
  {
    items: TrainingPlanListItem[];
    total: number; // Całkowita liczba planów użytkownika
    page: number;  // Numer strony (z wejścia lub domyślny)
    limit: number; // Limit elementów na stronie (z wejścia lub domyślny)
  }
  ```
- **Błędy:** W przypadku niepowodzenia (np. błąd bazy danych), funkcja powinna rzucić wyjątek (np. `Error`), który zostanie obsłużony przez kod wywołujący.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej z opcjonalnym argumentem `options` (`page`, `limit`).
2.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `await createServerSupabaseClient()` (zaimportowany z `@/db/supabase.server.ts`), aby uzyskać instancję klienta Supabase po stronie serwera.
3.  **Pobranie ID Użytkownika:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie, aby uzyskać ID aktualnie uwierzytelnionego użytkownika. Rzuca błąd, jeśli użytkownik nie jest zalogowany.
4.  **Obliczenie Paginacji:** Na podstawie `page` i `limit` (z `options` lub domyślnych) obliczany jest `offset`.
5.  **Zapytanie o Dane:** Wykonywane jest zapytanie do Supabase przy użyciu utworzonego klienta, aby pobrać odpowiednią stronę planów:
    `SELECT id, name, created_at, user_id FROM training_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`.
6.  **Zapytanie o Liczbę Całkowitą:** Wykonywane jest drugie zapytanie do Supabase przy użyciu utworzonego klienta:
    `SELECT count(*) FROM training_plans WHERE user_id = $1`.
7.  **Przetwarzanie Wyników:** Sprawdzane są potencjalne błędy zwrócone przez Supabase dla obu zapytań. Rzucany jest wyjątek w przypadku błędu.
8.  **Formatowanie Wyniku:** Dane (`items`, `total`) wraz z `page` i `limit` są formatowane w obiekt `TrainingPlanListOutput`.
9.  **Zwrot Wyniku:** Funkcja zwraca sformatowany obiekt.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Funkcja sama weryfikuje uwierzytelnienie.
- **Autoryzacja (RLS):** Polityki RLS Supabase nadal obowiązują.
- **Walidacja Danych Wejściowych:** Pozostaje odpowiedzialnością kodu wywołującego.
- **Tworzenie Klienta:** Funkcja polega na poprawnym działaniu `createServerSupabaseClient` z `@/db/supabase.server.ts` w celu uzyskania prawidłowego kontekstu serwerowego (np. cookies).

## 7. Obsługa Błędów

- **Błędy Uwierzytelnienia:** Funkcja rzuca wyjątek, jeśli `supabase.auth.getUser()` zwróci błąd lub brak użytkownika.
- **Błędy Klienta Supabase:** Jeśli `createServerSupabaseClient` zawiedzie, błąd zostanie rzucony.
- **Błędy Bazy Danych:** Wszelkie błędy zwrócone przez Supabase podczas wykonywania zapytań (np. problem z połączeniem, błąd składni SQL wygenerowany przez klienta) powinny skutkować rzuceniem wyjątku przez tę funkcję.
- **Nieoczekiwane Błędy:** Inne błędy (np. `null` tam, gdzie nie jest oczekiwany) powinny również prowadzić do rzucenia wyjątku.
- **Obsługa przez Wywołującego:** Kod wywołujący tę akcję bazy danych jest odpowiedzialny za przechwycenie (`try...catch`) potencjalnych wyjątków i odpowiednie ich obsłużenie (np. zalogowanie błędu, zwrócenie błędu użytkownikowi).

## 8. Rozważania dotyczące Wydajności

- **Paginacja:** Niezbędna do obsługi potencjalnie dużej liczby planów.
- **Indeksowanie Bazy Danych:** Istniejący indeks `idx_training_plans_user_created_at` jest kluczowy dla wydajności zapytań sortujących i filtrujących według `user_id` i `created_at`.
- **Liczba Zapytań:** Dwa zapytania na wywołanie (jedno dla danych, jedno dla liczby całkowitej) to standardowe i akceptowalne podejście dla paginacji.

## 9. Etapy Wdrożenia

1.  **Utworzenie Struktury Plików:** Utwórz plik `src/db/actions/training-plans/get-user-plans.ts`.
2.  **Zdefiniowanie Funkcji:** Zdefiniuj funkcję `getUserTrainingPlans` z sygnaturą opisaną w **zaktualizowanej** Sekcji 2 (tylko z parametrem `options`).
3.  **Implementacja Tworzenia Klienta:** Dodaj logikę importu i wywołania `await createServerSupabaseClient()` na początku funkcji.
4.  **Implementacja Pobierania ID Użytkownika:** Dodaj logikę wywołania `supabase.auth.getUser()` i obsługę błędu/braku użytkownika.
5.  **Implementacja Logiki Zapytania:**
    - Pobierz `page` i `limit` z `options`, stosując wartości domyślne.
    - Oblicz `offset`.
    - Użyj **utworzonego** `supabase` i pobranego `userId` do wykonania zapytań o dane i liczbę całkowitą.
6.  **Obsługa Błędów Supabase:** Sprawdź pole `error` w wynikach obu zapytań.
7.  **Formatowanie Wyniku:** Skonstruuj i zwróć obiekt `TrainingPlanListOutput`.
8.  **Typowanie:** Upewnij się, że funkcja jest poprawnie otypowana.
9.  **Testowanie:** Zaktualizuj testy jednostkowe, aby odzwierciedlały nową logikę:
    - Zamockuj `createServerSupabaseClient` i zwracany przez niego mock klienta Supabase.
    - Zamockuj `mockSupabaseClient.auth.getUser()`.
    - Sprawdź wywołanie `createServerSupabaseClient`.
    - Zweryfikuj pozostałe przypadki.
10. **Dokumentacja (opcjonalnie):** Zaktualizuj komentarze JSDoc.
