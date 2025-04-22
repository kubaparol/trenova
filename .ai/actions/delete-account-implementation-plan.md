# Database Action Implementation Plan: deleteAccount

## 1. Przegląd Akcji

Ta akcja bazy danych (`deleteAccount`) jest przeznaczona do natychmiastowego i trwałego usunięcia konta **aktualnie uwierzytelnionego** użytkownika oraz wszystkich powiązanych z nim danych (profil, plany treningowe) za pomocą mechanizmu `ON DELETE CASCADE` zdefiniowanego w schemacie bazy danych. Akcja operuje w kontekście serwera i wymaga uprawnień administracyjnych do wykonania operacji usunięcia użytkownika w Supabase Auth.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/auth/delete-account.ts`
- **Nazwa Funkcji:** `deleteAccount`
- **Argumenty:** Brak. Akcja pobiera tożsamość użytkownika z kontekstu sesji serwerowej.
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta administracyjnego Supabase po stronie serwera (`supabaseClient()` z kluczem serwisowym) i weryfikuje uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`. Rzuca błąd `Error("Unauthorized")`, jeśli użytkownik nie jest uwierzytelniony.
- **Walidacja:** Sprawdzenie statusu uwierzytelnienia jest jedyną wymaganą walidacją.

## 3. Wykorzystywane typy

- **Output Type (Success):** `src/types/api.ts#DeleteAccountOutput`
- **Supabase Client:** `SupabaseClient` (instancja serwerowa z uprawnieniami admin, z `@/db/supabase.server`)
- **Supabase Auth Types:** `User` (z `@supabase/supabase-js`), `AuthError` (z `@supabase/supabase-js`)

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `DeleteAccountOutput`.
  ```typescript
  // src/types/api.ts
  interface DeleteAccountOutput {
    message: string; // Np. "Account deleted successfully."
  }
  ```
- **Błędy:** W przypadku niepowodzenia, funkcja rzuca wyjątek (`Error`) z odpowiednim komunikatem:
  - `Error("Unauthorized")`: Użytkownik nie jest zalogowany lub nie można zweryfikować sesji.
  - `Error("Server configuration error")`: Problem z inicjalizacją klienta Supabase Admin (np. brak klucza serwisowego).
  - `Error("Database error: Failed to delete user - [Komunikat błędu Supabase]")`: Wystąpił błąd podczas wywołania `supabase.auth.admin.deleteUser()`.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej (np. Server Action).
2.  **Utworzenie Klienta Supabase Admin:** Funkcja wywołuje `await supabaseClient()` (zaimportowany z `@/db/supabase.server`), upewniając się, że jest to klient z uprawnieniami administracyjnymi (service role key).
3.  **Weryfikacja Uwierzytelnienia:** Funkcja wywołuje `supabase.auth.getUser()` na utworzonym kliencie. Jeśli wystąpi błąd lub `user` jest `null`, rzuca `Error("Unauthorized")`. Zapisuje `userId` dla dalszych kroków.
4.  **Operacja Usunięcia Użytkownika:** Wykonuje wywołanie `supabase.auth.admin.deleteUser(userId)`.
5.  **Obsługa Błędów Supabase:** Sprawdza wynik operacji `deleteUser`. Jeśli wystąpił błąd, rzuca `Error("Database error: Failed to delete user - [Komunikat błędu Supabase]")`.
6.  **Poleganie na Cascade Delete:** Funkcja nie wykonuje dodatkowych operacji kasowania w tabelach `training_plans`. Zakłada się, że ograniczenia `ON DELETE CASCADE` w bazie danych zadziałają poprawnie po usunięciu użytkownika z `auth.users`.
7.  **Zwrot Wyniku:** Jeśli usunięcie w `auth.users` powiodło się, funkcja zwraca obiekt `DeleteAccountOutput` z komunikatem sukcesu.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Kluczowe jest sprawdzenie `supabase.auth.getUser()` na początku, aby upewnić się, że operacja dotyczy zalogowanego użytkownika.
- **Autoryzacja (Uprawnienia Admin):** Operacja `supabase.auth.admin.deleteUser()` wymaga klienta Supabase zainicjowanego z `SERVICE_ROLE_KEY`. Klucz ten musi być bezpiecznie przechowywany jako zmienna środowiskowa serwera i niedostępny po stronie klienta. Funkcja `supabaseClient` z `@/db/supabase.server` musi gwarantować użycie odpowiedniego klienta dla tej akcji.
- **Potwierdzenie Użytkownika:** Ta akcja wykonuje **nieodwracalne** usunięcie. Kod wywołujący (np. komponent UI, Server Action) **musi** zaimplementować mechanizm potwierdzenia przez użytkownika (np. modal z ostrzeżeniem, wpisanie hasła) **przed** wywołaniem `deleteAccount`.
- **Integralność Danych:** Funkcjonowanie akcji zależy od poprawności konfiguracji `ON DELETE CASCADE` w bazie danych (zgodnie z `db-plan.md`).

## 7. Obsługa Błędów

- **Błędy Uwierzytelnienia:** Rzucany `Error("Unauthorized")`.
- **Błędy Konfiguracji Serwera:** Rzucany `Error("Server configuration error")`.
- **Błędy Bazy Danych:** Błędy z Supabase (`deleteUser`) rzucane jako `Error("Database error: ...")`.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. Server Action) jest odpowiedzialny za przechwycenie (`try...catch`) wyjątków rzucanych przez tę akcję i przetłumaczenie ich na odpowiednie odpowiedzi dla klienta (np. komunikaty o błędach, przekierowania).

## 8. Rozważania dotyczące Wydajności

- **Operacja Bazy Danych:** Wywołanie `supabase.auth.admin.deleteUser()` i następujące po nim operacje kaskadowe mogą zająć chwilę, w zależności od ilości powiązanych danych i obciążenia bazy. Jest to jednak operacja jednorazowa na żądanie użytkownika.
- **Synchroniczność:** Akcja jest asynchroniczna (`Promise`). Kod wywołujący musi oczekiwać na jej zakończenie.

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/auth/delete-account.ts`.
2.  **Importy:** Dodaj niezbędne importy: `supabaseClient` z `@/db/supabase.server`, typ `DeleteAccountOutput` z `@/types/api`.
3.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `deleteAccount` nieprzyjmującą argumentów i zwracającą `Promise<DeleteAccountOutput>`.
4.  **Implementacja Tworzenia Klienta Supabase Admin:** Dodaj `const supabase = await supabaseClient();`, upewniając się, że jest to klient administracyjny. Możliwe, że `supabaseClient` wymagać będzie modyfikacji lub dodatkowego wariantu, aby jawnie zażądać klienta admina.
5.  **Implementacja Weryfikacji Uwierzytelnienia:** Dodaj logikę `supabase.auth.getUser()`. Sprawdź `error` i czy `data.user` istnieje. Jeśli nie, rzuć `Error("Unauthorized")`. Zapisz `userId = data.user.id`.
6.  **Implementacja Usunięcia Użytkownika:** W bloku `try...catch` wywołaj `await supabase.auth.admin.deleteUser(userId)`.
7.  **Implementacja Obsługi Błędów:** W bloku `catch` przechwyć błąd z `deleteUser` i rzuć `Error(\`Database error: Failed to delete user - \${error.message}\`)`. Należy również obsłużyć potencjalne błędy przy tworzeniu klienta Supabase.
8.  **Implementacja Zwracania Sukcesu:** Jeśli `deleteUser` zakończy się sukcesem, zwróć obiekt `{ message: "Account deleted successfully." }`.
9.  **Typowanie i Komentarze JSDoc:** Upewnij się, że funkcja jest poprawnie otypowana i zawiera JSDoc opisujący jej działanie, zwracaną wartość i rzucane błędy.
10. **Weryfikacja Zmiennych Środowiskowych:** Upewnij się, że `SUPABASE_SERVICE_ROLE_KEY` jest poprawnie skonfigurowana w środowisku serwerowym, a funkcja `supabaseClient` ma do niej dostęp i używa jej do stworzenia klienta administracyjnego.
11. **Testowanie:** Dokładnie przetestuj przepływ, w tym przypadki błędów (brak autoryzacji, błędy Supabase) i sprawdź, czy dane są poprawnie usuwane kaskadowo w bazie danych.
