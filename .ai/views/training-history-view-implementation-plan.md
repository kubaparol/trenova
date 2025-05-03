# Plan implementacji widoku Historii Treningów (`/training-history`)

## 1. Przegląd

Widok Historii Treningów ma na celu wyświetlenie użytkownikowi listy wszystkich jego ukończonych sesji treningowych. Dane są pobierane z backendu, a lista prezentowana jest w porządku chronologicznym (od najnowszej do najstarszej), z możliwością paginacji, jeśli liczba sesji jest duża. Widok powinien również obsługiwać stan ładowania, stan błędu oraz stan pusty (brak ukończonych sesji).

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/training-history`. Implementacja w Next.js `app` routerze będzie wymagała stworzenia pliku `src/app/training-history/page.tsx`.

## 3. Struktura komponentów

```
/src/app/training-history/page.tsx (TrainingHistoryPage)
├── /src/components/training-history/TrainingHistoryClient.tsx
│   ├── /src/components/ui/Skeleton.tsx (dla TrainingHistorySkeleton)
│   ├── /src/components/ui/Alert.tsx (dla ErrorMessageComponent)
│   ├── /src/components/training-history/TrainingHistoryEmptyState.tsx
│   ├── /src/components/training-history/TrainingHistoryList.tsx
│   │   └── /src/components/training-history/TrainingHistoryItem.tsx (jako wiersz tabeli)
│   └── /src/components/ui/Pagination.tsx (dla PaginationControls)
```

- **`TrainingHistoryPage`**: Komponent serwerowy Next.js (lub RSC), który może zawierać podstawowy layout strony i metadane. Główna logika pobierania danych i zarządzania stanem zostanie przeniesiona do komponentu klienckiego.
- **`TrainingHistoryClient`**: Komponent kliencki (`"use client"`), który zarządza stanem (ładowanie, błędy, dane, paginacja) za pomocą hooka `useTrainingHistory`, wywołuje akcję serwerową `getTrainingSessions` i renderuje odpowiednie komponenty podrzędne (Skeleton, Listę, Pusty Stan, Błąd, Paginację).
- **`TrainingHistoryList`**: Renderuje listę (prawdopodobnie jako Shadcn `Table`) sesji treningowych.
- **`TrainingHistoryItem`**: Renderuje pojedynczy wiersz (`TableRow`) w tabeli historii, wyświetlając sformatowane dane sesji.
- **`TrainingHistoryEmptyState`**: Wyświetlany, gdy użytkownik nie ma żadnych ukończonych sesji.
- **`TrainingHistorySkeleton`**: Wyświetla szkielet interfejsu podczas ładowania danych.
- **`PaginationControls`**: Komponent paginacji (Shadcn `Pagination`) renderowany, gdy liczba sesji przekracza limit na stronę.

## 4. Szczegóły komponentów

### `TrainingHistoryClient`

- **Opis**: Główny komponent kliencki zarządzający logiką widoku historii. Wykorzystuje hook `useTrainingHistory` do pobierania danych i obsługi stanów. Renderuje warunkowo komponenty podrzędne.
- **Główne elementy**: `div` jako kontener; warunkowe renderowanie `TrainingHistorySkeleton`, `Alert` (dla błędów), `TrainingHistoryEmptyState`, `TrainingHistoryList`, `PaginationControls`.
- **Obsługiwane interakcje**: Zmiana strony w `PaginationControls` (poprzez `onPageChange` przekazane z hooka).
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji, logika renderowania oparta na stanie `isLoading`, `error`, `sessionsData` z hooka.
- **Typy**: `TrainingSessionListOutput`, `GetTrainingSessionsInput`.
- **Propsy**: Brak (jest komponentem najwyższego poziomu na stronie klienckiej).

### `TrainingHistoryList`

- **Opis**: Prezentuje listę ukończonych sesji w formie tabeli (np. Shadcn `Table`).
- **Główne elementy**: `Table`, `TableHeader`, `TableBody` z Shadcn/ui. Mapuje `items` na komponenty `TrainingHistoryItem`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `items: TrainingSessionListItemViewModel[]`.
- **Propsy**: `items: TrainingSessionListItemViewModel[]`.

### `TrainingHistoryItem`

- **Opis**: Reprezentuje pojedynczy wiersz w tabeli historii sesji. Wyświetla sformatowane dane.
- **Główne elementy**: `TableRow`, `TableCell` z Shadcn/ui do wyświetlania `completedDate`, `planName`, `planDayName`, `duration`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `session: TrainingSessionListItemViewModel`.
- **Propsy**: `session: TrainingSessionListItemViewModel`.

### `TrainingHistoryEmptyState`

- **Opis**: Informuje użytkownika, że nie ma jeszcze żadnych ukończonych sesji. Może zawierać tekst i ewentualnie przycisk/link zachęcający do działania.
- **Główne elementy**: `div`, `p` (tekst informacyjny), opcjonalnie `Button` lub `Link` (np. do widoku planów).
- **Obsługiwane interakcje**: Kliknięcie na opcjonalny przycisk/link.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak specyficznych.
- **Propsy**: Brak.

### `TrainingHistorySkeleton`

- **Opis**: Wyświetla uproszczoną wersję interfejsu (np. kilka wierszy tabeli z komponentami `Skeleton`) podczas ładowania danych.
- **Główne elementy**: Struktura podobna do `TrainingHistoryList` i `TrainingHistoryItem`, ale używająca komponentów `Skeleton` z Shadcn/ui w miejscach danych. Powinna renderować liczbę wierszy równą `limit`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak specyficznych.
- **Propsy**: `limit: number` (aby wyrenderować odpowiednią liczbę wierszy szkieletu).

### `PaginationControls`

- **Opis**: Umożliwia nawigację między stronami wyników. Używa komponentu `Pagination` z Shadcn/ui.
- **Główne elementy**: Komponent `Pagination` z Shadcn/ui (`PaginationContent`, `PaginationItem`, `PaginationPrevious`, `PaginationLink`, `PaginationEllipsis`, `PaginationNext`).
- **Obsługiwane interakcje**: Kliknięcie na przyciski "Previous", "Next" lub numery stron. Wywołuje `onPageChange` z nowym numerem strony.
- **Obsługiwana walidacja**: Przyciski "Previous"/"Next" są wyłączane, gdy użytkownik jest odpowiednio na pierwszej/ostatniej stronie. Renderowany tylko, gdy `totalPages > 1`.
- **Typy**: `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`.
- **Propsy**: `currentPage`, `totalPages`, `onPageChange`.

## 5. Typy

- **DTO (Data Transfer Objects - z `src/types/api.ts`)**:
  - `GetTrainingSessionsInput`: `{ page?: number; limit?: number; }`
  - `TrainingSessionListOutput`: `{ items: TrainingSessionListItem[]; total: number; page: number; limit: number; }`
  - `TrainingSessionListItem`: `{ id: string; completed_at: string; plan_day_name: string; duration_seconds: number; plan_id: string; plan_name?: string; }`
- **ViewModel (dla UI)**:
  - `TrainingSessionListItemViewModel`:
    - `id: string` (z DTO, jako klucz `key` w React)
    - `completedDate: string` (Sformatowana data z `completed_at`, np. "20 lipca 2024")
    - `planName: string` (z `plan_name` DTO, fallback na np. "Brak nazwy planu")
    * `planDayName: string` (z `plan_day_name` DTO)
    * `duration: string` (Sformatowany czas trwania z `duration_seconds`, np. "45m 30s", "1h 15m")

## 6. Zarządzanie stanem

Zalecane jest stworzenie niestandardowego hooka `useTrainingHistory`, który będzie zarządzał stanem widoku w komponencie `TrainingHistoryClient`.

- **Hook `useTrainingHistory`**:
  - **Cel**: Hermetyzacja logiki pobierania danych, obsługi stanu ładowania, błędów oraz paginacji.
  - **Stan wewnętrzny**:
    - `sessionsData: TrainingSessionListOutput | null`
    - `isLoading: boolean`
    - `error: Error | null`
    - `currentPage: number` (domyślnie 1)
    - `limit: number` (np. stała wartość 10)
  - **Funkcje**:
    - Wewnętrzna funkcja `fetchSessions(page: number, limit: number)` wywołująca akcję serwerową `getTrainingSessions`.
    - `useEffect` hook, który wywołuje `fetchSessions` przy montowaniu komponentu oraz przy zmianie `currentPage`.
    - Funkcja `setPage(newPage: number)` aktualizująca stan `currentPage`.
  - **Zwracane wartości**: `{ sessionsData, isLoading, error, currentPage, totalPages, limit, setPage }`. Wartość `totalPages` jest obliczana na podstawie `sessionsData.total` i `limit`.

## 7. Integracja API

- Komponent `TrainingHistoryClient` (poprzez hook `useTrainingHistory`) będzie wywoływał akcję serwerową `getTrainingSessions` zdefiniowaną w `src/db/actions/training-sessions/get-sessions.ts`.
- **Wywołanie**: `getTrainingSessions({ page: currentPage, limit: limit })`
- **Typy żądania**: `GetTrainingSessionsInput` (`{ page?: number; limit?: number; }`)
- **Typy odpowiedzi**: `TrainingSessionListOutput` (`{ items: TrainingSessionListItem[]; total: number; page: number; limit: number; }`)
- Wywołanie następuje przy pierwszym renderowaniu oraz przy każdej zmianie strony przez użytkownika za pomocą `PaginationControls`.

## 8. Interakcje użytkownika

- **Nawigacja do `/training-history`**: Użytkownik widzi stan ładowania (`TrainingHistorySkeleton`), a następnie listę sesji, pusty stan lub błąd. Jeśli sesji jest więcej niż `limit`, widoczna jest paginacja.
- **Kliknięcie na element paginacji (np. "Next", numer strony)**: Wywołuje funkcję `setPage` z hooka `useTrainingHistory`. Stan `currentPage` się zmienia. Hook ponownie wywołuje API z nowym numerem strony. Interfejs aktualizuje się, pokazując nową listę sesji i zaktualizowany stan paginacji (aktywna strona, włączone/wyłączone przyciski).

## 9. Warunki i walidacja

- **Poziom API (backend)**: Weryfikacja autentykacji użytkownika, poprawności `page` i `limit`.
- **Poziom komponentu (`TrainingHistoryClient`)**:
  - Renderowanie `TrainingHistorySkeleton`, gdy `isLoading === true`.
  - Renderowanie `Alert` z błędem, gdy `error !== null`.
  - Renderowanie `TrainingHistoryEmptyState`, gdy `!isLoading && !error && sessionsData?.total === 0`.
  - Renderowanie `TrainingHistoryList` i `PaginationControls`, gdy `!isLoading && !error && sessionsData?.total > 0`.
- **Poziom komponentu (`PaginationControls`)**:
  - Renderowanie tylko gdy `totalPages > 1`.
  - Wyłączanie przycisku "Previous", gdy `currentPage === 1`.
  - Wyłączanie przycisku "Next", gdy `currentPage === totalPages`.

## 10. Obsługa błędów

- **Brak autentykacji (Błąd 401/Error z API)**: Hook `useTrainingHistory` przechwytuje błąd. `TrainingHistoryClient` renderuje komponent `Alert` z komunikatem, np. "Dostęp nieautoryzowany. Zaloguj się, aby zobaczyć historię." Można rozważyć automatyczne przekierowanie na stronę logowania.
- **Błąd serwera (Błąd 500/Error z API)**: Hook przechwytuje błąd. `TrainingHistoryClient` renderuje `Alert` z komunikatem, np. "Wystąpił błąd serwera. Spróbuj ponownie później."
- **Błąd sieciowy (Fetch API failure)**: Hook przechwytuje błąd. `TrainingHistoryClient` renderuje `Alert` z komunikatem, np. "Błąd połączenia. Sprawdź internet i spróbuj ponownie."
- **Problem z formatowaniem danych (np. `plan_name` jest `null`, niepoprawna data)**: W funkcjach formatujących (np. `formatDate`, `formatDuration`) oraz przy tworzeniu `TrainingSessionListItemViewModel` należy zastosować logikę obronną (np. wartości domyślne, bloki try-catch dla parsowania daty).

## 11. Kroki implementacji

1.  **Utworzenie struktury plików**: Stwórz plik `src/app/training-history/page.tsx` oraz katalog `src/components/training-history` z plikami dla komponentów: `TrainingHistoryClient.tsx`, `TrainingHistoryList.tsx`, `TrainingHistoryItem.tsx`, `TrainingHistoryEmptyState.tsx`, `TrainingHistorySkeleton.tsx`.
2.  **Implementacja `TrainingHistoryPage`**: Stwórz podstawowy komponent strony (może być serwerowy), który importuje i renderuje `TrainingHistoryClient`.
3.  **Implementacja Hooka `useTrainingHistory`**: Zaimplementuj logikę hooka zgodnie z sekcją 6, w tym wywołanie akcji `getTrainingSessions`, zarządzanie stanami `isLoading`, `error`, `sessionsData`, `currentPage`, `limit` i obliczanie `totalPages`.
4.  **Implementacja `TrainingHistoryClient`**: Stwórz komponent kliencki (`"use client"`), który używa hooka `useTrainingHistory` i renderuje warunkowo komponenty podrzędne (`Skeleton`, `Error`, `EmptyState`, `List`, `Pagination`).
5.  **Implementacja Narzędzi Formatujących**: Stwórz funkcje pomocnicze `formatDate(isoString)` i `formatDuration(seconds)` w `src/lib/utils.ts` (lub podobnym miejscu).
6.  **Implementacja `TrainingHistoryItem`**: Stwórz komponent wiersza tabeli, który przyjmuje props `session: TrainingSessionListItemViewModel` i wyświetla sformatowane dane (`completedDate`, `planName`, `planDayName`, `duration`) w komórkach (`TableCell`). Tutaj nastąpi mapowanie z `TrainingSessionListItem` na `TrainingSessionListItemViewModel` (można to zrobić w `TrainingHistoryClient` przed przekazaniem do listy lub w samym hooku).
7.  **Implementacja `TrainingHistoryList`**: Stwórz komponent tabeli (np. używając Shadcn `Table`), który przyjmuje `items: TrainingSessionListItemViewModel[]` i renderuje nagłówki tabeli oraz mapuje `items` na komponenty `TrainingHistoryItem`.
8.  **Implementacja `TrainingHistoryEmptyState`**: Stwórz komponent wyświetlający informację o braku sesji.
9.  **Implementacja `TrainingHistorySkeleton`**: Stwórz komponent szkieletu, który wizualnie odpowiada strukturze tabeli i liczbie elementów na stronie (`limit`).
10. **Implementacja `PaginationControls`**: Zintegruj komponent `Pagination` z Shadcn/ui, przekazując mu propsy `currentPage`, `totalPages` z hooka oraz funkcję `onPageChange` (czyli `setPage` z hooka).
11. **Styling (Tailwind)**: Dopracuj wygląd komponentów za pomocą Tailwind/Shadcn, dbając o responsywność (mobile-first).
12. **Testowanie**: Napisz testy jednostkowe/integracyjne (np. dla hooka `useTrainingHistory`, formatowania, renderowania warunkowego w `TrainingHistoryClient`) oraz testy E2E (np. weryfikujące nawigację, ładowanie danych, paginację, stan pusty). Zwróć uwagę na dostępność (testy klawiaturą).
13. **Review i Refaktoryzacja**: Przejrzyj kod, upewnij się, że jest zgodny z wytycznymi projektu i wprowadź ewentualne poprawki.
