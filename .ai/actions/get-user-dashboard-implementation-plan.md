# Database Action Implementation Plan: getUserDashboardData

## 1. Przegląd Akcji

Ta akcja bazy danych (`getUserDashboardData`) pobiera i agreguje wszystkie niezbędne dane do wyświetlenia widżetów na pulpicie nawigacyjnym użytkownika (User Dashboard) dla **aktualnie uwierzytelnionego** użytkownika. Akcja ta jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Component, Server Action) i **sama tworzy instancję klienta Supabase po stronie serwera** w celu zapewnienia bezpieczeństwa i dostępu do kontekstu użytkownika. Akcja wykonuje zapytania do tabel `training_sessions` oraz `training_plans`, agregując wyniki w celu zwrócenia kompleksowego obiektu podsumowującego aktywność treningową użytkownika.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/dashboard/get-user-dashboard.ts`
- **Nazwa Funkcji:** `getUserDashboardData`
- **Argumenty:** Brak (korzysta z kontekstu uwierzytelnionego użytkownika).
- **Walidacja Wejścia:** Brak jawnych parametrów wejściowych. Główna walidacja to sprawdzenie uwierzytelnienia użytkownika.
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera (`createServerSupabaseClient`) i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`. Rzuca błąd, jeśli użytkownik nie jest uwierzytelniony.

## 3. Wykorzystywane typy

- **Output Type (Success):** `src/types/api.ts#UserDashboardDataOutput`
- **Nested Output Types:** `lastSession` structure, `weeklyProgress` structure, `systematicsScore` structure, `trainingSummary` structure, `charts` structure (wszystkie zdefiniowane w `UserDashboardDataOutput` w `src/types/api.ts`).
- **Database Models:** `src/db/database.types.ts#Tables<'training_sessions'>`, `src/db/database.types.ts#Tables<'training_plans'>` (używane do pobierania danych i w typach zwracanych przez Supabase).

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `UserDashboardDataOutput`, zawierający zagregowane dane treningowe użytkownika. Jeśli użytkownik nie ma żadnych zarejestrowanych sesji (`training_sessions`), zwraca obiekt z `hasTrainingData: false` i odpowiednio wyzerowanymi lub pustymi wartościami dla pozostałych pól.
- **Błędy:** W przypadku niepowodzenia (np. błąd bazy danych, brak autoryzacji), funkcja rzuca wyjątek (`Error`), który musi być obsłużony przez kod wywołujący.
  - `Error("Unauthorized")`: Użytkownik nie jest zalogowany.
  - `Error("Database error: [wiadomość błędu Supabase]")`: Wystąpił błąd podczas zapytania do bazy danych.

## 5. Przepływ Danych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej.
2.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `await createServerSupabaseClient()` (zaimportowany z `@/db/supabase.server`).
3.  **Pobranie Użytkownika:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie. Jeśli wystąpi błąd lub `user` jest `null`, rzucany jest błąd `Error("Unauthorized")`. Zapisuje `userId`.
4.  **Pobranie Danych Sesji:** Wykonuje zapytanie do Supabase w celu pobrania **wszystkich** rekordów `training_sessions` dla `userId`, łącząc je z `training_plans` w celu uzyskania `name` planu.

    ```typescript
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("training_sessions")
      .select(
        `
        id,
        completed_at,
        duration_seconds,
        plan_id,
        training_plans ( name )
      `
      )
      .eq("user_id", userId)
      .order("completed_at", { ascending: false }); // Najnowsze najpierw

    if (sessionsError) {
      throw new Error(`Database error: ${sessionsError.message}`);
    }
    ```

    _Uwaga: Pobranie `training_plans ( name )` wymaga odpowiednio skonfigurowanej relacji w Supabase lub może wymagać jawnego JOIN._

5.  **Sprawdzenie Istnienia Danych:** Jeśli `sessionsData` jest puste lub `null`:
    - Ustaw `hasTrainingData = false`.
    - Przygotuj i zwróć domyślny obiekt `UserDashboardDataOutput` z `hasTrainingData: false` i zerowymi/pustymi wartościami dla reszty pól (np. `lastSession: null`, `weeklyProgress: { completed_count: 0, goal: 5 }`, `charts: { durationTrend: [], workoutsByPlan: [] }`, etc.).
6.  **Agregacja Danych (jeśli `sessionsData` istnieje):**
    - Ustaw `hasTrainingData = true`.
    - **`lastSession`**: Pobierz pierwszy element z `sessionsData` (dzięki sortowaniu `DESC`). Wyekstrahuj `plan_name` (uwzględniając, że `training_plans` może być obiektem lub `null`), `completed_at`, `duration_seconds`.
    - **Obliczenia Czasowe:** Określ zakres dat dla bieżącego tygodnia (od poniedziałku do niedzieli) oraz dla ostatnich 14 dni. Należy użyć biblioteki do obsługi dat (np. `date-fns`) dla poprawności, uwzględniając strefy czasowe.
    - **Filtrowanie i Sumowanie:** Przeiteruj przez `sessionsData`:
      - Zlicz sesje w bieżącym tygodniu (`weeklyProgress.completed_count`, `trainingSummary.completed_this_week`).
      - Zlicz sesje w ostatnich 14 dniach (`systematicsScore.sessions_last_14_days`).
      - Oblicz sumę, maksimum i średnią `duration_seconds` dla wszystkich sesji (`trainingSummary`).
      - Przygotuj dane dla `charts.durationTrend` (mapowanie `completed_at` na datę ISO i `duration_seconds`).
      - Zgrupuj sesje według `plan_name` i zlicz je dla `charts.workoutsByPlan`.
    - **`systematicsScore.score`**: Określ ocenę ("very_good", "good", etc.) na podstawie `sessions_last_14_days` (np. >=10: very_good, 7-9: good, 4-6: average, <4: poor).
    - **`weeklyProgress.goal`**: Ustaw statyczną wartość (np. 5).
7.  **Konstrukcja Wyniku:** Złóż wszystkie obliczone wartości w obiekt zgodny z `UserDashboardDataOutput`.
8.  **Zwrot Wyniku:** Zwróć finalny obiekt `UserDashboardDataOutput`.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Zapewnione przez `supabase.auth.getUser()` na początku funkcji.
- **Autoryzacja (RLS):** Polityki Row Level Security zdefiniowane w Supabase dla tabel `training_sessions` i `training_plans` są kluczowe. Zapytania `SELECT` muszą respektować te polityki, zapewniając, że użytkownik widzi tylko swoje dane. Użycie `userId` z `auth.getUser()` w klauzuli `.eq('user_id', userId)` dodatkowo wzmacnia bezpieczeństwo.
- **Tworzenie Klienta:** Użycie `createServerSupabaseClient` gwarantuje, że klient Supabase jest tworzony w bezpiecznym kontekście serwerowym.

## 7. Obsługa Błędów

- **Błąd Uwierzytelnienia:** Rzucenie wyjątku `Error("Unauthorized")`, jeśli `supabase.auth.getUser()` zwróci błąd lub brak użytkownika. Obsługiwane przez kod wywołujący (np. zwrócenie statusu 401).
- **Błąd Klienta Supabase:** Rzucenie błędu, jeśli `createServerSupabaseClient` zawiedzie. Obsługiwane przez kod wywołujący (np. zwrócenie statusu 500).
- **Błędy Bazy Danych:** Jeśli zapytanie `SELECT` do `training_sessions` lub `training_plans` zawiedzie, rzucany jest wyjątek `Error("Database error: [wiadomość]")`. Obsługiwane przez kod wywołujący (np. zwrócenie statusu 500).
- **Brak Danych:** Nie jest traktowany jako błąd. Zamiast tego zwracany jest obiekt `UserDashboardDataOutput` z `hasTrainingData: false`.

## 8. Rozważania dotyczące Wydajności

- **Pojedyncze Główne Zapytanie:** Główny koszt to pobranie wszystkich sesji treningowych użytkownika. Dla użytkowników z bardzo dużą historią (> kilka tysięcy sesji) może to stać się wąskim gardłem.
- **Agregacja po Stronie Klienta (w Akcji):** Wykonywanie agregacji (sum, count, avg, max, grupowanie) w kodzie TypeScript po pobraniu danych jest elastyczne, ale może być mniej wydajne niż agregacja w bazie danych dla dużych zbiorów danych.
- **Optymalizacje (Jeśli Potrzebne):**
  - **Agregacja w Bazie Danych:** W przypadku problemów z wydajnością, rozważ stworzenie funkcji PostgreSQL wykonującej większość agregacji i wywołanie jej za pomocą `supabase.rpc()`. To przeniesie obciążenie na serwer bazy danych.
  - **Ograniczenie Danych Trendu:** Jeśli wykres `durationTrend` staje się zbyt duży, rozważ ograniczenie go do określonego okresu (np. ostatni rok) lub liczby punktów, choć obecna specyfikacja wymaga wszystkich sesji.
  - **Indeksowanie:** Upewnij się, że istnieją odpowiednie indeksy w bazie danych, zwłaszcza na `training_sessions(user_id, completed_at)` (już zdefiniowany jako `idx_training_sessions_user_completed_at`) oraz potencjalnie na `training_sessions(plan_id)` (zdefiniowany jako `idx_training_sessions_plan_id`).

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/dashboard/get-user-dashboard.ts`.
2.  **Importy:** Dodaj niezbędne importy: `createServerSupabaseClient` z `@/db/supabase.server`, typy `UserDashboardDataOutput` i powiązane struktury z `@/types/api`, typ `Tables` z `@/db/database.types`, oraz ewentualnie bibliotekę do obsługi dat (np. `date-fns`).
3.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `getUserDashboardData` nie przyjmującą argumentów i zwracającą `Promise<UserDashboardDataOutput>`.
4.  **Implementacja Tworzenia Klienta Supabase:** Dodaj `const supabase = await createServerSupabaseClient();`.
5.  **Implementacja Weryfikacji Uwierzytelnienia:** Dodaj logikę `supabase.auth.getUser()`, zapisz `userId` i rzuć `Error("Unauthorized")` w razie niepowodzenia.
6.  **Implementacja Pobierania Danych:** Wykonaj zapytanie `SELECT` do `training_sessions` z JOINem (lub zagnieżdżonym selectem) do `training_plans` dla `name`, filtrując po `userId` i sortując po `completed_at DESC`. Obsłuż błąd zapytania.
7.  **Implementacja Obsługi Braku Danych:** Sprawdź, czy wynik zapytania jest pusty. Jeśli tak, skonstruuj i zwróć domyślny obiekt `UserDashboardDataOutput` z `hasTrainingData: false`.
8.  **Implementacja Logiki Agregacji:**
    - Wyekstrahuj `lastSession`.
    - Przygotuj zakresy dat (bieżący tydzień, ostatnie 14 dni).
    - Przetwórz pobrane sesje, obliczając wszystkie wymagane metryki dla `weeklyProgress`, `systematicsScore`, `trainingSummary` oraz dane dla `charts`.
    - Ustaw statyczny `weeklyProgress.goal`.
9.  **Implementacja Konstrukcji Wyniku:** Złóż obliczone wartości w finalny obiekt `UserDashboardDataOutput`.
10. **Implementacja Zwracania Sukcesu:** Zwróć skonstruowany obiekt `UserDashboardDataOutput`.
11. **Typowanie i Komentarze JSDoc:** Upewnij się, że funkcja jest poprawnie otypowana i zawiera JSDoc opisujący jej działanie, zwracaną wartość i rzucane błędy.
12. **Refaktoryzacja (Opcjonalnie):** Wydziel logikę obliczeń dat i agregacji do osobnych funkcji pomocniczych wewnątrz pliku dla lepszej czytelności.
