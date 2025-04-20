# Database Action Implementation Plan: updateTrainingPlanName

## 1. Przegląd Akcji

Ta akcja bazy danych (`updateTrainingPlanName`) aktualizuje nazwę (`name`) konkretnego planu treningowego (`training_plans`) należącego do **aktualnie uwierzytelnionego** użytkownika. Jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Action) i **sama tworzy instancję klienta Supabase po stronie serwera** w celu zapewnienia bezpieczeństwa i dostępu do kontekstu użytkownika.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/training-plans/update-name.ts`
- **Argumenty:**
  - `input`: `UpdateTrainingPlanNameInput` (obiekt zawierający):
    - `id`: `string` (UUID planu treningowego do aktualizacji)
    - `name`: `string` (Nowa nazwa dla planu treningowego)
- **Walidacja Wejścia:** Podstawowa walidacja struktury obiektu `input` (obecność `id` i `name`) oraz typów danych powinna być wykonana **przed** wywołaniem tej funkcji przez kod wywołujący (np. Server Action) przy użyciu biblioteki Zod. Sprawdzenie formatu UUID dla `id` i ograniczeń długości dla `name` (np. 1-255 znaków) również powinno odbywać się w kodzie wywołującym.
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera (`createServerSupabaseClient`) i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`. Rzuca błąd, jeśli użytkownik nie jest uwierzytelniony.

## 3. Wykorzystywane typy

- **Input Type:** `src/types/api.ts#UpdateTrainingPlanNameInput`
- **Output Type (Success):** `src/types/api.ts#UpdateTrainingPlanNameOutput` (który wykorzystuje `src/types/api.ts#TrainingPlanListItem`)
- **Database Model:** `src/db/database.types.ts#Tables<'training_plans'>` (Używany niejawnie przez zwracane typy Supabase)

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `UpdateTrainingPlanNameOutput` (czyli `TrainingPlanListItem`), zawierający podstawowe dane zaktualizowanego planu:
  ```typescript
  {
    id: string;
    name: string; // Nowa, zaktualizowana nazwa
    created_at: string; // Data utworzenia pozostaje bez zmian
    user_id: string; // ID użytkownika, właściciela planu
  }
  ```
- **Błędy:** W przypadku niepowodzenia (np. błąd bazy danych, brak autoryzacji, nie znaleziono planu), funkcja rzuca wyjątek (`Error`), który musi być obsłużony przez kod wywołujący.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej z argumentem `input` (`id`, `name`).
2.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `await createServerSupabaseClient()` (zaimportowany z `@/db/supabase.server.ts`), aby uzyskać instancję klienta Supabase po stronie serwera.
3.  **Pobranie Użytkownika:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie. Jeśli wystąpi błąd lub użytkownik nie zostanie znaleziony, rzucany jest wyjątek "Unauthorized".
4.  **Operacja Aktualizacji:** Wykonywane jest zapytanie `UPDATE` do Supabase przy użyciu utworzonego klienta:
    ```javascript
    const { data, error, count } = await supabase
      .from("training_plans")
      .update({ name: input.name })
      .eq("id", input.id)
      // .eq('user_id', user.id) // Nie jest ściśle wymagane dzięki RLS, ale może być dodane dla jawności
      .select("id, name, created_at, user_id") // Zwraca zaktualizowane dane
      .single(); // Oczekujemy aktualizacji dokładnie jednego rekordu
    ```
5.  **Obsługa Błędu Supabase:** Jeśli `error` istnieje:
    - Analiza błędu Supabase (np. kod błędu PostgreSQL). Jeśli błąd wskazuje na naruszenie RLS lub inny problem związany z uprawnieniami, można rzucić bardziej specyficzny błąd (np. "Forbidden"). W przeciwnym razie rzucany jest generyczny błąd z komunikatem z `error`.
    - Jeśli `error` wskazuje na nieznalezienie rekordu (co `single()` może zwrócić jako błąd lub `data: null`), rzucany jest błąd "Not Found".
6.  **Weryfikacja Wyniku:** Jeśli nie było błędu, ale `data` jest `null` (co nie powinno się zdarzyć z `.single()` jeśli nie ma błędu, ale na wszelki wypadek), lub jeśli nie użyto `.single()` i `count` wynosi 0, oznacza to, że plan o podanym `id` nie został znaleziony lub użytkownik nie miał do niego dostępu (RLS). Rzucany jest błąd "Not Found".
7.  **Zwrot Wyniku:** Jeśli operacja się powiodła i `data` zawiera zaktualizowany rekord, funkcja zwraca obiekt `data` zgodny z `UpdateTrainingPlanNameOutput`.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Kluczowe jest sprawdzenie `supabase.auth.getUser()` na początku funkcji.
- **Autoryzacja (RLS):** Polityki RLS zdefiniowane w `db-plan.md` są podstawowym mechanizmem zapewniającym, że tylko właściciel planu może go modyfikować. Zapytanie `UPDATE` będzie respektować te polityki.
- **Walidacja Danych Wejściowych:** Odpowiedzialność kodu wywołującego, aby zapobiec np. SQL injection (choć Supabase client parametryzuje zapytania) lub zapisaniu nieprawidłowych danych (np. zbyt długa nazwa).
- **Tworzenie Klienta:** Funkcja musi używać `createServerSupabaseClient` do uzyskania klienta z odpowiednim kontekstem serwerowym (cookies, tokeny).

## 7. Obsługa Błędów

- **Błąd Uwierzytelnienia:** Rzucenie wyjątku `Error("Unauthorized")` lub podobnego, jeśli `supabase.auth.getUser()` zwróci błąd lub brak użytkownika.
- **Błąd Klienta Supabase:** Jeśli `createServerSupabaseClient` zawiedzie, błąd zostanie rzucony.
- **Błędy Bazy Danych / Supabase:**
  - Rzucenie wyjątku `Error("Not Found")`, jeśli zapytanie `update` nie znajdzie rekordu do aktualizacji (np. `data` jest `null` lub `count` jest 0 po zapytaniu).
  - Rzucenie wyjątku `Error("Forbidden")`, jeśli błąd Supabase wyraźnie wskazuje na problem z RLS (może być trudne do jednoznacznego zidentyfikowania, często skończy się jako "Not Found" lub generyczny błąd).
  - Rzucenie generycznego wyjątku `Error(error.message)` dla innych błędów zwróconych przez Supabase.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. Server Action) jest odpowiedzialny za przechwycenie (`try...catch`) rzuconych wyjątków i przetłumaczenie ich na odpowiednie odpowiedzi HTTP (401, 403, 404, 500) lub inne formy obsługi błędów.

## 8. Rozważania dotyczące Wydajności

- **Pojedyncze Zapytanie:** Akcja wykonuje tylko jedno zapytanie `UPDATE` do bazy danych, co jest wydajne.
- **Indeksowanie Bazy Danych:** Operacja `UPDATE` opiera się na `id` (klucz główny), co jest bardzo szybkie dzięki indeksowi PK. Indeks `idx_training_plans_user_created_at` nie ma bezpośredniego wpływu na tę konkretną operację `UPDATE`.

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/training-plans/update-name.ts`.
2.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `updateTrainingPlanName` przyjmującą argument `input: UpdateTrainingPlanNameInput` i zwracającą `Promise<UpdateTrainingPlanNameOutput>`.
3.  **Importy:** Zaimportuj niezbędne typy (`UpdateTrainingPlanNameInput`, `UpdateTrainingPlanNameOutput`), `createServerSupabaseClient`.
4.  **Implementacja Tworzenia Klienta:** Dodaj logikę wywołania `await createServerSupabaseClient()`.
5.  **Implementacja Pobierania Użytkownika:** Dodaj logikę wywołania `supabase.auth.getUser()` i rzucenie błędu "Unauthorized", jeśli użytkownik nie jest zalogowany.
6.  **Implementacja Logiki UPDATE:**
    - Użyj utworzonego `supabase` do wykonania zapytania `update().eq('id', input.id).select(...).single()`.
7.  **Implementacja Obsługi Błędów Supabase:** Sprawdź pole `error` w wyniku zapytania. Rzuć odpowiednie błędy ("Not Found", "Forbidden", lub generyczny `Error(error.message)`).
8.  **Implementacja Weryfikacji Wyniku:** Sprawdź, czy `data` nie jest `null`. Jeśli jest, rzuć błąd "Not Found".
9.  **Zwrot Wyniku:** Zwróć `data` jako `UpdateTrainingPlanNameOutput`.
10. **Typowanie:** Upewnij się, że funkcja i jej wewnętrzne zmienne są poprawnie otypowane.
11. **Dokumentacja (opcjonalnie):** Dodaj komentarze JSDoc do funkcji.
