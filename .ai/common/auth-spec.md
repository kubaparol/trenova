## Specyfikacja Architektury Modułu Autentykacji

### I. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

#### 1. Strony i Layouty

- Istniejące strony:
  - `/sign-in` – strona logowania.
  - `/sign-up` – strona rejestracji.
  - `/forgot-password` – strona odzyskiwania hasła (inicjacja resetu).
  - `/reset-password` - strona do ustawienia nowego hasła po kliknięciu w link resetujący.
  - `/reset-password-sent` - strona informująca o wysłaniu linku rejestującego.
  - `/reset-password-success` - strona informująca o pomyślnej zmianie hasła.
- Layouty:
  - Layout dla stron publicznych (non-auth) – stosowany na stronach `/login`, `/register` oraz `/password-reset`, zaprojektowany z myślą o minimalnym interfejsie przed autoryzacją.
  - Layout chroniony (auth layout) – używany po zalogowaniu, zawiera nawigację i informacje o stanie sesji użytkownika.

#### 2. Komponenty i Odpowiedzialności

- Komponenty formularzy (client-side React):
  - Wspólny komponent:
    - AuthForm (@AuthForm.tsx) – komponent nadrzędny obsługujący logikę formularzy autentykacji, w tym walidację danych (przy użyciu Zod), dynamiczne renderowanie pól, obsługę stanów ładowania oraz wyświetlanie komunikatów błędów.
  - Widoki bazujące na AuthForm:
    - SignUpView (@SignUpView.tsx) – widok rejestracji (US-001):
      - Pola: adres e-mail, hasło, potwierdzenie hasła.
      - Walidacja: poprawność formatu e-mail, minimalna długość hasła, zgodność haseł.
      - Komunikaty błędów: niepoprawny format e-mail, niezgodne hasła, błąd stworzenia konta (np. email już w użyciu).
    - SignInView (@SignInView.tsx) – widok logowania (US-002):
      - Pola: adres e-mail, hasło.
      - Walidacja: obowiązkowość pól, format e-mail.
      - Komunikaty błędów: błędne dane logowania lub brak konta.
    - ForgotPasswordView (@ForgotPasswordView.tsx) – widok odzyskiwania hasła (US-016):
      - Pole: adres e-mail.
      - Walidacja: poprawność formatu e-mail.
      - Akcja: wysyłka linku resetującego na podany adres e-mail.
    - ResetPasswordView (@ResetPasswordView.tsx) – widok ustawienia nowego hasła:
      - Pola: nowe hasło oraz potwierdzenie hasła.
      - Walidacja: minimalna długość hasła, zgodność haseł.
- Komponenty informacyjne (karty):
  - ResetPasswordSentView (@ResetPasswordSentView.tsx) – strona informująca o wysłaniu linku resetującego.
  - ResetPasswordSuccessView (@ResetPasswordSuccessView.tsx) – strona potwierdzająca pomyślną zmianę hasła.
- Strony Next.js (server-side):
  - Odpowiadają za routing, inicjowanie żądań do backendu autentykacji oraz zarządzanie sesją.
  - Przekierowania: w przypadku nieautoryzowanego dostępu użytkownik jest kierowany do strony `/sign-in`.

#### 3. Scenariusze i Walidacje

- Scenariusze:
  - Rejestracja (US-001): Użytkownik wprowadza dane rejestracyjne, które są walidowane na poziomie klienta, a następnie przesyłane do endpointu rejestracji; w przypadku błędu wyświetlany jest odpowiedni komunikat.
  - Logowanie (US-002): Po wprowadzeniu swoich danych logowania, formularz kontaktuje się z endpointem logowania; nieudana próba skutkuje wyświetleniem błędu.
  - Odzyskiwanie hasła (US-016): Użytkownik przechodzi do formularza odzyskiwania, wprowadza swój adres e-mail i otrzymuje link resetujący, umożliwiający ustawienie nowego hasła.
- Walidacja:
  - Klienckie sprawdzanie poprawności danych (format e-mail, długość hasła itp.).
  - Serwerowa walidacja danych przy użyciu np. Zod, z odpowiednimi komunikatami błędów przekazywanymi do klienta.

### II. LOGIKA BACKENDOWA

#### 1. Endpointy API i Struktura Modułu

- Położenie: `src/db/actions/auth/`
- Endpointy:
  - `sign-up.ts` – Endpoint rejestracji użytkownika (metoda POST):
    - Przyjmuje dane: email, hasło.
    - Wywołuje metodę `supabase.auth.signUp()`.
  - `sign-in.ts` – Endpoint logowania użytkownika (metoda POST):
    - Przyjmuje dane: email, hasło.
    - Wywołuje metodę `supabase.auth.signIn()`.
  - `reset-password.ts` – Endpoint inicjujący proces resetu hasła (metoda POST):
    - Przyjmuje adres e-mail użytkownika.
    - Wywołuje metodę do wysyłki linku resetującego, np. `supabase.auth.api.resetPasswordForEmail()`.
  - Opcjonalnie, endpoint do ostatecznej zmiany hasła po kliknięciu linku resetującego.

#### 2. Modele Danych i Walidacja

- Model użytkownika: Zarządzany przez Supabase (główne pola: email, id, metadata).
- DTOs:
  - `SignUpRequest`: { email: string, password: string }
  - `LoginRequest`: { email: string, password: string }
  - `ResetPasswordRequest`: { email: string }
- Walidacja:
  - Użycie bibliotek walidacyjnych (np. Zod) do sprawdzenia poprawności danych wejściowych (format e-mail, siła hasła).

#### 3. Obsługa Wyjątków i Rendering Serwerowy

- Mechanizmy obsługi wyjątków w endpointach (try/catch):
  - Logowanie błędów i raportowanie przy nieudanych operacjach.
  - Zwracanie standardowych kodów HTTP oraz czytelnych komunikatów błędów do klienta.
- Integracja z middleware:
  - `src/db/supabase.middleware.ts` kontroluje sesje i wykonuje przekierowania użytkowników nieautoryzowanych do strony `/sign-in`.
  - Utrzymanie spójności pomiędzy stanem sesji a renderowaniem stron server-side.

### III. SYSTEM AUTENTYKACJI

#### 1. Integracja z Supabase Auth

- Wykorzystanie Supabase Auth do realizacji głównych funkcjonalności:
  - Rejestracja: `supabase.auth.signUp()`
  - Logowanie: `supabase.auth.signIn()`
  - Wylogowywanie: `supabase.auth.signOut()`
  - Resetowanie hasła: `supabase.auth.api.resetPasswordForEmail()` (lub odpowiednia metoda API)
- Proces resetu hasła:
  - Formularz odzyskiwania hasła wysyła dane do endpointu resetowania.
  - Supabase wysyła użytkownikowi e-mail z linkiem resetującym.
  - Użytkownik, po kliknięciu linku, ma możliwość ustawienia nowego hasła za pośrednictwem dedykowanej strony.

#### 2. Zarządzanie Sesją i Middleware

- Przechowywanie sesji:
  - Tokeny sesji (JWT) przechowywane w ciasteczkach HTTPOnly dla zwiększenia bezpieczeństwa.
  - Middleware odczytuje ciasteczka i weryfikuje stan autentykacji przed dostępem do stron chronionych.
- Hooki i serwisy autentykacji:
  - `createClient`: Funkcja odpowiedzialna za monitorowanie i aktualizację stanu sesji użytkownika.

### Kluczowe Komponenty i Moduły

- Komponenty UI:
  - `ForgotPasswordView.tsx`, `ResetPasswordSentView.tsx`, `ResetPasswordSuccessView.tsx`, `ResetPasswordView.tsx`, `SignInView.tsx`, `SignUpView.tsx`
- Endpointy API:
  - `src/db/actions/auth/sign-up`, `src/db/actions/auth/sign-in`, `src/db/actions/auth/reset-password`
- Walidatory:
  - Schematy walidacyjne (np. Zod) dla DTOs.
- Middleware:
  - Globalny middleware odpowiedzialny za weryfikację sesji i ochronę stron autoryzowanych.
- Serwis Autentykacji:
  - Integracja z Supabase Auth poprzez wykorzystanie SDK Supabase.
