# Plan implementacji widoku Ustawień Konta (`/settings`)

## 1. Przegląd

Widok Ustawień Konta (`/settings`) umożliwia zalogowanym użytkownikom zarządzanie podstawowymi ustawieniami ich konta. W ramach MVP (Minimum Viable Product) główną funkcjonalnością tej sekcji jest umożliwienie użytkownikowi bezpiecznego usunięcia swojego konta wraz ze wszystkimi powiązanymi danymi. Proces usuwania wymagać będzie potwierdzenia poprzez wpisanie określonej frazy w modalu.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/settings`. Dostęp do tej ścieżki powinien być ograniczony tylko dla zalogowanych użytkowników (co powinno być zapewnione przez globalne mechanizmy middleware lub layout aplikacji).

## 3. Struktura komponentów

Hierarchia komponentów dla widoku `/settings` będzie następująca:

```
AccountSettingsPage (src/app/settings/page.tsx)
└── AccountManagementSection (src/components/settings/AccountManagementSection.tsx)
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

- **Opis komponentu:** Główny komponent strony dla ścieżki `/settings`. Renderuje układ strony i zawiera sekcję zarządzania kontem. Odpowiada za zarządzanie widocznością modala potwierdzającego usunięcie konta.
- **Główne elementy:** Kontener (`div`), `AccountManagementSection`, `DeleteAccountConfirmationModal`.
- **Obsługiwane interakcje:** Otwarcie modala potwierdzającego usunięcie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Wykorzystuje wewnętrzny stan (`isModalOpen`).
- **Propsy:** Brak.

### `AccountManagementSection`

- **Opis komponentu:** Sekcja dedykowana akcjom związanym z kontem. Na razie zawiera tylko przycisk do inicjowania procesu usuwania konta.
- **Główne elementy:** Kontener (`div`), `h2` lub podobny nagłówek sekcji, `DeleteAccountButton`.
- **Obsługiwane interakcje:** Przekazuje zdarzenie kliknięcia przycisku do rodzica (`AccountSettingsPage`) w celu otwarcia modala.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:**
  - `onOpenDeleteModal: () => void` - Funkcja wywoływana po kliknięciu przycisku usuwania.

### `DeleteAccountButton`

- **Opis komponentu:** Przycisk (bazujący na `Shadcn/ui Button`) inicjujący proces usuwania konta. Powinien mieć stylizację wskazującą na akcję destrukcyjną (`variant="destructive"`).
- **Główne elementy:** `Button` z `Shadcn/ui`.
- **Obsługiwane interakcje:** `onClick`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Standardowe typy zdarzeń przycisku.
- **Propsy:**
  - `onClick: () => void` - Funkcja wywoływana po kliknięciu.

### `DeleteAccountConfirmationModal`

- **Opis komponentu:** Modal (bazujący na `Shadcn/ui Dialog`) służący do potwierdzenia chęci usunięcia konta. Zawiera ostrzeżenie oraz pole tekstowe, w które użytkownik musi wpisać "USUŃ KONTO", aby aktywować przycisk ostatecznego potwierdzenia. Zarządza stanem ładowania i błędów podczas wywołania API.
- **Główne elementy:** `Dialog`, `Dialog.Title`, `Dialog.Description` (ostrzeżenie), `Input` (Shadcn/ui), `Dialog.Footer`, `Button` (Anuluj), `Button` (Potwierdź - destructive).
- **Obsługiwane interakcje:**
  - Zmiana wartości w polu tekstowym (`onChange`).
  - Kliknięcie przycisku "Anuluj".
  - Kliknięcie przycisku "Potwierdź usunięcie".
- **Obsługiwana walidacja:**
  - Przycisk "Potwierdź usunięcie" jest aktywny (`disabled={false}`) tylko wtedy, gdy wartość wpisana w polu `Input` jest _dokładnie_ równa "USUŃ KONTO" (case-sensitive).
- **Typy:**
  - Wewnętrzny stan: `ViewModel: DeleteAccountModalState` (patrz sekcja 5).
  - DTO: `DeleteAccountOutput` (oczekiwany typ odpowiedzi z API w przypadku sukcesu).
- **Propsy:**
  - `isOpen: boolean` - Kontroluje widoczność modala.
  - `onClose: () => void` - Funkcja wywoływana przy zamknięciu modala (np. kliknięcie "Anuluj" lub poza modalem).
  - `onConfirm: () => Promise<void>` - Funkcja (potencjalnie asynchroniczna) wywoływana po kliknięciu "Potwierdź usunięcie", odpowiedzialna za wywołanie API.

## 5. Typy

- **`DeleteAccountOutput` (z `src/types/api.ts`):**

  ```typescript
  interface DeleteAccountOutput {
    message: string;
  }
  ```

  Używany do określenia kształtu odpowiedzi z backendu po pomyślnym usunięciu konta.

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

- **`AccountSettingsPage`:** Zarządza jednym stanem: `isModalOpen: boolean` (np. używając `useState` z React), aby kontrolować widoczność modala.
- **`DeleteAccountConfirmationModal`:** Zarządza swoim wewnętrznym stanem opisanym przez `DeleteAccountModalState`. Używa `useState` do śledzenia `confirmationInput`, `isLoading` i `error`. Stan `isConfirmButtonEnabled` jest zazwyczaj wartością pochodną od `confirmationInput`.
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

- **Endpoint:** Funkcja `deleteAccount` z `src/db/actions/profiles/delete-account.ts`. Jest to Server Action w Next.js, więc można ją bezpośrednio importować i wywoływać w komponencie serwerowym lub w komponencie klienckim (oznaczonym `"use client"`).
- **Wywołanie:** W komponencie `DeleteAccountConfirmationModal`, po kliknięciu przycisku "Potwierdź usunięcie" (i przejściu walidacji), należy wywołać `await deleteAccount()`.
- **Typy żądania/odpowiedzi:**
  - **Żądanie:** Brak jawnych parametrów (kontekst użytkownika brany z sesji po stronie serwera).
  - **Odpowiedź (sukces):** `Promise<DeleteAccountOutput>` (`{ message: string }`).
  - **Odpowiedź (błąd):** Funkcja rzuca błędy (np. `Error("Unauthorized")`, `Error("Server configuration error")`, `Error("Database error...")`). Należy je obsłużyć w bloku `try...catch`.

## 8. Interakcje użytkownika

1.  Użytkownik klika przycisk "Usuń konto" w `AccountManagementSection`.
2.  `AccountSettingsPage` ustawia `isModalOpen` na `true`, co powoduje wyświetlenie `DeleteAccountConfirmationModal`.
3.  Użytkownik wpisuje tekst w polu `Input` modala. Stan `confirmationInput` jest aktualizowany. Przycisk "Potwierdź usunięcie" staje się aktywny tylko, gdy wpisany tekst to "USUŃ KONTO".
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
- **Potwierdzenie usunięcia:** W `DeleteAccountConfirmationModal`, przycisk "Potwierdź usunięcie" jest warunkowo włączany (`disabled` prop) na podstawie porównania wartości `confirmationInput` ze stałą "USUŃ KONTO". Jest to kluczowa walidacja po stronie klienta zapobiegająca przypadkowemu usunięciu. Porównanie musi być czułe na wielkość liter.

## 10. Obsługa błędów

- **Błąd autoryzacji (401):** Jeśli `deleteAccount()` rzuci błąd `Unauthorized` (np. sesja wygasła), należy przechwycić błąd w modalu, ustawić odpowiedni komunikat w stanie `error` i wyświetlić go użytkownikowi. Można rozważyć automatyczne przekierowanie do logowania w tym przypadku.
- **Błędy serwera/bazy danych:** Jeśli `deleteAccount()` rzuci inne błędy, należy przechwycić je, ustawić generyczny komunikat błędu w stanie `error` ("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.") i wyświetlić go w modalu. Szczegółowy błąd powinien być logowany po stronie serwera.
- **Błędy sieciowe:** Standardowa obsługa błędów sieciowych przy wywoływaniu Server Actions (Next.js częściowo to obsługuje).
- **Wyświetlanie błędów:** Komponent `Alert` z Shadcn/ui wewnątrz modala jest dobrym miejscem do wyświetlania komunikatów o błędach API.

## 11. Kroki implementacji

1.  **Utworzenie pliku strony:** Stwórz plik `src/app/settings/page.tsx`. Oznacz go jako komponent kliencki (`"use client"`) jeśli będzie zarządzał stanem modala.
2.  **Implementacja `AccountSettingsPage`:** Dodaj podstawową strukturę strony, w tym stan `isModalOpen` i funkcje do jego zmiany (`openModal`, `closeModal`).
3.  **Implementacja `AccountManagementSection`:** Stwórz komponent `src/components/settings/AccountManagementSection.tsx`. Dodaj nagłówek i przekaż `openModal` jako prop do `DeleteAccountButton`.
4.  **Implementacja `DeleteAccountButton`:** Stwórz komponent `src/components/settings/DeleteAccountButton.tsx` używając `Button` z Shadcn/ui z `variant="destructive"`. Podepnij prop `onClick`.
5.  **Implementacja `DeleteAccountConfirmationModal`:** Stwórz komponent `src/components/settings/DeleteAccountConfirmationModal.tsx` używając `Dialog` z Shadcn/ui.
    - Dodaj tytuł, opis (ostrzeżenie).
    - Dodaj `Input` do wprowadzania tekstu potwierdzającego.
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
6.  **Integracja `AccountSettingsPage` i Modala:** W `AccountSettingsPage`, renderuj `DeleteAccountConfirmationModal` warunkowo na podstawie stanu `isModalOpen`. Przekaż odpowiednie propsy (`isOpen`, `onClose`, `onConfirm`). Funkcja `onConfirm` powinna zawierać logikę sukcesu (toast, przekierowanie).
7.  **Obsługa sukcesu i przekierowania:** Po pomyślnym wywołaniu `deleteAccount()` w `onConfirm` (lub w hooku `useDeleteAccount`), użyj `useToast` do wyświetlenia komunikatu i `useRouter` do przekierowania na stronę logowania (`/login`).
8.  **Styling i Responsywność:** Dopracuj wygląd widoku używając Tailwind CSS, upewniając się, że jest responsywny (mobile-first).
9.  **Testowanie:** Przetestuj ręcznie przepływ usuwania konta, w tym walidację i obsługę błędów (np. przez tymczasowe zasymulowanie błędu w akcji serwera). Rozważ dodanie testów automatycznych (np. Playwright dla E2E).
10. **Dostępność (A11y):** Sprawdź dostępność przy użyciu narzędzi deweloperskich przeglądarki i nawigacji klawiaturą. Komponenty Shadcn/ui powinny ułatwić ten proces.
