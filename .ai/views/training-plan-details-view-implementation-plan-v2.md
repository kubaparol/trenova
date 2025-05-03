# Plan implementacji widoku Szczegółów Planu Treningowego

## 1. Przegląd

Ten widok wyświetla szczegółowe informacje dotyczące konkretnego planu treningowego użytkownika. Umożliwia przeglądanie struktury planu, w tym poszczególnych dni treningowych i ćwiczeń, a także zarządzanie planem (zmiana nazwy, usuwanie) oraz inicjowanie sesji treningowej dla wybranego dnia. Dodatkowo, wyświetla historię ukończonych sesji dla danego planu.

## 2. Routing widoku

- **Ścieżka**: `/training-plans/[id]`
  - Gdzie `[id]` to dynamiczny segment reprezentujący UUID planu treningowego.

## 3. Struktura komponentów

```
TrainingPlanDetailsPage (Server Component - /app/training-plans/[id]/page.tsx)
│
├── HeaderSection (Client Component)
│   ├── EditablePlanName (Client Component) // Edytowalna nazwa planu
│   └── ActionButtons (Client Component) // Przyciski Zmień nazwę, Usuń
│       ├── RenamePlanDialog (Client Component) // Okno modalne do zmiany nazwy
│       └── DeletePlanDialog (Client Component) // Okno modalne do potwierdzenia usunięcia
│
├── PlanDescription (Server Component) // Wyświetla opis planu
│
├── TrainingDaysAccordion (Client Component) // Akordeon z dniami treningowymi
│   └── AccordionItem (dla każdego dnia)
│       ├── AccordionTrigger // Nazwa dnia
│       └── AccordionContent
│           ├── ExerciseList (Client Component) // Lista ćwiczeń dla dnia
│           │   └── ExerciseListItem (Client Component) // Pojedyncze ćwiczenie
│           └── StartSessionButton (Client Component) // Przycisk "Rozpocznij Sesję"
│
└── SessionHistorySection (Client Component) // Sekcja historii sesji
    ├── SessionHistoryList (Client Component) // Lista ukończonych sesji
    │   └── SessionHistoryListItem (Client Component) // Pojedynczy wpis historii
    └── PaginationControls (Client Component) // Kontrolki paginacji (jeśli > limit)
```

## 4. Szczegóły komponentów

### TrainingPlanDetailsPage (Server Component)

- **Opis:** Główny komponent strony, odpowiedzialny za pobranie danych planu (w tym historii sesji) na serwerze i przekazanie ich do komponentów klienckich. Obsługuje routing i pobieranie ID planu z parametrów URL.
- **Główne elementy:** `HeaderSection`, `PlanDescription`, `TrainingDaysAccordion`, `SessionHistorySection`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika (Server Component).
- **Obsługiwana walidacja:** Brak (Server Component).
- **Typy:** `TrainingPlanDetailOutput`, `TrainingSessionListOutput`.
- **Propsy:** `params: { id: string }` (z Next.js).

### HeaderSection (Client Component)

- **Opis:** Wyświetla nagłówek strony, w tym nazwę planu i przyciski akcji.
- **Główne elementy:** `EditablePlanName`, `ActionButtons`.
- **Obsługiwane interakcje:** Brak bezpośrednich (delegowane do dzieci).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingPlanDetailOutput` (częściowo).
- **Propsy:** `plan: Pick<TrainingPlanDetailOutput, 'id' | 'name'>`, `onPlanUpdate: (updatedPlan: UpdateTrainingPlanNameOutput) => void`, `onPlanDelete: () => void`.

### EditablePlanName (Client Component)

- **Opis:** Wyświetla nazwę planu. Umożliwia edycję po kliknięciu (lub przez dedykowany przycisk w `ActionButtons`).
- **Główne elementy:** `<h1>` lub `<h2>`, `Input` (w trybie edycji, może być w dialogu), `Button` (zapisz zmiany).
- **Obsługiwane interakcje:** Wejście w tryb edycji, zmiana wartości w inpucie, zapisanie zmian, anulowanie edycji.
- **Obsługiwana walidacja:** Nazwa planu nie może być pusta, maksymalna długość (np. 255 znaków).
- **Typy:** `UpdateTrainingPlanNameInput`.
- **Propsy:** `initialName: string`, `planId: string`, `onSave: (newName: string) => Promise<void>`. // `onSave` wywoła akcję serwera

### ActionButtons (Client Component)

- **Opis:** Grupuje przyciski akcji "Zmień nazwę" i "Usuń". Otwiera odpowiednie dialogi.
- **Główne elementy:** `Button` ("Zmień nazwę"), `Button` ("Usuń"), `RenamePlanDialog`, `DeletePlanDialog`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Zmień nazwę" (otwiera dialog), Kliknięcie przycisku "Usuń" (otwiera dialog).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** `planId: string`, `planName: string`, `onPlanUpdate: (updatedPlan: UpdateTrainingPlanNameOutput) => void`, `onPlanDelete: () => void`.

### RenamePlanDialog (Client Component)

- **Opis:** Okno modalne do wprowadzania nowej nazwy planu.
- **Główne elementy:** Komponent `Dialog` z `shadcn/ui`, `Input` na nową nazwę, `Button` ("Zapisz"), `Button` ("Anuluj").
- **Obsługiwane interakcje:** Wpisanie nowej nazwy, potwierdzenie zapisu, anulowanie.
- **Obsługiwana walidacja:** Nazwa nie może być pusta, maksymalna długość. Wyświetlanie błędów walidacji.
- **Typy:** `UpdateTrainingPlanNameInput`.
- **Propsy:** `planId: string`, `currentName: string`, `isOpen: boolean`, `onClose: () => void`, `onSave: (input: UpdateTrainingPlanNameInput) => Promise<UpdateTrainingPlanNameOutput>`.

### DeletePlanDialog (Client Component)

- **Opis:** Okno modalne do potwierdzenia usunięcia planu.
- **Główne elementy:** Komponent `AlertDialog` z `shadcn/ui`, Tekst ostrzegawczy, `Button` ("Usuń"), `Button` ("Anuluj").
- **Obsługiwane interakcje:** Potwierdzenie usunięcia, anulowanie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `DeleteTrainingPlanInput`.
- **Propsy:** `planId: string`, `isOpen: boolean`, `onClose: () => void`, `onConfirmDelete: (input: DeleteTrainingPlanInput) => Promise<void>`.

### PlanDescription (Server Component)

- **Opis:** Wyświetla opis planu wygenerowany przez AI.
- **Główne elementy:** Sekcja (np. `<section>`), Nagłówek (np. `<h2>Opis Planu</h2>`), Akapit (`<p>`).
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingPlanDetailOutput['description']`.
- **Propsy:** `description: string`.

### TrainingDaysAccordion (Client Component)

- **Opis:** Wyświetla dni treningowe w formie akordeonu.
- **Główne elementy:** Komponent `Accordion` z `shadcn/ui`. Dla każdego dnia: `AccordionItem`, `AccordionTrigger`, `AccordionContent`.
- **Obsługiwane interakcje:** Rozwijanie/zwijanie poszczególnych dni.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingPlanDetailOutput['plan_details']['days']`, `PlanDay`.
- **Propsy:** `days: PlanDay[]`, `planId: string`.

### ExerciseList (Client Component)

- **Opis:** Wyświetla listę ćwiczeń dla danego dnia treningowego.
- **Główne elementy:** Lista (`<ul>` lub `<div>`), `ExerciseListItem` dla każdego ćwiczenia.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `Exercise[]`.
- **Propsy:** `exercises: Exercise[]`.

### ExerciseListItem (Client Component)

- **Opis:** Wyświetla szczegóły pojedynczego ćwiczenia.
- **Główne elementy:** Element listy (`<li>` lub `<div>`), Nazwa ćwiczenia, Informacje o seriach/powtórzeniach/czasie odpoczynku.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `Exercise`.
- **Propsy:** `exercise: Exercise`.

### StartSessionButton (Client Component)

- **Opis:** Przycisk umożliwiający rozpoczęcie sesji treningowej dla danego dnia.
- **Główne elementy:** `Button`.
- **Obsługiwane interakcje:** Kliknięcie przycisku. Powoduje nawigację do widoku sesji (jeszcze niezaimplementowanego), przekazując `planId` i `dayName`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** `planId: string`, `dayName: string`.

### SessionHistorySection (Client Component)

- **Opis:** Kontener dla historii ukończonych sesji treningowych związanych z tym planem.
- **Główne elementy:** Nagłówek (np. `<h2>Historia Sesji</h2>`), `SessionHistoryList`, `PaginationControls`.
- **Obsługiwane interakcje:** Zmiana strony w paginacji.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingSessionListOutput`.
- **Propsy:** `initialHistory: TrainingSessionListOutput`, `planId: string`.

### SessionHistoryList (Client Component)

- **Opis:** Wyświetla listę ukończonych sesji treningowych.
- **Główne elementy:** Lista (`<ul>` lub `<div>`), `SessionHistoryListItem` dla każdej sesji. Komunikat "Brak historii", jeśli lista jest pusta.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingSessionListItem[]`.
- **Propsy:** `sessions: TrainingSessionListItem[]`.

### SessionHistoryListItem (Client Component)

- **Opis:** Wyświetla informacje o pojedynczej ukończonej sesji.
- **Główne elementy:** Element listy (`<li>` lub `<div>`), Data ukończenia, Nazwa dnia planu, Czas trwania.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingSessionListItem`.
- **Propsy:** `session: TrainingSessionListItem`.

### PaginationControls (Client Component)

- **Opis:** Przyciski lub linki do nawigacji między stronami historii sesji, jeśli `total` > `limit`.
- **Główne elementy:** Komponent `Pagination` z `shadcn/ui` (lub własne przyciski).
- **Obsługiwane interakcje:** Kliknięcie na numer strony lub przyciski "Następna"/"Poprzednia".
- **Obsługiwana walidacja:** Dezaktywacja przycisków, gdy nie ma więcej stron.
- **Typy:** Brak specyficznych.
- **Propsy:** `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`.

## 5. Typy

- **Istniejące (z `src/types/api.ts`):**
  - `GetTrainingPlanInput`
  - `TrainingPlanDetailOutput`
  - `PlanDetails`
  - `PlanDay`
  - `Exercise`
  - `UpdateTrainingPlanNameInput`
  - `UpdateTrainingPlanNameOutput`
  - `DeleteTrainingPlanInput`
  - `DeleteTrainingPlanOutput`
  - `GetTrainingSessionsInput`
  - `TrainingSessionListOutput`
  - `TrainingSessionListItem`
- **Nowe/ViewModel (jeśli potrzebne):**
  - Na ten moment nie wydaje się konieczne wprowadzanie dedykowanych typów ViewModel. Typy z `api.ts` wydają się wystarczające do bezpośredniego użycia w komponentach, ewentualnie z wykorzystaniem `Pick` lub `Omit` w propsach.

## 6. Zarządzanie stanem

- **Server Component (`TrainingPlanDetailsPage`):** Pobiera początkowe dane planu i historii sesji.
- **Client Components:**
  - **`HeaderSection` / `EditablePlanName` / `RenamePlanDialog`:** Lokalny stan do zarządzania trybem edycji nazwy i wartością w inpucie. Wykorzystanie `useState`.
  - **`ActionButtons` / `RenamePlanDialog` / `DeletePlanDialog`:** Lokalny stan do zarządzania widocznością dialogów (`useState`). Stan ładowania/błędu podczas wywołań API (`useState`).
  - **`SessionHistorySection`:** Stan przechowujący aktualnie wyświetlaną listę sesji (`useState`), aktualny numer strony (`useState`), stan ładowania/błędu podczas pobierania kolejnych stron (`useState`). Rozważenie użycia `useSWR` lub `React Query` (jeśli jest w projekcie) do zarządzania pobieraniem danych historii i paginacją, co uprościłoby obsługę stanu ładowania, błędów i odświeżania. Na razie zakładamy użycie `useState` i `fetch`/Server Actions.
  - **`TrainingDaysAccordion`:** Stan wewnętrzny komponentu `Accordion` z `shadcn/ui` zarządza rozwiniętymi elementami.
- **Custom Hook:**
  - Można rozważyć stworzenie hooka `useSessionHistory(planId, initialData)` do enkapsulacji logiki pobierania, paginacji i zarządzania stanem historii sesji w `SessionHistorySection`. Hook ten zarządzałby stanem `sessions`, `currentPage`, `totalPages`, `isLoading`, `error` i udostępniałby funkcję `fetchPage(pageNumber)`.

## 7. Integracja API

- **Pobieranie danych (Server Component):**
  - W `TrainingPlanDetailsPage`:
    - Wywołanie akcji serwera (lub bezpośrednio funkcji DB) `getTrainingPlanById({ id: params.id })` -> Oczekiwany wynik: `TrainingPlanDetailOutput`.
    - Wywołanie akcji serwera `getTrainingSessions({ plan_id: params.id, page: 1, limit: 10 })` -> Oczekiwany wynik: `TrainingSessionListOutput`.
    - Obsługa błędów 401/403/404 na poziomie strony (np. przekierowanie lub wyświetlenie komunikatu).
- **Aktualizacja nazwy (Client Component -> Server Action):**
  - W `RenamePlanDialog` (lub `EditablePlanName`):
    - Wywołanie Server Action `updatePlanNameAction(input: UpdateTrainingPlanNameInput)`
    - **Input:** `UpdateTrainingPlanNameInput` (`{ id: planId, name: newName }`)
    - **Output (Success):** `UpdateTrainingPlanNameOutput`
    - **Output (Error):** Rzucony błąd (mapowany na 400, 401, 403, 404, 500 w Server Action)
- **Usuwanie planu (Client Component -> Server Action):**
  - W `DeletePlanDialog`:
    - Wywołanie Server Action `deletePlanAction(input: DeleteTrainingPlanInput)`
    - **Input:** `DeleteTrainingPlanInput` (`{ id: planId }`)
    - **Output (Success):** `DeleteTrainingPlanOutput`
    - **Output (Error):** Rzucony błąd (mapowany na 401, 403, 404, 500 w Server Action)
- **Pobieranie historii sesji (Client Component -> Server Action - dla paginacji):**
  - W `SessionHistorySection` (lub `useSessionHistory` hook):
    - Wywołanie Server Action `fetchSessionHistoryPageAction(input: GetTrainingSessionsInput & { plan_id: string })`
    - **Input:** `{ plan_id: planId, page: requestedPage, limit: 10 }`
    - **Output (Success):** `TrainingSessionListOutput`
    - **Output (Error):** Rzucony błąd (mapowany na 401, 500 w Server Action)

## 8. Interakcje użytkownika

- **Wyświetlanie szczegółów:** Dane ładowane automatycznie przy wejściu na stronę.
- **Rozwijanie/Zwijanie dni:** Kliknięcie na nagłówek dnia w akordeonie.
- **Edycja nazwy planu:**
  - Kliknięcie przycisku "Zmień nazwę" -> Otwarcie `RenamePlanDialog`.
  - Wpisanie nowej nazwy w dialogu.
  - Kliknięcie "Zapisz" -> Wywołanie API, zamknięcie dialogu, aktualizacja nazwy w UI (lub odświeżenie danych). Wyświetlenie komunikatu sukcesu (np. toast).
  - Kliknięcie "Anuluj" -> Zamknięcie dialogu bez zmian.
- **Usuwanie planu:**
  - Kliknięcie przycisku "Usuń" -> Otwarcie `DeletePlanDialog`.
  - Kliknięcie "Usuń" w dialogu -> Wywołanie API, przekierowanie do listy planów (`/training-plans`) po sukcesie. Wyświetlenie komunikatu sukcesu (np. toast).
  - Kliknięcie "Anuluj" -> Zamknięcie dialogu.
- **Rozpoczęcie sesji:**
  - Kliknięcie przycisku "Rozpocznij Sesję" pod listą ćwiczeń danego dnia -> Przekierowanie do widoku sesji (np. `/session/[planId]/[dayNameEncoded]`).
- **Paginacja historii sesji:**
  - Kliknięcie numeru strony lub przycisków nawigacyjnych -> Wywołanie API w celu pobrania nowej strony danych, aktualizacja listy sesji w `SessionHistoryList`.

## 9. Warunki i walidacja

- **Nazwa planu (`RenamePlanDialog`, `EditablePlanName`):**
  - Pole wymagane (nie może być puste).
  - Maksymalna długość (np. 255 znaków).
  - Walidacja po stronie klienta przed wysłaniem do Server Action. Wyświetlanie komunikatów o błędach przy inpucie. Server Action również powinno walidować.
- **Przycisk "Zapisz" (zmiana nazwy):** Aktywny tylko, gdy wprowadzona nazwa jest poprawna i różni się od obecnej.
- **Przycisk "Rozpocznij Sesję":** Zawsze aktywny (chyba że są specyficzne warunki biznesowe).
- **Przyciski Paginacji:** Odpowiednio włączone/wyłączone w zależności od `currentPage` i `totalPages`.

## 10. Obsługa błędów

- **Błędy ładowania danych (Server Component):**
  - Nie znaleziono planu (404) / Brak dostępu (403): Wyświetlenie dedykowanej strony błędu lub komponentu "Nie znaleziono planu".
  - Błąd serwera (500): Wyświetlenie generycznej strony błędu.
  - Brak autoryzacji (401): Middleware lub logika strony powinna przekierować do logowania.
- **Błędy API (Client Components -> Server Actions):**
  - **Zmiana nazwy / Usuwanie:**
    - Błąd walidacji (400): Wyświetlenie błędu przy inpucie w dialogu.
    - Nie znaleziono / Brak dostępu (404/403): Wyświetlenie komunikatu (np. toast) "Nie można wykonać operacji. Plan nie istnieje lub nie masz uprawnień." Rozważenie odświeżenia strony lub przekierowania.
    - Błąd serwera (500): Wyświetlenie generycznego komunikatu błędu (np. toast) "Wystąpił błąd serwera. Spróbuj ponownie później."
    - Stan ładowania: Wyświetlanie wskaźnika ładowania na przyciskach akcji w dialogach podczas wywołania API.
  - **Pobieranie historii (paginacja):**
    - Błąd serwera (500): Wyświetlenie komunikatu w sekcji historii "Nie udało się załadować historii." Możliwość ponowienia próby.
    - Stan ładowania: Wyświetlanie wskaźnika ładowania w sekcji historii podczas pobierania nowej strony.
- **Ogólne:** Użycie komponentów `Toast` z `shadcn/ui` do informowania o sukcesach i błędach operacji.

## 11. Kroki implementacji

1.  **Routing:** Utwórz strukturę folderów i plik strony: `src/app/training-plans/[id]/page.tsx`.
2.  **Strona Główna (Server Component):** Zaimplementuj `TrainingPlanDetailsPage`, w tym pobieranie danych `getTrainingPlanById` i `getTrainingSessions` przy użyciu Server Actions lub bezpośrednich wywołań funkcji DB. Obsłuż podstawowe błędy (404, 500).
3.  **Layout Podstawowy:** Stwórz szkielet strony z głównymi sekcjami (`HeaderSection`, `PlanDescription`, `TrainingDaysAccordion`, `SessionHistorySection`), przekazując pobrane dane jako propsy.
4.  **Komponent `PlanDescription`:** Zaimplementuj prosty komponent serwerowy wyświetlający opis.
5.  **Komponent `HeaderSection` (Client):** Zaimplementuj komponent kliencki, na razie tylko wyświetlający nazwę (bez edycji) i puste `ActionButtons`.
6.  **Komponent `TrainingDaysAccordion` (Client):** Zaimplementuj akordeon (`shadcn/ui`), iterując po `days`.
7.  **Komponenty `ExerciseList` i `ExerciseListItem` (Client):** Zaimplementuj wyświetlanie listy ćwiczeń wewnątrz `AccordionContent`.
8.  **Komponent `StartSessionButton` (Client):** Dodaj przycisk, na razie bez logiki nawigacji.
9.  **Server Actions (Modyfikacje):**
    - Utwórz Server Action `updatePlanNameAction` opakowujące `updateTrainingPlanName`. Dodaj walidację wejścia (np. Zod) i obsługę błędów (mapowanie na wyjątki HTTP).
    - Utwórz Server Action `deletePlanAction` opakowujące `deleteTrainingPlan`. Dodaj obsługę błędów.
10. **Komponent `ActionButtons` (Client):** Dodaj przyciski "Zmień nazwę" i "Usuń".
11. **Komponent `RenamePlanDialog` (Client):** Zaimplementuj dialog (`shadcn/ui`), formularz z walidacją (`react-hook-form` + `zod`?), logikę wywołania `updatePlanNameAction`, obsługę stanu ładowania/błędów, aktualizację UI po sukcesie.
12. **Komponent `DeletePlanDialog` (Client):** Zaimplementuj dialog (`shadcn/ui`), logikę wywołania `deletePlanAction`, obsługę stanu ładowania/błędów, przekierowanie po sukcesie (`useRouter` z `next/navigation`).
13. **Integracja Dialogów:** Podłącz logikę otwierania/zamykania dialogów z `ActionButtons` do `HeaderSection`. Zaimplementuj `onPlanUpdate` i `onPlanDelete` w `HeaderSection` do aktualizacji stanu/przekierowania.
14. **Komponent `SessionHistorySection` (Client):** Zaimplementuj komponent, przekazując `initialHistory`.
15. **Komponenty `SessionHistoryList` i `SessionHistoryListItem` (Client):** Zaimplementuj wyświetlanie początkowej listy sesji.
16. **Server Action (Historia):** Utwórz Server Action `fetchSessionHistoryPageAction` opakowujące `getTrainingSessions`.
17. **Paginacja (Client):**
    - Zaimplementuj `PaginationControls` (`shadcn/ui`).
    - Dodaj logikę do `SessionHistorySection` do zarządzania stanem (`sessions`, `currentPage`, `totalPages`, `isLoading`, `error`), wywoływania `fetchSessionHistoryPageAction` przy zmianie strony i aktualizacji listy. (Rozważ `useSessionHistory` hook).
18. **Logika `StartSessionButton`:** Dodaj nawigację (`useRouter`) do przyszłego widoku sesji.
19. **Styling i RWD:** Dopracuj wygląd zgodnie z Tailwind i upewnij się, że widok jest responsywny.
20. **Testowanie:** Dodaj testy (jednostkowe/integracyjne dla akcji serwera, komponentów; E2E dla przepływów użytkownika).
21. **Dostępność:** Sprawdź dostępność elementów interaktywnych (przyciski, akordeon, dialogi, formularze).
