# Database Action Implementation Plan: changePassword

## 1. Przegląd Akcji

Ta akcja bazy danych (`changePassword`), zlokalizowana w `src/db/actions/auth/change-password.ts`, pozwala **aktualnie uwierzytelnionemu** użytkownikowi na zmianę swojego hasła w systemie uwierzytelniania Supabase. Wymaga podania obecnego hasła oraz nowego hasła (wraz z potwierdzeniem). Akcja jest przeznaczona do wywołania z logiki po stronie serwera (np. Server Action) i sama tworzy instancję klienta Supabase po stronie serwera.

## 2. Szczegóły Wywołania Funkcji

- **Ścieżka Funkcji:** `src/db/actions/auth/change-password.ts`
- **Nazwa Funkcji:** `changePassword`
- **Argumenty:**
  - `input`: `ChangePasswordInput` (obiekt zawierający `currentPassword`, `newPassword`, `confirmNewPassword`)
- **Uwierzytelnienie:** Funkcja wewnętrznie tworzy klienta Supabase po stronie serwera (`supabaseClient()`) i sprawdza uwierzytelnienie użytkownika za pomocą `supabase.auth.getUser()`. Rzuca błąd `Error("Unauthorized")`, jeśli użytkownik nie jest uwierzytelniony.
- **Walidacja:** Funkcja jest odpowiedzialna za walidację danych wejściowych `input` za pomocą Zod. Rzuca `Error("Invalid input: [szczegóły błędu]")`, jeśli walidacja nie powiedzie się (np. hasła się nie zgadzają, nowe hasło jest za słabe, nowe hasło jest takie samo jak stare).

## 3. Wykorzystywane typy

- **Input Type:** `src/types/api.ts#ChangePasswordInput`
- **Output Type (Success):** `src/types/api.ts#ChangePasswordOutput`
- **Supabase Client:** `SupabaseClient` (z `@/db/supabase.server`)
- **Validation Schema:** Schemat Zod zdefiniowany np. w `src/lib/validators/authValidators.ts` dla `ChangePasswordInput`.

## 4. Szczegóły Zwracanej Wartości

- **Sukces:** Zwraca obiekt zgodny z typem `ChangePasswordOutput`.
  ```typescript
  // src/types/api.ts
  type ChangePasswordOutput = {
    message: string; // Np. "Password changed successfully."
  };
  ```
- **Błędy:** W przypadku niepowodzenia, funkcja rzuca wyjątek (`Error`) z odpowiednim komunikatem:
  - `Error("Unauthorized")`: Użytkownik nie jest zalogowany.
  - `Error("Invalid input: Passwords do not match")`: `newPassword` i `confirmNewPassword` są różne.
  - `Error("Invalid input: New password cannot be the same as the current password")`: `newPassword` jest identyczne jak `currentPassword`.
  - `Error("Invalid input: New password is too weak. [Wymagania]")`: Nowe hasło nie spełnia wymagań siły (np. min. 8 znaków).
  - `Error("Invalid input: [inne błędy Zod]")`: Inne błędy walidacji Zod.
  - `Error("Incorrect current password")`: Obecne hasło podane w `currentPassword` jest nieprawidłowe (wykryte przez Supabase podczas `updateUser`).
  - `Error("Failed to update password: [wiadomość błędu Supabase]")`: Inny błąd podczas operacji `updateUser` w Supabase.
  - `Error("Internal server error")`: Nieoczekiwany błąd podczas tworzenia klienta Supabase lub inny błąd serwera.

## 5. Przepływ Danych Wewnętrznych

1.  **Wywołanie:** Funkcja jest wywoływana z logiki serwerowej (np. Server Action) z argumentem `input`.
2.  **Utworzenie Klienta Supabase:** Funkcja wywołuje `const supabase = await supabaseClient();` (zaimportowany z `@/db/supabase.server`). Obsługuje potencjalne błędy inicjalizacji klienta.
3.  **Weryfikacja Uwierzytelnienia:** Funkcja wywołuje `supabase.auth.getUser()`. Jeśli wystąpi błąd lub `user` jest `null`, rzuca `Error("Unauthorized")`.
4.  **Walidacja Danych Wejściowych:**
    - Funkcja waliduje obiekt `input` przy użyciu odpowiedniego schematu Zod (np. `changePasswordSchema.parse(input)`). Schemat sprawdza:
      - Obecność wszystkich pól.
      - Czy `newPassword` i `confirmNewPassword` są identyczne (`refine`).
      - Wymagania siły dla `newPassword` (np. `.min(8)`).
    - Jeśli walidacja Zod nie powiedzie się, rzuca `Error("Invalid input: ...")` z komunikatem Zod.
    - Funkcja dodatkowo sprawdza, czy `input.newPassword === input.currentPassword`. Jeśli tak, rzuca `Error("Invalid input: New password cannot be the same as the current password")`.
5.  **Operacja Zmiany Hasła w Supabase:** Wykonuje zapytanie do Supabase Auth:
    `const { error } = await supabase.auth.updateUser({ password: input.newPassword })`
    _Uwaga:_ Supabase `updateUser` nie wymaga jawnego podania `currentPassword` jako osobnego argumentu do weryfikacji; weryfikacja obecnego hasła jest częścią wewnętrznego procesu tej metody dla uwierzytelnionej sesji. Jednak błąd zwrócony przez Supabase wskaże, czy problemem było nieprawidłowe "stare" hasło (chociaż komunikat błędu może być ogólny jak "Invalid credentials" lub podobny - trzeba to sprawdzić w dokumentacji/testach Supabase).
6.  **Sprawdzenie Wyniku Operacji:**
    - Jeśli `error` istnieje:
      - Sprawdź, czy błąd Supabase wskazuje na problem z weryfikacją tożsamości/starego hasła (np. `AuthApiError` z kodem 400 lub specyficznym komunikatem). Jeśli tak, rzuć `Error("Incorrect current password")`.
      - W przeciwnym razie rzuć `Error(\"Failed to update password: \${error.message}\")`.
7.  **Zwrot Wyniku (Sukces):** Jeśli nie było błędów, zwróć obiekt `{ message: "Password changed successfully." }`.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnienie:** Weryfikowane na początku funkcji przez `supabase.auth.getUser()` na kliencie serwerowym.
- **Autoryzacja (RLS):** Nie dotyczy bezpośrednio tabel, ale Supabase Auth zapewnia, że tylko zalogowany użytkownik może próbować zmienić swoje własne hasło.
- **Walidacja Danych Wejściowych:** Kluczowa dla zapewnienia poprawności danych i egzekwowania reguł dotyczących haseł (dopasowanie, siła, niezmienność). Użycie Zod jest wymagane.
- **Password Hashing:** Obsługiwane automatycznie i bezpiecznie przez Supabase. Akcja nigdy nie operuje na hasłach w postaci jawnej poza przekazaniem ich do `updateUser`.
- **Ochrona przed Brute Force:** Należy polegać na wbudowanych mechanizmach Supabase Auth. Dodatkowe rate limiting można zaimplementować w Server Action wywołującym tę akcję.
- **Logowanie:** Należy unikać logowania jakichkolwiek haseł (obecnych lub nowych).

## 7. Obsługa Błędów

- **Błędy Walidacji:** Rzucany `Error("Invalid input: ...")` z odpowiednim komunikatem.
- **Błędy Uwierzytelnienia:** Rzucany `Error("Unauthorized")`.
- **Błędy Supabase Auth:**
  - Nieprawidłowe obecne hasło: Rzucany `Error("Incorrect current password")`.
  - Inne błędy Supabase: Rzucane jako `Error("Failed to update password: ...")`.
- **Inne Błędy:** Rzucany `Error("Internal server error")`.
- **Obsługa przez Wywołującego:** Kod wywołujący (np. Server Action) jest odpowiedzialny za przechwycenie (`try...catch`) wyjątków rzucanych przez tę akcję i przetłumaczenie ich na odpowiednie odpowiedzi dla klienta (np. komunikaty w UI, statusy błędów formularza).

## 8. Rozważania dotyczące Wydajności

- **Wywołania Bazy Danych/Auth:** Operacje `auth.getUser` i `auth.updateUser` są zazwyczaj szybkie, ale zależą od czasu odpowiedzi serwerów Supabase.
- **Walidacja:** Walidacja Zod jest bardzo szybka.
- **Synchroniczność:** Akcja jest asynchroniczna (`async`/`await`), a jej czas wykonania zależy głównie od odpowiedzi Supabase.

## 9. Etapy Wdrożenia

1.  **Utworzenie Pliku:** Utwórz plik `src/db/actions/auth/change-password.ts`.
2.  **Importy:** Dodaj niezbędne importy: `supabaseClient` z `@/db/supabase.server`, typy `ChangePasswordInput`, `ChangePasswordOutput` z `@/types/api`, odpowiedni schemat walidacji Zod (np. `changePasswordSchema`) z `src/lib/validators/authValidators.ts`, `z` z `zod`.
3.  **Zdefiniowanie Funkcji:** Zdefiniuj asynchroniczną funkcję `changePassword` przyjmującą `input: ChangePasswordInput` i zwracającą `Promise<ChangePasswordOutput>`.
4.  **Implementacja Tworzenia Klienta Supabase:** Dodaj `const supabase = await supabaseClient();` w bloku `try...catch` na wypadek błędów inicjalizacji.
5.  **Implementacja Weryfikacji Uwierzytelnienia:** Dodaj logikę `supabase.auth.getUser()` i rzucenia `Error("Unauthorized")`, jeśli użytkownik nie jest zalogowany.
6.  **Implementacja Walidacji:**
    - Zdefiniuj lub zaimportuj schemat Zod (`changePasswordSchema`) w `src/lib/validators/authValidators.ts`, który sprawdza strukturę, dopasowanie haseł (`refine`) i siłę (`min`).
    - Dodaj walidację `input` za pomocą `changePasswordSchema.parse(input)` w bloku `try...catch`, rzucając `Error("Invalid input: ...")` w razie błędu Zod.
    - Dodaj jawne sprawdzenie `if (input.newPassword === input.currentPassword)` i rzuć odpowiedni błąd.
7.  **Implementacja Logiki Zmiany Hasła:**
    - Wywołaj `await supabase.auth.updateUser({ password: input.newPassword })`.
    - Sprawdź `error` z wyniku. Jeśli istnieje, przeanalizuj go, aby rozróżnić błąd nieprawidłowego obecnego hasła od innych błędów Supabase, i rzuć odpowiedni `Error`.
8.  **Implementacja Zwracania Sukcesu:** Jeśli operacja `updateUser` zakończyła się sukcesem (brak `error`), zwróć `{ message: "Password changed successfully." }`.
9.  **Typowanie i Komentarze JSDoc:** Upewnij się, że funkcja jest poprawnie otypowana i zawiera JSDoc opisujący jej działanie, argumenty, zwracaną wartość i rzucane błędy.
10. **Testowanie:** Napisz testy jednostkowe/integracyjne (np. używając Vitest i mockując Supabase client), aby zweryfikować poprawność działania funkcji dla różnych scenariuszy (sukces, błędy walidacji, błędy autoryzacji, błędy Supabase).
