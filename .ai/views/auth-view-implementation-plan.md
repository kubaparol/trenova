# Plan implementacji widoku Auth

## 1. Przegląd

Widok Auth odpowiada za trzy główne funkcjonalności: rejestrację, logowanie oraz odzyskiwanie hasła. Użytkownicy będą mogli utworzyć nowe konto, zalogować się oraz zresetować hasło w razie potrzeby. Widok uwzględnia należytą walidację, komunikaty przyjazne użytkownikowi oraz zgodność z zasadami dostępności.

## 2. Routing widoku

- Rejestracja: `/auth/signup`
- Logowanie: `/auth/login`
- Odzyskiwanie hasła:
  - Formularz wprowadzania email: `/auth/forgot-password`
  - Potwierdzenie wysłania linku: `/auth/reset-password-sent`
  - Formularz ustawiania nowego hasła: `/auth/reset-password`
  - Potwierdzenie zmiany hasła: `/auth/reset-password-success`

## 3. Struktura komponentów

- `AuthLayout` (ogólny layout dla wszystkich widoków autentykacji)
  - `Forms`
    - `SignupForm`
      - Pole email
      - Pole hasła (z wskaźnikiem siły hasła)
      - Przycisk submit
      - Link do logowania
    - `LoginForm`
      - Pole email
      - Pole hasła (z opcją pokazywania/ukrywania hasła)
      - Przycisk submit
      - Link do odzyskiwania hasła
      - Link do rejestracji
    - `ForgotPasswordForm` (formularz wprowadzania email)
    - `ResetPasswordForm` (formularz ustawiania nowego hasła, zawierający pola nowe hasło i powtórzenie hasła)
  - `SignupView` (wrapper dla SignupForm)
  - `LoginView` (wrapper dla LoginForm)
  - `ForgotPasswordView` (wrapper dla ForgotPasswordForm)
  - `ResetPasswordSentView` (komunikat o wysłaniu linku resetującego)
  - `ResetPasswordView` (wrapper dla ResetPasswordForm)
  - `ResetPasswordSuccessView` (komunikat o pomyślnej zmianie hasła)

## 4. Szczegóły komponentów

### SignupForm

- Opis: Formularz rejestracji umożliwiający wprowadzenie adresu email oraz hasła, z dynamicznym wskaźnikiem siły hasła.
- Główne elementy: pola formularza, wskaźnik siły hasła, przycisk submit, link do logowania.
- Obsługiwane interakcje: walidacja pól w czasie rzeczywistym, dynamiczny feedback siły hasła, obsługa kliknięcia przycisku submit.
- Warunki walidacji: poprawny format email; spełnienie wymagań dotyczących hasła (min. długość, złożoność).
- Typy: `SignupFormDTO` (np. { email: string, password: string }), `SignupViewModel`.
- Propsy: callback do obsługi submit, status ładowania lub błędu.

### LoginForm

- Opis: Formularz logowania umożliwiający wprowadzenie adresu email i hasła z opcją toggle widoczności hasła.
- Główne elementy: pola email i hasła, przycisk submit, przycisk toggle widoczności hasła, link do odzyskiwania hasła, link do rejestracji.
- Obsługiwane interakcje: walidacja danych, obsługa kliknięć, toggle widoczności hasła.
- Warunki walidacji: poprawny format email; pole hasła nie może być puste.
- Typy: `LoginFormDTO` (np. { email: string, password: string }), `LoginViewModel`.
- Propsy: callback do obsługi submit, status błędu.

### ForgotPasswordForm

- Opis: Formularz inicjujący proces odzyskiwania hasła, umożliwiający wprowadzenie adresu email.
- Główne elementy: pole email, przycisk submit.
- Obsługiwane interakcje: walidacja poprawności formatu email, wysyłka żądania resetowania hasła.
- Warunki walidacji: pole email musi zawierać poprawny format adresu email.
- Typy: `ForgotPasswordDTO` (np. { email: string }).
- Propsy: callback do obsługi submit, status wysłania komunikatu.

### ResetPasswordForm

- Opis: Formularz umożliwiający użytkownikowi ustawienie nowego hasła.
- Główne elementy: pola na nowe hasło i potwierdzenie hasła, przycisk submit.
- Obsługiwane interakcje: walidacja zgodności pól hasła, dynamiczna walidacja siły nowego hasła.
- Warunki walidacji: hasła w obu polach muszą być identyczne oraz spełniać określone wymagania (długość, złożoność).
- Typy: `ResetPasswordDTO` (np. { password: string, confirmPassword: string }).
- Propsy: callback do obsługi submit, status walidacji.

### ResetPasswordSentView i ResetPasswordSuccessView

- Opis: Widoki prezentujące komunikaty informujące o wysłaniu linku resetującego lub pomyślnej zmianie hasła.
- Elementy: komunikaty tekstowe oraz ewentualny przycisk do przekierowania do logowania.

## 5. Typy

- **SignupFormDTO**: { email: string; password: string; }
- **LoginFormDTO**: { email: string; password: string; }
- **ForgotPasswordDTO**: { email: string; }
- **ResetPasswordDTO**: { password: string; confirmPassword: string; }
- Dodatkowe typy do zarządzania stanem formularzy i statusami operacji (np. `AuthStatus`: 'idle' | 'loading' | 'success' | 'error').

## 6. Zarządzanie stanem

- Użycie hooka `useState` lub biblioteki do zarządzania formularzami (np. react-hook-form) do kontroli pól formularza oraz ich walidacji.
- Dedykowane hooki do zarządzania statusami operacji (ładowanie, sukces, błąd) dla poszczególnych akcji (rejestracja, logowanie, reset hasła).
- Ewentualne użycie Context API do przechowywania globalnego stanu autentykacji.

## 7. Interakcje użytkownika

- Użytkownik wprowadza dane w formularzu -> natychmiastowa walidacja pól (inline validation).
- Po kliknięciu submit: wyświetlenie wskaźnika ładowania, a następnie przekierowanie lub wyświetlenie komunikatu o błędzie.
- Feedback dynamiczny przy wpisywaniu hasła (wskaźnik siły hasła w rejestracji).
- Przekierowania między widokami (np. z rejestracji do logowania, z resetowania hasła do potwierdzającego widoku).
- Jasne komunikaty błędów prezentowane w sposób dostępny dla czytników ekranu.

## 8. Warunki i walidacja

- Walidacja formatu email oraz obecności danych w polach formularza.
- Walidacja hasła: minimalna długość, złożoność (np. kombinacja liter i cyfr) oraz zgodność obu pól w resetowaniu hasła.
- Walidacja odbywa się lokalnie przed wysłaniem żądania do API oraz przychodzące komunikaty błędów z backendu są odpowiednio prezentowane.

## 9. Obsługa błędów

- Obsługa błędów walidacji pól formularza (np. nieprawidłowy email, słabe hasło).
- Prezentacja komunikatów błędów otrzymanych z API (np. błędne dane logowania, problemy z siecią).
- Mechanizm retry dla akcji API oraz przekierowania w przypadku niepowodzenia operacji.

## 10. Kroki implementacji

1. Utworzenie struktury folderów i plików widoków w katalogu `/src/app/auth` zgodnie z ustalonymi routami.
2. Implementacja `AuthLayout` zapewniającego spójny wygląd dla wszystkich widoków autentykacji.
3. Stworzenie poszczególnych widoków: `SignupView`, `LoginView`, `ForgotPasswordView`, `ResetPasswordSentView`, `ResetPasswordView` i `ResetPasswordSuccessView`.
4. Implementacja komponentów formularzy (`SignupForm`, `LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`) z odpowiednią strukturą pól, walidacją i dynamicznym feedbackiem.
5. Definicja typów (DTO i ViewModel) w TypeScript, zgodnie z wymaganiami poszczególnych formularzy.
6. Dodanie mechanizmu zarządzania stanem za pomocą hooków (useState, react-hook-form) i ewentualnie Context API.
