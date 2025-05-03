# Plan implementacji widoku Sesji Treningowej

## 1. Przegląd

Widok Sesji Treningowej pozwala użytkownikom na interaktywne przechodzenie przez ćwiczenia zaplanowane na dany dzień treningowy. Użytkownik oznacza ukończenie każdego elementu (ćwiczenia/serii) sekwencyjnie. Po ukończeniu ostatniego elementu, sesja jest automatycznie zapisywana w historii użytkownika wraz z całkowitym czasem jej trwania. Opuszczenie widoku przed ukończeniem ostatniego elementu skutkuje utratą postępu dla danej sesji.

## 2. Routing widoku

Widok powinien być dostępny pod dynamiczną ścieżką:
`/training-plans/[planId]/session/[dayName]`

- `[planId]`: UUID planu treningowego.
- `[dayName]`: Nazwa dnia treningowego (np. "Day 1 - Chest"). Warto rozważyć użycie ID dnia lub slug zamiast pełnej nazwy, jeśli nazwy mogą zawierać znaki specjalne lub być bardzo długie, ale na razie trzymamy się `dayName` zgodnie z opisem.

## 3. Struktura komponentów

```
TrainingSessionView (Komponent strony Next.js)
  ├── DataLossWarning (Komponent UI - Shadcn Alert?)
  ├── SessionTimer (Komponent UI)
  ├── SessionExerciseList (Komponent UI)
  │   └── SessionExerciseItem (mapowany z listy ćwiczeń) (Komponent UI)
  └── RestTimer (Komponent UI, renderowany warunkowo)
```

## 4. Szczegóły komponentów

### `TrainingSessionView` (Page Component)

- **Opis:** Główny kontener widoku. Odpowiedzialny za:
  - Pobieranie danych planu treningowego (ćwiczeń dla danego dnia) na podstawie `planId` i `dayName` z URL.
  - Zarządzanie głównym stanem sesji (aktywny element, status ukończenia, stan sesji: ćwiczenie/odpoczynek, czas rozpoczęcia, całkowity czas trwania).
  - Wywoływanie akcji API `completeTrainingSession` po ukończeniu ostatniego elementu.
  - Obsługę błędów ładowania danych i zapisu sesji.
  - Renderowanie komponentów podrzędnych (`DataLossWarning`, `SessionTimer`, `SessionExerciseList`, `RestTimer`).
  - Implementacja logiki ostrzegania o utracie danych przy próbie opuszczenia strony (np. przez `beforeunload`, choć z ograniczeniami).
  - Przekierowanie użytkownika po pomyślnym zapisaniu sesji (np. do historii).
- **Główne elementy:** Div kontenera, logika pobierania danych (np. `useEffect`), logika zarządzania stanem (np. `useState`, `useReducer`, lub custom hook `useTrainingSession`).
- **Obsługiwane interakcje:** Inicjalizacja sesji po załadowaniu danych, obsługa sygnałów z `SessionExerciseItem` (ukończenie elementu) i `RestTimer` (koniec odpoczynku), wywołanie API, obsługa nawigacji/opuszczenia strony.
- **Obsługiwana walidacja:** Sprawdzenie obecności `planId` i `dayName` w parametrach URL. Weryfikacja, czy pobrane dane planu są poprawne i zawierają ćwiczenia dla danego dnia.
- **Typy:** `TrainingPlanDetailOutput`, `CompleteTrainingSessionInput`, `CompleteTrainingSessionOutput`, wewnętrzne typy stanu.
- **Propsy:** Przyjmuje parametry (`planId`, `dayName`) z routingu Next.js.

### `DataLossWarning`

- **Opis:** Wyświetla stałe, widoczne ostrzeżenie dla użytkownika, informujące, że opuszczenie strony przed ukończeniem sesji spowoduje utratę niezapisanych postępów. Może użyć komponentu `Alert` z Shadcn/ui.
- **Główne elementy:** Komponent `Alert` lub podobny div z tekstem ostrzegawczym.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów.
- **Propsy:** Brak.

### `SessionTimer`

- **Opis:** Wyświetla całkowity czas trwania sesji, liczony od momentu jej rozpoczęcia (załadowania widoku i danych). Aktualizuje się co sekundę.
- **Główne elementy:** Element tekstowy (np. `<span>`, `<p>`) wyświetlający czas w formacie HH:MM:SS lub MM:SS.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `number` (czas w sekundach).
- **Propsy:** `elapsedTime: number` (całkowity czas w sekundach).

### `SessionExerciseList`

- **Opis:** Renderuje listę elementów sesji (`SessionExerciseItem`). Odpowiada za przewinięcie widoku (scroll) do aktualnie aktywnego elementu.
- **Główne elementy:** Lista (`<ul>` lub `<div>`) zawierająca zmapowane komponenty `SessionExerciseItem`. Logika `useEffect` do obsługi przewijania (`scrollIntoView`).
- **Obsługiwane interakcje:** Przekazuje zdarzenie ukończenia elementu z `SessionExerciseItem` do `TrainingSessionView`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `Exercise[]`, `number` (indeks aktywnego elementu), `boolean[]` (statusy ukończenia), `string` (aktualny stan sesji: 'exercise'/'rest').
- **Propsy:**
  - `exercises: Exercise[]`
  - `activeIndex: number`
  - `completedStatus: boolean[]`
  - `sessionState: 'idle' | 'active_exercise' | 'active_rest' | 'finished' | 'error'`
  - `onItemComplete: (index: number) => void`

### `SessionExerciseItem`

- **Opis:** Reprezentuje pojedynczy element na liście (ćwiczenie/serię). Wyświetla nazwę ćwiczenia, serie/powtórzenia/czas. Jest klikalny/dotykalny tylko gdy jest aktywny i stan sesji to 'active_exercise'. Wizualnie sygnalizuje status: ukończony, aktywny, oczekujący.
- **Główne elementy:** Element listy (`<li>` lub `<div>`), tekst z nazwą i detalami ćwiczenia. Stylowanie warunkowe w zależności od statusu (ukończony, aktywny). Może użyć komponentu `Card` z Shadcn/ui.
- **Obsługiwane interakcje:** `onClick`/`onTouchEnd` (gdy aktywny i `sessionState === 'active_exercise'`) wywołuje `onItemComplete(index)` przekazany przez propsy.
- **Obsługiwana walidacja:** Interakcja jest aktywna tylko pod warunkiem `isActive && sessionState === 'active_exercise'`.
- **Typy:** `Exercise`.
- **Propsy:**
  - `exercise: Exercise`
  - `index: number`
  - `isActive: boolean`
  - `isCompleted: boolean`
  - `sessionState: 'idle' | 'active_exercise' | 'active_rest' | 'finished' | 'error'`
  - `onItemComplete: (index: number) => void`

### `RestTimer`

- **Opis:** Wyświetla wizualny licznik czasu odpoczynku. Pokazywany tylko gdy `sessionState === 'active_rest'`. Sygnalizuje zakończenie odliczania. Może użyć komponentu `Progress` lub niestandardowej wizualizacji SVG z Shadcn/ui.
- **Główne elementy:** Komponent wizualizujący postęp (np. kołowy, liniowy), tekst pokazujący pozostały czas.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika. Wewnętrznie używa `setInterval` do odliczania.
- **Obsługiwana walidacja:** Renderowany i aktywny tylko gdy `sessionState === 'active_rest'`.
- **Typy:** `number`.
- **Propsy:**
  - `duration: number` (całkowity czas odpoczynku w sekundach)
  - `remaining: number` (pozostały czas odpoczynku w sekundach)
  - `onTimerEnd: () => void`

## 5. Typy

Główne typy pochodzą z `src/types/api.ts`:

- `Exercise`: Definiuje strukturę pojedynczego ćwiczenia.
  ```typescript
  export interface Exercise {
    name: string;
    sets: number;
    repetitions: number;
    rest_time_seconds: number;
    duration_seconds?: number; // Jeśli ćwiczenie jest na czas
    duration_minutes?: number; // Alternatywnie
  }
  ```
- `PlanDay`: Definiuje strukturę dnia treningowego.
  ```typescript
  export interface PlanDay {
    day: string;
    exercises: Exercise[];
  }
  ```
- `PlanDetails`: Struktura pola JSON `plan_details`.
  ```typescript
  export interface PlanDetails {
    days: PlanDay[];
    description: string;
  }
  ```
- `TrainingPlanDetailOutput`: Typ danych oczekiwany przy pobieraniu szczegółów planu.
  ```typescript
  export type TrainingPlanDetailOutput = Pick<
    Tables<"training_plans">,
    "id" | "name" | "created_at" | "user_id" | "description"
  > & {
    plan_details: PlanDetails;
  };
  ```
- `CompleteTrainingSessionInput`: Typ danych wejściowych dla akcji zapisu sesji.
  ```typescript
  export interface CompleteTrainingSessionInput {
    plan_id: string; // UUID
    plan_day_name: string;
    duration_seconds: number; // positive integer
  }
  ```
- `CompleteTrainingSessionOutput`: Typ danych wyjściowych z akcji zapisu sesji.
  ```typescript
  export interface CompleteTrainingSessionOutput {
    id: string; // UUID nowo utworzonego rekordu
    message: string;
  }
  ```

**Typy Stanu Wewnętrznego (Przykłady):**

```typescript
type SessionState =
  | "idle"
  | "loading"
  | "active_exercise"
  | "active_rest"
  | "submitting"
  | "finished"
  | "error";

interface TrainingSessionState {
  planDetails: TrainingPlanDetailOutput | null;
  exercises: Exercise[];
  activeIndex: number;
  completedStatus: boolean[];
  sessionState: SessionState;
  startTime: number | null; // Timestamp ms
  elapsedTime: number; // seconds
  restTimerDuration: number; // seconds
  restTimerRemaining: number; // seconds
  error: string | null;
}
```

## 6. Zarządzanie stanem

Złożoność logiki sesji (timery, stany, przejścia, obsługa API) uzasadnia użycie **custom hooka** np. `useTrainingSession`.

**`useTrainingSession(planId: string, dayName: string)`:**

- **Odpowiedzialność:**
  - Pobieranie danych planu (`useEffect` przy montowaniu).
  - Zarządzanie całym stanem sesji (`TrainingSessionState` używając `useState` lub `useReducer`).
  - Obsługa timerów (`setInterval` dla `elapsedTime` i `restTimerRemaining`, czyszczenie w `useEffect cleanup`).
  - Implementacja logiki przejść między stanami (`active_exercise` -> `active_rest` -> `active_exercise`).
  - Kalkulacja końcowego `duration_seconds`.
  - Wywołanie akcji `completeTrainingSession`.
  - Obsługa stanu ładowania i błędów.
  - Potencjalnie obsługa `beforeunload`.
- **Zwracane wartości:** Obiekt zawierający wszystkie potrzebne stany i funkcje zwrotne dla komponentu `TrainingSessionView`:
  ```typescript
  interface UseTrainingSessionReturn {
    state: SessionState;
    exercises: Exercise[];
    activeIndex: number;
    completedStatus: boolean[];
    elapsedTime: number;
    restTimerRemaining: number;
    restTimerDuration: number;
    isLoading: boolean; // Zamiast state === 'loading'
    isSubmitting: boolean; // Zamiast state === 'submitting'
    error: string | null;
    markCurrentItemComplete: () => void; // Wewnętrznie zna activeIndex
    // handleRestTimerEnd: () => void; // Może być wewnętrzne dla hooka
  }
  ```
- **Komponent `TrainingSessionView`** używałby tego hooka do uzyskania danych i logiki, pozostając relatywnie prostym w implementacji.

## 7. Integracja API

1.  **Pobieranie danych planu:**
    - Potrzebna będzie nowa akcja serwerowa (np. `getTrainingPlanDetails(planId: string): Promise<TrainingPlanDetailOutput>`), która pobierze dane planu z Supabase, weryfikując dostęp użytkownika.
    - Wywołana w `useTrainingSession` przy inicjalizacji.
    - Obsługa stanu ładowania i błędów (404, 403, 500).
2.  **Zapis ukończonej sesji:**
    - Użycie istniejącej akcji serwerowej `completeTrainingSession` z `src/db/actions/training-sessions/complete.ts`.
    - Wywołana przez `useTrainingSession` po ukończeniu ostatniego elementu.
    - **Typ żądania:** `CompleteTrainingSessionInput`
    - **Typ odpowiedzi:** `CompleteTrainingSessionOutput`
    - **Dane wejściowe:** `plan_id` (z `planId`), `plan_day_name` (z `dayName`), `duration_seconds` (obliczony `elapsedTime` z `useTrainingSession`).
    - Obsługa stanu `isSubmitting` oraz błędów (400, 401, 403, 404, 500) zgodnie z opisem endpointu.

## 8. Interakcje użytkownika

- **Wejście na stronę:** Widok ładuje dane, wyświetla pierwszy element jako aktywny, startuje główny timer.
- **Kliknięcie/dotknięcie aktywnego `SessionExerciseItem`:**
  - Element jest oznaczany jako ukończony.
  - Hook `useTrainingSession` aktualizuje stan.
  - Jeśli jest czas odpoczynku (`rest_time_seconds > 0`):
    - Startuje `RestTimer`.
    - Stan sesji zmienia się na `active_rest`.
    - Następny element _nie_ jest jeszcze aktywowany.
  - Jeśli nie ma czasu odpoczynku LUB to był ostatni element:
    - Jeśli to _nie_ był ostatni element: aktywowany jest następny element, stan sesji wraca do `active_exercise`.
    - Jeśli to _był_ ostatni element: Zatrzymywany jest główny timer, wywoływana jest akcja API `completeTrainingSession`. Stan sesji zmienia się na `submitting`, a następnie `finished` lub `error`.
- **Zakończenie `RestTimer`:**
  - Hook `useTrainingSession` aktualizuje stan.
  - Następny element jest aktywowany.
  - Stan sesji zmienia się na `active_exercise`.
- **Próba opuszczenia strony (nawigacja, zamknięcie):** Użytkownik traci postęp. Opcjonalnie może pojawić się natywne okno dialogowe przeglądarki (jeśli użyto `beforeunload`). Stałe ostrzeżenie `DataLossWarning` jest głównym mechanizmem informacyjnym.

## 9. Warunki i walidacja

- **Klikalność `SessionExerciseItem`:** Komponent jest interaktywny tylko gdy `isActive === true` ORAZ `sessionState === 'active_exercise'`. Zapobiega to klikaniu nieaktywnych lub już ukończonych elementów oraz klikaniu podczas odpoczynku.
- **Rozpoczęcie sesji:** Sesja startuje (ładowanie danych, timery) tylko jeśli `planId` i `dayName` są poprawnie przekazane w URL i dane planu zostaną pomyślnie załadowane.
- **Wywołanie API `completeTrainingSession`:**
  - Następuje tylko po oznaczeniu ostatniego elementu jako ukończonego.
  - Dane wejściowe (`plan_id`, `plan_day_name`, `duration_seconds`) są przygotowywane przez hook `useTrainingSession`. Hook powinien zapewnić, że `duration_seconds` jest liczbą całkowitą dodatnią. `plan_id` musi być UUID (co zapewnia routing i pobranie danych). `plan_day_name` musi być niepustym stringiem. Frontend zakłada, że te dane są poprawne po pomyślnym załadowaniu strony.

## 10. Obsługa błędów

- **Błąd ładowania danych planu (`getTrainingPlanDetails`):**
  - Hook `useTrainingSession` ustawia `error` i `state` na 'error'.
  - Komponent `TrainingSessionView` wyświetla komunikat błędu zamiast interfejsu sesji (np. "Nie udało się załadować sesji. Spróbuj ponownie później.").
- **Błąd zapisu sesji (`completeTrainingSession`):**
  - Hook `useTrainingSession` ustawia `error` i `state` na 'error'.
  - Komponent `TrainingSessionView` wyświetla komunikat błędu (np. "Wystąpił błąd podczas zapisywania sesji. Spróbuj ponownie." lub bardziej szczegółowy w zależności od kodu błędu, jeśli to bezpieczne). Należy zalogować szczegóły błędu po stronie serwera.
- **Nieoczekiwane błędy JS:** Wykorzystanie mechanizmów obsługi błędów Next.js/React (Error Boundaries).
- **Utrata połączenia podczas sesji:** Sesja nie zostanie zapisana. Po odzyskaniu połączenia i odświeżeniu strony, użytkownik będzie musiał zacząć od nowa (zgodnie z wymaganiem o utracie danych).

## 11. Kroki implementacji

1.  **Utworzenie routingu:** Dodać strukturę folderów i plik strony dla `/training-plans/[planId]/session/[dayName]` w `src/app`.
2.  **Akcja pobierania danych:** Stworzyć nową akcję serwerową `getTrainingPlanDetails(planId)` w `src/db/actions/training-plans/` (lub podobnej lokalizacji), która pobierze szczegóły planu (`TrainingPlanDetailOutput`) i zweryfikuje uprawnienia użytkownika.
3.  **Implementacja `useTrainingSession` Hook:**
    - Zdefiniować stany (`useState` lub `useReducer`).
    - Dodać logikę pobierania danych (`useEffect`).
    - Zaimplementować logikę timerów (`setInterval`, `clearInterval`).
    - Stworzyć funkcje do obsługi ukończenia elementu (`markCurrentItemComplete`) i końca odpoczynku.
    - Dodać logikę wywołania API `completeTrainingSession`.
    - Zaimplementować obsługę stanów ładowania, wysyłania i błędów.
4.  **Implementacja komponentu strony `TrainingSessionView`:**
    - Użyć hooka `useTrainingSession`.
    - Wyrenderować strukturę widoku i komponenty podrzędne na podstawie stanu z hooka.
    - Dodać obsługę przekierowania po sukcesie (`useRouter`).
    - Dodać podstawową obsługę błędów (wyświetlanie komunikatu).
5.  **Implementacja komponentów UI:**
    - Stworzyć `DataLossWarning` (np. używając `Alert` z Shadcn).
    - Stworzyć `SessionTimer`.
    - Stworzyć `SessionExerciseList` (wraz z logiką `scrollIntoView`).
    - Stworzyć `SessionExerciseItem` (z warunkową interaktywnością i stylami).
    - Stworzyć `RestTimer` (z wizualizacją i wywołaniem `onTimerEnd`).
6.  **Styling:** Użyć Tailwind CSS i ew. komponentów Shadcn/ui do ostylowania wszystkich komponentów zgodnie z mobile-first i minimalistycznym designem.
7.  **Testowanie:**
    - Testy jednostkowe dla hooka `useTrainingSession` (szczególnie logiki stanów i timerów).
    - Testy komponentów React dla komponentów UI (RTL).
    - Testy E2E (Playwright) symulujące pełny przepływ sesji, w tym ukończenie i próbę przerwania.
8.  **Refinement:** Dopracować UX, animacje (jeśli potrzebne), dostępność (ARIA attributes) i responsywność.

```

```
