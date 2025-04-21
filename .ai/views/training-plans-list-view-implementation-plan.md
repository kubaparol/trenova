# Plan implementacji widoku: Lista Planów Treningowych

## 1. Przegląd

Widok `/training-plans` ma na celu wyświetlenie użytkownikowi listy jego zapisanych planów treningowych. Umożliwia szybki przegląd istniejących planów, nawigację do ich szczegółów oraz inicjowanie procesu tworzenia nowego planu. Widok powinien obsługiwać stany ładowania, braku planów (stan pusty) oraz wyświetlanie planów wraz z paginacją.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/training-plans`. Dostęp do tej ścieżki powinien być ograniczony tylko dla zalogowanych użytkowników (wymaga ochrony trasy, np. przez Next.js Middleware).

## 3. Struktura komponentów

Hierarchia komponentów dla tego widoku będzie następująca:

```
TrainingPlansPage (/app/training-plans/page.tsx) - Główny komponent strony (Client Component)
  |- LoadingSkeleton (renderowany warunkowo) - Komponent szkieletu ładowania
  |- EmptyState (renderowany warunkowo) - Komponent stanu pustego (brak planów)
  |- TrainingPlanList (renderowany warunkowo) - Komponent listy planów
  |   `- TrainingPlanCard (komponent powtarzalny dla każdego planu) - Karta pojedynczego planu
  |       |- Button (Shadcn) - Przycisk "Zobacz szczegóły"
  |       `- Button (Shadcn) - Przycisk "Usuń" (placeholder)
  |- PaginationControls (renderowany warunkowo) - Komponent kontrolek paginacji
  `- FloatingActionButton (FAB) - Pływający przycisk akcji "Dodaj nowy plan"
```

## 4. Szczegóły komponentów

### `TrainingPlansPage`

- **Opis:** Główny komponent strony, renderowany dla ścieżki `/training-plans`. Odpowiada za zarządzanie stanem (ładowanie, błędy, dane, bieżąca strona), wywoływanie logiki pobierania danych (za pomocą hooka `useUserTrainingPlans`) oraz warunkowe renderowanie komponentów podrzędnych (`LoadingSkeleton`, `EmptyState`, `TrainingPlanList`, `PaginationControls`). Musi być komponentem klienckim (`"use client"`).
- **Główne elementy:** Wywołuje hook `useUserTrainingPlans`, renderuje warunkowo `LoadingSkeleton`, `EmptyState` lub `TrainingPlanList` i `PaginationControls`. Zawsze renderuje `FloatingActionButton`.
- **Obsługiwane interakcje:** Zmiana strony w `PaginationControls` (aktualizuje stan `currentPage`), kliknięcie `FloatingActionButton` (nawiguje do strony tworzenia planu).
- **Obsługiwana walidacja:** Pośrednio, przez obsługę błędów z hooka `useUserTrainingPlans` (np. błąd autoryzacji).
- **Typy:** `TrainingPlanListOutput` (ze stanu hooka).
- **Propsy:** Brak (jest to komponent strony).

### `TrainingPlanList`

- **Opis:** Komponent odpowiedzialny za renderowanie siatki lub listy kart planów treningowych (`TrainingPlanCard`). Otrzymuje listę planów do wyświetlenia.
- **Główne elementy:** Kontener (np. `div` z klasami Tailwind do układu siatki), mapuje listę planów na komponenty `TrainingPlanCard`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji (delegowane do `TrainingPlanCard`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingPlanListItem[]`.
- **Propsy:** `plans: TrainingPlanListItem[]`.

### `TrainingPlanCard`

- **Opis:** Komponent wyświetlający informacje o pojedynczym planie treningowym. Zawiera nazwę planu, datę utworzenia oraz przyciski akcji. Powinien być klikalny, aby umożliwić nawigację do szczegółów.
- **Główne elementy:** Komponent `Card` z Shadcn/ui, `CardHeader`, `CardTitle` (nazwa planu), `CardDescription` (data utworzenia), `CardFooter` z przyciskami `Button` ("Zobacz szczegóły", "Usuń").
- **Obsługiwane interakcje:** Kliknięcie karty lub przycisku "Zobacz szczegóły" (nawigacja do `/training-plans/[id]`), kliknięcie przycisku "Usuń" (wywołanie logiki usuwania - placeholder).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TrainingPlanCardViewModel`.
- **Propsy:** `plan: TrainingPlanCardViewModel`.

### `EmptyState`

- **Opis:** Komponent wyświetlany, gdy użytkownik nie ma żadnych zapisanych planów treningowych. Powinien zawierać informację tekstową oraz wezwanie do działania (CTA).
- **Główne elementy:** Kontener (`div`), tekst informacyjny (np. "Nie masz jeszcze żadnych planów treningowych."), przycisk `Button` (np. "Stwórz swój pierwszy plan") nawigujący do strony tworzenia planu.
- **Obsługiwane interakcje:** Kliknięcie przycisku CTA (nawigacja do strony tworzenia planu).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** `onCreatePlanClick: () => void`.

### `LoadingSkeleton`

- **Opis:** Komponent wyświetlający interfejs zastępczy podczas ładowania danych planów. Powinien wizualnie przypominać układ listy/kart planów.
- **Główne elementy:** Kontener (np. `div` z układem siatki), kilka komponentów `Skeleton` z Shadcn/ui ułożonych tak, aby imitowały `TrainingPlanCard`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

### `FloatingActionButton`

- **Opis:** Pływający przycisk (np. w prawym dolnym rogu), który pozwala użytkownikowi szybko przejść do tworzenia nowego planu.
- **Główne elementy:** Komponent `Button` z Shadcn/ui, ostylowany za pomocą Tailwind do pozycjonowania `fixed`. Może zawierać ikonę (np. "+").
- **Obsługiwane interakcje:** Kliknięcie przycisku (nawigacja do strony tworzenia planu).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** `onClick: () => void`.

### `PaginationControls`

- **Opis:** Komponent wyświetlający kontrolki paginacji (poprzednia/następna strona, numery stron), gdy liczba planów przekracza limit na stronę. Wykorzystuje komponent `Pagination` z Shadcn/ui.
- **Główne elementy:** Komponent `Pagination` z Shadcn/ui (`PaginationContent`, `PaginationItem`, `PaginationPrevious`, `PaginationLink`, `PaginationEllipsis`, `PaginationNext`).
- **Obsługiwane interakcje:** Kliknięcie przycisków nawigacji strony (wywołuje `onPageChange` z nowym numerem strony).
- **Obsługiwana walidacja:** Dezaktywuje przyciski "Previous"/"Next", gdy użytkownik jest odpowiednio na pierwszej/ostatniej stronie.
- **Typy:** `PaginationViewModel`.
- **Propsy:** `pagination: PaginationViewModel`, `onPageChange: (page: number) => void`.

## 5. Typy

- **DTO (z `src/types/api.ts`):**

  - `GetUserPlansInput`: `{ page?: number; limit?: number; }`
  - `TrainingPlanListOutput`: `{ items: TrainingPlanListItem[]; total: number; page: number; limit: number; }`

  * `TrainingPlanListItem`: `{ id: string; name: string; created_at: string; user_id: string; }`

- **ViewModel (nowe typy dla widoku):**
  - **`TrainingPlanCardViewModel`**:
    - `id: string`: ID planu.
    - `name: string`: Nazwa planu.
    - `formattedCreatedAt: string`: Sformatowana data utworzenia (np. "Utworzono 15 sty 2024"). Wymaga funkcji formatującej datę (`created_at`).
    - `detailUrl: string`: Pełny URL do strony szczegółów planu (np. `/training-plans/abc-123`).
  - **`PaginationViewModel`**:
    - `currentPage: number`: Aktualnie wyświetlana strona (1-indeksowana).
    - `itemsPerPage: number`: Liczba elementów na stronie.
    * `totalItems: number`: Całkowita liczba planów użytkownika.
    * `totalPages: number`: Całkowita liczba stron (obliczona: `Math.ceil(totalItems / itemsPerPage)`).

## 6. Zarządzanie stanem

- **Główny stan:** Zarządzany w komponencie `TrainingPlansPage`.

  - `currentPage: number`: Przechowuje aktualnie wybraną stronę paginacji. Wartość początkowa: 1. Może być synchronizowana z parametrami URL (`?page=...`).
  - Pozostały stan (dane, ładowanie, błąd) będzie zarządzany przez customowy hook `useUserTrainingPlans`.

- **Custom Hook `useUserTrainingPlans`:**
  - **Cel:** Abstrakcja logiki pobierania danych planów, zarządzania stanem ładowania i błędów.
  - **Wejście:** `page: number`, `limit: number`.
  - **Wyjście:** `{ data: TrainingPlanListOutput | null; isLoading: boolean; error: Error | null; }`.
  - **Logika:** Używa `useState` do zarządzania `data`, `isLoading`, `error`. Używa `useEffect` do wywołania serwerowej akcji `getUserTrainingPlans` przy zmianie `page` lub `limit`. Obsługuje stany ładowania i błędy.

## 7. Integracja API

- **Endpoint:** Serwerowa akcja `getUserTrainingPlans` (z `src/db/actions/training-plans/get-user-plans.ts`).
- **Wywołanie:** Hook `useUserTrainingPlans` wywołuje akcję `getUserTrainingPlans` z parametrami `{ page: currentPage, limit: 10 }`.
- **Typy żądania:** `GetUserPlansInput` (opcjonalne `{ page?: number; limit?: number; }`).
- **Typy odpowiedzi:** `TrainingPlanListOutput` (`{ items: TrainingPlanListItem[]; total: number; page: number; limit: number; }`).
- **Obsługa odpowiedzi:**
  - **Ładowanie (`isLoading === true`):** Wyświetl `LoadingSkeleton`.
  - **Sukces (`!isLoading && data`):**
    - Jeśli `data.total === 0`, wyświetl `EmptyState`.
    - Jeśli `data.total > 0`, wyświetl `TrainingPlanList` z `data.items`.
    - Jeśli `data.total > data.limit`, wyświetl `PaginationControls`.
  - **Błąd (`!isLoading && error`):** Wyświetl komunikat błędu (np. w komponencie `Alert` lub `Toast` z Shadcn). Obsłuż specyficznie błąd autoryzacji (np. przekierowanie na stronę logowania).

## 8. Interakcje użytkownika

- **Wejście na stronę:** Uruchamia pobieranie danych dla strony 1. Wyświetla stan ładowania, a następnie listę planów lub stan pusty.
- **Kliknięcie karty planu / przycisku "Zobacz szczegóły":** Nawiguje użytkownika do `/training-plans/[id]`, gdzie `[id]` to ID klikniętego planu. Użyj `useRouter` z `next/navigation`.
- **Kliknięcie przycisku "Usuń":** Powinno wyświetlić modal potwierdzający, a po potwierdzeniu wywołać akcję usuwania i odświeżyć listę.
- **Zmiana strony paginacji:** Użytkownik klika kontrolkę w `PaginationControls`. Komponent emituje nowy numer strony. `TrainingPlansPage` aktualizuje stan `currentPage`, co uruchamia ponowne pobranie danych przez hook `useUserTrainingPlans`.
- **Kliknięcie FAB:** Nawiguje użytkownika do strony tworzenia nowego planu (np. `/training-plans/new`).
- **Kliknięcie CTA w `EmptyState`:** Nawiguje użytkownika do strony tworzenia nowego planu.

## 9. Warunki i walidacja

- **Autoryzacja użytkownika:**
  - **Warunek:** Dostęp do `/training-plans` tylko dla zalogowanych użytkowników.
  - **Weryfikacja:** Głównie przez Next.js Middleware. Dodatkowo, serwerowa akcja `getUserTrainingPlans` weryfikuje użytkownika. Błąd autoryzacji z API powinien być obsłużony na froncie (np. przekierowanie).
- **Paginacja:**
  - **Warunek:** Kontrolki paginacji powinny być widoczne tylko, gdy `totalItems > itemsPerPage`.
  - **Weryfikacja:** W `TrainingPlansPage`, renderuj `PaginationControls` warunkowo: `data && data.total > data.limit`.
  - **Warunek:** Przyciski "Previous"/"Next" powinny być nieaktywne na pierwszej/ostatniej stronie.
  - **Weryfikacja:** Komponent `PaginationControls` (wykorzystujący Shadcn `Pagination`) powinien automatycznie obsługiwać stan `disabled` na podstawie `currentPage` i `totalPages` z `PaginationViewModel`.
- **Poprawność danych wejściowych API (`page`, `limit`):**
  - **Warunek:** `page >= 1`, `limit >= 1`.
  * **Weryfikacja:** Walidacja po stronie serwera (w akcji). Po stronie klienta, `limit` jest stały, a `currentPage` jest zarządzany tak, aby nie spaść poniżej 1.

## 10. Obsługa błędów

- **Błąd autoryzacji:** Jeśli `useUserTrainingPlans` zwróci błąd wskazujący na brak autoryzacji, `TrainingPlansPage` powinien przekierować użytkownika na stronę logowania (`/login`).
- **Błąd pobierania danych (sieciowy, serwera):** Jeśli `useUserTrainingPlans` zwróci inny błąd, `TrainingPlansPage` powinien wyświetlić czytelny komunikat dla użytkownika, np. "Nie udało się załadować planów. Spróbuj ponownie później.", używając komponentu `Alert` lub `Toast`. Można dodać przycisk "Spróbuj ponownie", który wywołałby funkcję refetch z hooka (jeśli hook ją udostępnia).
- **Stan pusty (brak planów):** Nie jest to błąd, lecz oczekiwany stan. Gdy `data.total === 0`, należy wyświetlić komponent `EmptyState` zamiast listy.

## 11. Kroki implementacji

1.  **Ochrona trasy:** Skonfiguruj Next.js Middleware, aby chronić ścieżkę `/training-plans` i wymagać zalogowanego użytkownika.
2.  **Struktura plików:** Utwórz plik strony `src/app/training-plans/page.tsx`. Utwórz pliki dla komponentów wielokrotnego użytku w `src/components/training` (np. `TrainingPlanCard.tsx`, `EmptyState.tsx`, `LoadingSkeleton.tsx`, `PaginationControls.tsx`, `FloatingActionButton.tsx`, `TrainingPlanList.tsx`).
3.  **Typy ViewModel:** Zdefiniuj typy `TrainingPlanCardViewModel` i `PaginationViewModel` (np. w `src/types/viewModels.ts` lub bezpośrednio w komponentach, jeśli są używane tylko lokalnie).
4.  **Hook `useUserTrainingPlans`:** Zaimplementuj customowy hook w `src/hooks/useUserTrainingPlans.ts`, który będzie zawierał logikę pobierania danych z akcji `getUserTrainingPlans`, zarządzanie stanem ładowania i błędów.
5.  **Komponent `LoadingSkeleton`:** Zaimplementuj komponent szkieletu ładowania przy użyciu `Skeleton` z Shadcn.
6.  **Komponent `EmptyState`:** Zaimplementuj komponent stanu pustego z odpowiednim tekstem i przyciskiem CTA.
7.  **Komponent `TrainingPlanCard`:** Zaimplementuj kartę planu, używając `Card` z Shadcn. Dodaj formatowanie daty dla `formattedCreatedAt`. Zaimplementuj nawigację po kliknięciu. Dodaj przycisk "Usuń" jako placeholder.
8.  **Komponent `TrainingPlanList`:** Zaimplementuj komponent listy, który renderuje `TrainingPlanCard` dla każdego elementu z propsów. Użyj Tailwind do responsywnego układu siatki.
9.  **Komponent `PaginationControls`:** Zaimplementuj komponent paginacji, używając `Pagination` z Shadcn. Powinien przyjmować `PaginationViewModel` i emitować zdarzenie `onPageChange`.
10. **Komponent `FloatingActionButton`:** Zaimplementuj FAB używając `Button` z Shadcn i Tailwind do pozycjonowania.
11. **Komponent `TrainingPlansPage`:** Zintegruj wszystkie komponenty. Użyj hooka `useUserTrainingPlans`. Zarządzaj stanem `currentPage`. Implementuj logikę warunkowego renderowania (`LoadingSkeleton`, `EmptyState`, `TrainingPlanList`, `PaginationControls`). Obsłuż nawigację dla FAB i CTA w `EmptyState`. Obsłuż błędy z hooka (w tym błąd autoryzacji). Rozważ synchronizację `currentPage` z URLSearchParams.
12. **Styling i Responsywność:** Upewnij się, że wszystkie komponenty są poprawnie ostylowane za pomocą Tailwind i są w pełni responsywne (mobile-first).
13. **Testowanie:** Przetestuj wszystkie stany (ładowanie, błąd, stan pusty, lista z danymi, paginacja) i interakcje użytkownika. Przetestuj responsywność na różnych szerokościach ekranu.
