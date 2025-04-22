# Plan implementacji widoku Ustawień Konta (`/settings`)

## 1. Przegląd

Widok Ustawień Konta (`/settings`) umożliwia zalogowanym użytkownikom zarządzanie podstawowymi ustawieniami ich konta. Funkcjonalności obejmują **zmianę hasła użytkownika** oraz bezpieczne usunięcie konta wraz ze wszystkimi powiązanymi danymi. Proces usuwania wymagać będzie potwierdzenia poprzez wpisanie określonej frazy w modalu.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/settings`. Dostęp do tej ścieżki powinien być ograniczony tylko dla zalogowanych użytkowników (co powinno być zapewnione przez globalne mechanizmy middleware lub layout aplikacji).

## 3. Struktura komponentów

Hierarchia komponentów dla widoku `/settings` będzie następująca:

```
AccountSettingsPage (src/app/settings/page.tsx)
└── AccountManagementSection (src/components/settings/AccountManagementSection.tsx)
    ├── ChangePasswordForm (src/components/settings/ChangePasswordForm.tsx - wykorzystuje Shadcn Form, Input, Button)
    └── DeleteAccountButton (src/components/settings/DeleteAccountButton.tsx - wykorzystuje Shadcn Button)
└── DeleteAccountConfirmationModal (src/components/settings/DeleteAccountConfirmationModal.tsx - wykorzystuje Shadcn Dialog)
    ├── Shadcn/Dialog.Title
    ├── Shadcn/Dialog.Description (Ostrzeżenie)
    ├── Shadcn/Input (Pole na frazę potwierdzającą)
    └── Shadcn/Dialog.Footer
        ├── Shadcn/Button (Anuluj)
        └── Shadcn/Button (Potwierdź usunięcie - destructive, początkowo wyłączony)
```

## 4. Szczegóły komponentów

### `AccountSettingsPage`

- **Opis komponentu:** Główny komponent strony dla ścieżki `/settings`. Renderuje układ strony i zawiera sekcję zarządzania kontem (`AccountManagementSection`). Odpowiada za zarządzanie widocznością modala potwierdzającego usunięcie konta.
- **Główne elementy:** Kontener (`div`), `AccountManagementSection`, `DeleteAccountConfirmationModal`.
- **Obsługiwane interakcje:** Otwarcie modala potwierdzającego usunięcie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Wykorzystuje wewnętrzny stan (`isModalOpen`).
- **Propsy:** Brak.

### `AccountManagementSection`

- **Opis komponentu:** Sekcja dedykowana akcjom związanym z kontem. Zawiera formularz zmiany hasła oraz przycisk do inicjowania procesu usuwania konta.
- **Główne elementy:** Kontener (`div`), `h2` lub podobny nagłówek sekcji "Zarządzanie kontem", `ChangePasswordForm`, `DeleteAccountButton`.
- **Obsługiwane interakcje:** Przekazuje zdarzenie kliknięcia przycisku usuwania do rodzica (`AccountSettingsPage`) w celu otwarcia modala. Renderuje formularz zmiany hasła.
- **Obsługiwana walidacja:** Brak (delegowana do `ChangePasswordForm`).
- **Typy:** Brak specyficznych.
- **Propsy:**
  - `onOpenDeleteModal: () => void` - Funkcja wywoływana po kliknięciu przycisku usuwania.

### `ChangePasswordForm`

- **Opis komponentu:** Formularz umożliwiający użytkownikowi zmianę hasła. Wykorzystuje `Shadcn/ui Form` (oparty na `react-hook-form` i `zod`) do walidacji i obsługi. Komunikuje się z API w celu aktualizacji hasła.
- **Główne elementy:** `Form`, `FormField` (dla `currentPassword`, `newPassword`, `confirmNewPassword`), `Input` (typu `password`), `Button` (Submit).
- **Obsługiwane interakcje:**
  - Wprowadzanie danych w polach formularza.
  - Wysłanie formularza (`onSubmit`).
- **Obsługiwana walidacja (Zod Schema):**
  - `currentPassword`: Wymagane, niepuste.
  - `newPassword`: Wymagane, niepuste, minimalna długość (np. 8 znaków), musi różnić się od `currentPassword`.
  - `confirmNewPassword`: Wymagane, niepuste, musi być identyczne z `newPassword`.
- **Typy:**
  - Wewnętrzny stan: Zarządzany przez `react-hook-form` (dane formularza, błędy walidacji). Dodatkowy stan dla `isLoading` i `apiError`.
  - ViewModel: `ChangePasswordFormState` (patrz sekcja 5).
  - DTO: `ChangePasswordInput`, `ChangePasswordOutput` (z `src/types/api.ts`).
- **Propsy:** Brak.

### `DeleteAccountButton`

- **Opis komponentu:** Przycisk (bazujący na `Shadcn/ui Button`) inicjujący proces usuwania konta. Powinien mieć stylizację wskazującą na akcję destrukcyjną (`variant="destructive"`).
- **Główne elementy:** `Button` z `Shadcn/ui`.
- **Obsługiwane interakcje:** `onClick`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Standardowe typy zdarzeń przycisku.
- **Propsy:**
  - `onClick: () => void` - Funkcja wywoływana po kliknięciu.

### `DeleteAccountConfirmationModal`

- **Opis komponentu:** Modal (bazujący na `Shadcn/ui Dialog`) służący do potwierdzenia chęci usunięcia konta. Zawiera ostrzeżenie oraz pole tekstowe, w które użytkownik musi wpisać **"USUŃ KONTO"**, aby aktywować przycisk ostatecznego potwierdzenia. Zarządza stanem ładowania i błędów podczas wywołania API `deleteAccount`.
- **Główne elementy:** `Dialog`, `Dialog.Title`, `Dialog.Description` (ostrzeżenie), `Input` (Shadcn/ui), `Dialog.Footer`, `Button` (Anuluj), `Button` (Potwierdź - destructive).
- **Obsługiwane interakcje:**
  - Zmiana wartości w polu tekstowym (`onChange`).
  - Kliknięcie przycisku "Anuluj".
  - Kliknięcie przycisku "Potwierdź usunięcie".
- **Obsługiwana walidacja:**
  - Przycisk "Potwierdź usunięcie" jest aktywny (`disabled={false}`) tylko wtedy, gdy wartość wpisana w polu `Input` jest _dokładnie_ równa **"USUŃ KONTO"** (case-sensitive).
- **Typy:**
  - Wewnętrzny stan: `ViewModel: DeleteAccountModalState` (patrz sekcja 5).
  - DTO: `DeleteAccountOutput` (oczekiwany typ odpowiedzi z API `deleteAccount` w przypadku sukcesu).
- **Propsy:**
  - `isOpen: boolean` - Kontroluje widoczność modala.
  - `onClose: () => void` - Funkcja wywoływana przy zamknięciu modala (np. kliknięcie "Anuluj" lub poza modalem).
  - `onConfirm: () => Promise<void>` - Funkcja (potencjalnie asynchroniczna) wywoływana po kliknięciu "Potwierdź usunięcie", odpowiedzialna za wywołanie API `deleteAccount`.

## 5. Typy

- **`ChangePasswordInput` (z `src/types/api.ts`):**

  ```typescript
  interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }
  ```

  Używany jako typ danych wejściowych dla akcji `changePassword`. Schemat Zod w formularzu powinien być zgodny z tym interfejsem.

- **`ChangePasswordOutput` (z `src/types/api.ts`):**

  ```typescript
  interface ChangePasswordOutput {
    message: string;
  }
  ```

  Używany do określenia kształtu odpowiedzi z backendu po pomyślnej zmianie hasła.

- **`DeleteAccountOutput` (z `src/types/api.ts`):**

```typescript
interface DeleteAccountOutput {
  message: string;
}
```

Używany do określenia kształtu odpowiedzi z backendu po pomyślnym usunięciu konta.

- **`ChangePasswordFormState` (ViewModel - do zdefiniowania w komponencie formularza):**

  ```typescript
  interface ChangePasswordFormState {
    isLoading: boolean; // Czy trwa wywołanie API
    apiError: string | null; // Komunikat błędu API (nie walidacji Zod)
  }
  ```

  Reprezentuje dodatkowy stan (poza `react-hook-form`) komponentu `ChangePasswordForm`.

- **`DeleteAccountModalState` (ViewModel - do zdefiniowania w komponencie modala):**

```typescript
interface DeleteAccountModalState {
  confirmationInput: string; // Wartość wpisana w polu potwierdzenia
  isConfirmButtonEnabled: boolean; // Czy przycisk potwierdzenia jest aktywny
  isLoading: boolean; // Czy trwa wywołanie API
  error: string | null; // Komunikat błędu API lub walidacji
}
```

Reprezentuje wewnętrzny stan komponentu `DeleteAccountConfirmationModal`.

## 6. Zarządzanie stanem

- **`AccountSettingsPage`:** Zarządza jednym stanem: `isModalOpen: boolean` (np. używając `useState` z React), aby kontrolować widoczność modala usuwania konta.
- **`ChangePasswordForm`:** Główny stan formularza (wartości pól, błędy walidacji, status wysłania) jest zarządzany przez `react-hook-form` połączony ze schematem `zod`. Dodatkowo, komponent zarządza stanem `isLoading` i `apiError` (`useState`) do obsługi komunikacji z API.
- **`DeleteAccountConfirmationModal`:** Zarządza swoim wewnętrznym stanem opisanym przez `DeleteAccountModalState`. Używa `useState` do śledzenia `confirmationInput`, `isLoading` i `error`. Stan `isConfirmButtonEnabled` jest zazwyczaj wartością pochodną od `confirmationInput`.
- **Opcjonalny Custom Hook (`useChangePassword`):** Można stworzyć hook, który enkapsuluje wywołanie API `changePassword`, zarządzanie stanem `isLoading` i `apiError`.
  ```typescript
  // Przybliżony interfejs hooka
  function useChangePassword(): {
    changePassword: (data: ChangePasswordInput) => Promise<void>; // Funkcja wywołująca API
    isLoading: boolean;
    error: string | null;
    data: ChangePasswordOutput | null; // Opcjonalnie, dane sukcesu
  };
  ```
- **Opcjonalny Custom Hook (`useDeleteAccount`):** Aby uprościć logikę w modalu, można stworzyć hook, który enkapsuluje wywołanie API `deleteAccount`, zarządzanie stanem `isLoading` i `error`.
  ```typescript
  // Przybliżony interfejs hooka
  function useDeleteAccount(): {
    deleteAccount: () => Promise<void>; // Funkcja wywołująca API
    isLoading: boolean;
    error: string | null;
    data: DeleteAccountOutput | null; // Opcjonalnie, dane sukcesu
  };
  ```

## 7. Integracja API

- **Endpoint (Zmiana Hasła):** Funkcja `changePassword` z `src/db/actions/auth/change-password.ts`. Jest to Server Action, wywoływana w `onSubmit` komponentu `ChangePasswordForm`.
- **Wywołanie (Zmiana Hasła):** `await changePassword(formData)` wewnątrz `onSubmit` po walidacji Zod. Należy obsłużyć błędy w bloku `try...catch`.
- **Typy żądania/odpowiedzi (Zmiana Hasła):**
  - **Żądanie:** `ChangePasswordInput`.
  - **Odpowiedź (sukces):** `Promise<ChangePasswordOutput>`.
  - **Odpowiedź (błąd):** Funkcja rzuca błędy (np. `Error("Unauthorized")`, `Error("Incorrect current password")`, `Error("Failed to update password...")`).
- **Endpoint (Usuwanie Konta):** Funkcja `deleteAccount` z `src/db/actions/profiles/delete-account.ts`. Jest to Server Action, wywoływana w `onConfirm` komponentu `DeleteAccountConfirmationModal`.
- **Wywołanie (Usuwanie Konta):** W komponencie `DeleteAccountConfirmationModal`, po kliknięciu przycisku "Potwierdź usunięcie" (i przejściu walidacji), należy wywołać `await deleteAccount()`.
- **Typy żądania/odpowiedzi (Usuwanie Konta):**
  - **Żądanie:** Brak jawnych parametrów (kontekst użytkownika brany z sesji po stronie serwera).
  - **Odpowiedź (błąd):** Funkcja rzuca błędy (np. `Error("Unauthorized")`, `Error("Server configuration error")`, `Error("Database error...")`). Należy je obsłużyć w bloku `try...catch`.

## 8. Interakcje użytkownika

**Zmiana hasła:**

1.  Użytkownik wypełnia pola formularza `ChangePasswordForm` (aktualne hasło, nowe hasło, potwierdzenie nowego hasła).
2.  System waliduje dane na bieżąco lub przy próbie wysłania (zgodnie z konfiguracją `react-hook-form`). Wyświetlane są błędy walidacji Zod przy polach.
3.  Użytkownik klika przycisk "Zmień hasło".
4.  Jeśli walidacja Zod przejdzie pomyślnie:
    - Stan `isLoading` formularza ustawiany jest na `true`.
    - Wywoływane jest `changePassword(formData)`.
    - **Sukces:**
      - `isLoading` ustawiane na `false`.
      - Stan `apiError` jest czyszczony (`null`).
      - Formularz jest resetowany.
      - Wyświetlany jest komunikat o sukcesie (np. używając `useToast` z Shadcn/ui).
    - **Błąd:**
      - `isLoading` ustawiane na `false`.
      - Stan `apiError` formularza jest ustawiany na odpowiedni komunikat (np. "Nieprawidłowe aktualne hasło", "Wystąpił błąd serwera").
      - Błąd API jest wyświetlany w formularzu (np. przy użyciu `Alert` z Shadcn/ui).

**Usuwanie konta:**

1.  Użytkownik klika przycisk "Usuń konto" w `AccountManagementSection`.
2.  `AccountSettingsPage` ustawia `isModalOpen` na `true`, co powoduje wyświetlenie `DeleteAccountConfirmationModal`.
3.  Użytkownik wpisuje tekst w polu `Input` modala. Stan `confirmationInput` jest aktualizowany. Przycisk "Potwierdź usunięcie" staje się aktywny tylko, gdy wpisany tekst to **"USUŃ KONTO".**
4.  Użytkownik klika "Anuluj": Modal jest zamykany (`onClose`).
5.  Użytkownik klika "Potwierdź usunięcie" (gdy aktywny):
    - Stan `isLoading` modala ustawiany jest na `true`.
    - Wywoływane jest `deleteAccount()`.
    - **Sukces:**
      - `isLoading` ustawiane na `false`.
      - Modal jest zamykany (`onClose`).
      - Wyświetlany jest komunikat o sukcesie (np. używając `useToast` z Shadcn/ui).
      - Użytkownik jest przekierowywany na stronę logowania (używając `useRouter` z `next/navigation`).
    - **Błąd:**
      - `isLoading` ustawiane na `false`.
      - Stan `error` modala jest ustawiany na odpowiedni komunikat.
      - Błąd jest wyświetlany wewnątrz modala (np. przy użyciu `Alert` z Shadcn/ui).

## 9. Warunki i walidacja

- **Dostęp do widoku:** Widok `/settings` powinien być dostępny tylko dla zalogowanych użytkowników (zapewnione przez routing/middleware).
- **Walidacja zmiany hasła (`ChangePasswordForm`):**
  - Wymagane wszystkie pola.
  - Nowe hasło musi różnić się od aktualnego.
  - Nowe hasło musi spełniać minimalne wymagania (np. długość).
  - Potwierdzenie nowego hasła musi być identyczne z nowym hasłem.
  - Walidacja realizowana przy użyciu `zod` i `react-hook-form`. Błędy wyświetlane przy polach.
- **Potwierdzenie usunięcia (`DeleteAccountConfirmationModal`):** Przycisk "Potwierdź usunięcie" jest warunkowo włączany (`disabled` prop) na podstawie porównania wartości `confirmationInput` ze stałą **"USUŃ KONTO"** (case-sensitive). Jest to kluczowa walidacja po stronie klienta zapobiegająca przypadkowemu usunięciu.

## 10. Obsługa błędów

**Formularz zmiany hasła:**

- **Błędy walidacji Zod:** Obsługiwane automatycznie przez `react-hook-form` i wyświetlane przy odpowiednich polach formularza.
- **Błąd `Unauthorized`:** Jeśli `changePassword()` rzuci błąd `Unauthorized`, należy ustawić `apiError` i wyświetlić komunikat. Rozważyć przekierowanie do logowania.
- **Błąd `Incorrect current password`:** Jeśli `changePassword()` rzuci ten specyficzny błąd, należy ustawić `apiError` na odpowiedni komunikat i wyświetlić go w formularzu.
- **Inne błędy serwera/API:** Przechwycić, ustawić generyczny komunikat w `apiError` ("Wystąpił nieoczekiwany błąd...") i wyświetlić w formularzu. Logować szczegóły po stronie serwera.
- **Wyświetlanie błędów API:** Komponent `Alert` z Shadcn/ui wewnątrz formularza jest dobrym miejscem do wyświetlania błędów `apiError`.

**Modal usuwania konta:**

- **Błąd autoryzacji (401):** Jeśli `deleteAccount()` rzuci błąd `Unauthorized` (np. sesja wygasła), należy przechwycić błąd w modalu, ustawić odpowiedni komunikat w stanie `error` i wyświetlić go użytkownikowi. Można rozważyć automatyczne przekierowanie do logowania w tym przypadku.
- **Błędy serwera/bazy danych:** Jeśli `deleteAccount()` rzuci inne błędy, należy przechwycić je, ustawić generyczny komunikat błędu w stanie `error` ("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.") i wyświetlić go w modalu. Szczegółowy błąd powinien być logowany po stronie serwera.
- **Błędy sieciowe:** Standardowa obsługa błędów sieciowych przy wywoływaniu Server Actions (Next.js częściowo to obsługuje).
- **Wyświetlanie błędów:** Komponent `Alert` z Shadcn/ui wewnątrz modala jest dobrym miejscem do wyświetlania komunikatów o błędach API.

## 11. Kroki implementacji

1.  **Utworzenie pliku strony:** Stwórz plik `src/app/settings/page.tsx`. Oznacz go jako komponent kliencki (`"use client"`) jeśli będzie zarządzał stanem modala.
2.  **Implementacja `AccountSettingsPage`:** Dodaj podstawową strukturę strony, w tym stan `isModalOpen` i funkcje do jego zmiany (`openModal`, `closeModal`). Renderuj `AccountManagementSection` i `DeleteAccountConfirmationModal`.
3.  **Aktualizacja `AccountManagementSection`:** Stwórz/zaktualizuj komponent `src/components/settings/AccountManagementSection.tsx`. Dodaj nagłówek. Renderuj komponent `ChangePasswordForm` oraz `DeleteAccountButton`. Przekaż `openModal` jako prop do `DeleteAccountButton`.
4.  **Implementacja `ChangePasswordForm`:** Stwórz komponent `src/components/settings/ChangePasswordForm.tsx`.
    - Zdefiniuj schemat Zod (`changePasswordSchema`).
    - Użyj `useForm` z `react-hook-form` i `zodResolver`.
    - Zbuduj strukturę formularza używając `Form`, `FormField`, `FormLabel`, `FormControl`, `FormMessage`, `Input` (type="password") i `Button` (type="submit") z Shadcn/ui.
    - Zaimplementuj stan `isLoading` i `apiError` (`useState`).
    - Zaimplementuj funkcję `onSubmit`:
      - Ustaw `isLoading` na `true`, wyczyść `apiError`.
      - Wywołaj `await changePassword(data)` w `try...catch`.
      - W `catch` obsłuż błędy, ustawiając `apiError`.
      - W `finally` ustaw `isLoading` na `false`.
      - Po sukcesie wyświetl toast (`useToast`) i zresetuj formularz (`form.reset()`).
    - Dodaj wyświetlanie stanu `isLoading` (np. przez dezaktywację przycisku, dodanie spinnera).
    - Dodaj wyświetlanie `apiError` (np. w komponencie `Alert`).
5.  **Implementacja `DeleteAccountButton`:** Stwórz/zaktualizuj komponent `src/components/settings/DeleteAccountButton.tsx` używając `Button` z Shadcn/ui z `variant="destructive"`. Podepnij prop `onClick`.
6.  **Implementacja `DeleteAccountConfirmationModal`:** Stwórz/zaktualizuj komponent `src/components/settings/DeleteAccountConfirmationModal.tsx` używając `Dialog` z Shadcn/ui.
    - Dodaj tytuł, opis (ostrzeżenie).
    - Dodaj `Input` do wprowadzania tekstu potwierdzającego (**"USUŃ KONTO"**).
    - Dodaj `Dialog.Footer` z przyciskami "Anuluj" i "Potwierdź usunięcie" (`variant="destructive"`).
    - Zaimplementuj wewnętrzny stan (`DeleteAccountModalState`) używając `useState`.
    - Dodaj logikę walidacji do włączania/wyłączania przycisku potwierdzenia.
    - Zaimplementuj obsługę kliknięcia przycisku "Potwierdź usunięcie":
      - Ustaw `isLoading` na `true`.
      - Wywołaj `deleteAccount()` w bloku `try...catch`.
      - W `catch` obsłuż błędy, ustawiając stan `error`.
      - W `finally` ustaw `isLoading` na `false`.
    - Dodaj wyświetlanie stanu `isLoading` (np. przez dezaktywację pól/przycisków, dodanie spinnera).
    - Dodaj wyświetlanie stanu `error` (np. w komponencie `Alert`).
    - Wywołaj `onClose` po kliknięciu "Anuluj".
7.  **Integracja `AccountSettingsPage` i Modala:** W `AccountSettingsPage`, renderuj `DeleteAccountConfirmationModal` warunkowo na podstawie stanu `isModalOpen`. Przekaż odpowiednie propsy (`isOpen`, `onClose`, `onConfirm`). Funkcja `onConfirm` (przekazana do modala) powinna wywołać `deleteAccount` i zawierać logikę sukcesu (toast, przekierowanie).
8.  **Obsługa sukcesu (zmiana hasła):** W `ChangePasswordForm`, po pomyślnym wywołaniu `changePassword`, użyj `useToast` do wyświetlenia komunikatu i zresetuj formularz.
9.  **Obsługa sukcesu i przekierowania (usunięcie konta):** W `onConfirm` (w `AccountSettingsPage` lub hooku), po pomyślnym wywołaniu `deleteAccount()`, użyj `useToast` do wyświetlenia komunikatu i `useRouter` z `next/navigation` do przekierowania na stronę logowania (`/login`).
10. **Styling i Responsywność:** Dopracuj wygląd widoku używając Tailwind CSS, upewniając się, że jest responsywny (mobile-first). Dodaj odpowiednie marginesy/paddingi między sekcjami formularza i przycisku usuwania.
11. **Testowanie:** Przetestuj ręcznie oba przepływy (zmiana hasła, usunięcie konta), w tym walidację i obsługę błędów. Rozważ dodanie testów automatycznych (np. Playwright dla E2E).
12. **Dostępność (A11y):** Sprawdź dostępność przy użyciu narzędzi deweloperskich przeglądarki i nawigacji klawiaturą. Komponenty Shadcn/ui powinny ułatwić ten proces, ale zwróć uwagę na powiązania etykiet z polami i komunikaty o błędach.
