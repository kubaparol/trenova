# Database Action Implementation Plan: deleteTrainingPlan

## 1. Przegląd Akcji

Ta akcja bazy danych (`deleteTrainingPlan`) usuwa określony plan treningowy należący do **aktualnie uwierzytelnionego** użytkownika. Jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Component, Server Action, API Route Handler) i **sama tworzy instancję klienta Supabase po stronie serwera**.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/training-plans/delete.ts`
- **Nazwa Funkcji:** `deleteTrainingPlan`
- **Argumenty:**
  - `input`: `DeleteTrainingPlanInput` (obiekt zawierający `id` planu do usunięcia)
    - `id`: `string` (UUID planu treningowego)
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`, rzucając błąd `Error("Unauthorized")`, jeśli użytkownik nie jest uwierzytelniony.

## 3. Wykorzystywane typy

- **Input Type:** `src/types/api.ts#DeleteTrainingPlanInput`
- **Output Type (Success):** `src/types/api.ts#DeleteTrainingPlanOutput`
- **Database Model:** `src/db/database.types.ts#Tables<'training_plans'>` (Używany niejawnie przez klienta Supabase)
- **Supabase Client:** `SupabaseClient` (z `@/db/supabase.server`)

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `DeleteTrainingPlanOutput`:
  ```typescript
  {
    message: string; // Np. "Training plan deleted successfully."
  }
  ```
- **Błędy:** W przypadku niepowodzenia, funkcja rzuca wyjątek (`Error`) z odpowiednim komunikatem:
  - `Error("Unauthorized")`: Użytkownik nie jest zalogowany.
  - `Error("Not Found")`: Plan o podanym ID nie istnieje lub użytkownik nie ma do niego uprawnień (ze względu na RLS).
  - `Error("Database error: [wiadomość błędu Supabase]")`: Wystąpił błąd podczas operacji na bazie danych.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej z argumentem `input` zawierającym `id` planu.
2.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `await supabaseClient()` (zaimportowany z `@/db/supabase.server`), aby uzyskać instancję klienta Supabase po stronie serwera.
3.  **Weryfikacja Uwierzytelnienia:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie. Jeśli wystąpi błąd lub `user` jest `null`, rzuca `Error("Unauthorized")`.
4.  **Operacja Usunięcia:** Wykonywane jest zapytanie do Supabase przy użyciu utworzonego klienta:
    `supabase.from('training_plans').delete().eq('id', input.id)`
5.  **Sprawdzenie Wyniku:** Analizowany jest wynik operacji `delete()`:
    - Jeśli `error` istnieje, rzucany jest `Error(\"Database error: \${error.message}\")`.
    - Sprawdzana jest liczba usuniętych wierszy (np. przez `.select().single()` przed delete lub sprawdzając `count` jeśli metoda `.delete()` go zwraca w używanej wersji klienta - _Uwaga: standardowe `.delete()` może nie zwracać `count` w prosty sposób bez dodatkowych modyfikacji lub zapytań_). Alternatywnie, jeśli `.delete()` po prostu zwraca `data: null` i `error: null` przy braku rekordu lub RLS, można to interpretować jako "Not Found". _Preferowane podejście:_ Sprawdzić `count` zwrócony przez Supabase (jeśli dostępny i wiarygodny dla RLS) lub rzucić "Not Found", jeśli `error` jest `null`, ale operacja nie powiodła się (np. `count === 0`).
6.  **Formatowanie Wyniku:** Jeśli usunięcie powiodło się (brak błędu i `count === 1`), tworzony jest obiekt `DeleteTrainingPlanOutput`.
7.  **Zwrot Wyniku:** Funkcja zwraca obiekt `DeleteTrainingPlanOutput` lub rzuca wyjątek.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Weryfikowane na początku funkcji przez `supabase.auth.getUser()`.
- **Autoryzacja (RLS):** Polityka RLS Supabase `"Allow individual user delete access to own plans"` zapewnia, że użytkownik może usunąć tylko swoje plany. Funkcja dodatkowo weryfikuje, czy operacja faktycznie usunęła rekord, aby obsłużyć przypadki, gdy RLS blokuje operację (co objawia się jako brak usuniętego rekordu).
- **Walidacja Danych Wejściowych:** Funkcja zakłada, że `input.id` jest poprawnym stringiem (np. UUID). Podstawowa walidacja (czy `id` istnieje) jest niejawna.

## 7. Obsługa Błędów

- **Błędy Uwierzytelnienia:** Rzucany `Error("Unauthorized")`.
- **Plan Nie Znaleziony / Brak Uprawnień (RLS):** Jeśli operacja `delete` zakończy się bez błędu, ale nie usunie żadnego rekordu (`count === 0`), rzucany jest `Error("Not Found")`.
- **Błędy Bazy Danych:** Błędy zwrócone przez Supabase podczas operacji `delete` są przechwytywane i rzucane jako `Error(\"Database error: ...\")`.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. API Route Handler) jest odpowiedzialny za przechwycenie (`try...catch`) wyjątków rzucanych przez tę akcję i przetłumaczenie ich na odpowiednie kody statusu HTTP (np. 401, 404, 500).

## 8. Rozważania dotyczące Wydajności

- Operacja `DELETE` na podstawie klucza głównego (`id`) jest zazwyczaj bardzo wydajna w PostgreSQL.
- Indeks na `id` (Primary Key) zapewnia szybkie wyszukiwanie rekordu do usunięcia.
- Operacja wymaga jednego zapytania do bazy danych (plus jedno zapytanie `auth.getUser`).

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/training-plans/delete.ts`.
2.  **Importy:** Dodaj niezbędne importy: `supabaseClient` z `@/db/supabase.server`, typy `DeleteTrainingPlanInput`, `DeleteTrainingPlanOutput` z `@/types/api`.
3.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `deleteTrainingPlan` przyjmującą argument `input: DeleteTrainingPlanInput` i zwracającą `Promise<DeleteTrainingPlanOutput>`.
4.  **Implementacja Tworzenia Klienta:** Dodaj `const supabase = await supabaseClient();`.
5.  **Implementacja Weryfikacji Uwierzytelnienia:** Dodaj logikę wywołania `supabase.auth.getUser()` i rzucenia `Error("Unauthorized")` w przypadku błędu lub braku użytkownika.
6.  **Implementacja Operacji Usunięcia:** Wywołaj `supabase.from('training_plans').delete().eq('id', input.id)`. Zapisz wynik (zawierający `error` i potencjalnie `count`).
7.  **Implementacja Sprawdzania Wyniku:**
    - Sprawdź `error`. Jeśli istnieje, rzuć `Error(\"Database error: \${error.message}\")`.
    - Sprawdź, czy operacja faktycznie usunęła rekord (np. sprawdzając `count` jeśli jest dostępny i równy 1). Jeśli nie (`count === 0` lub inna metoda wskazująca brak usunięcia mimo braku błędu), rzuć `Error("Not Found")`.
8.  **Implementacja Zwracania Sukcesu:** Jeśli nie wystąpiły błędy i rekord został usunięty, zwróć obiekt `{ message: "Training plan deleted successfully." }`.
9.  **Typowanie i Komentarze:** Upewnij się, że funkcja jest poprawnie otypowana i dodaj komentarze JSDoc wyjaśniające jej działanie, argumenty, zwracaną wartość i rzucane błędy.
