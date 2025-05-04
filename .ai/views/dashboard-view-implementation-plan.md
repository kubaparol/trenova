# Plan implementacji widoku Panelu Użytkownika (Dashboard)

## 1. Przegląd

Panel Użytkownika (Dashboard) to widok dostępny pod ścieżką `/dashboard` dla zalogowanych użytkowników aplikacji Trenova. Jego głównym celem jest zapewnienie skonsolidowanego, wizualnego przeglądu aktywności treningowej użytkownika, jego postępów i kluczowych statystyk. Widok prezentuje dane w formie widgetów oraz wykresów, a także obsługuje stan, w którym użytkownik nie ma jeszcze zarejestrowanych żadnych ukończonych sesji treningowych.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką URL: `/dashboard`. Dostęp powinien być ograniczony tylko do zalogowanych użytkowników (ochrona przez middleware lub logikę strony).

## 3. Struktura komponentów

Widok będzie zaimplementowany jako strona w Next.js App Router (`src/app/dashboard/page.tsx`). Główna strona będzie prawdopodobnie komponentem serwerowym pobierającym dane. W zależności od stanu (ładowanie, błąd, brak danych, dane dostępne) renderowane będą odpowiednie komponenty:

```
DashboardPage (`/dashboard/page.tsx`) - Server Component
│
├── (Stan ładowania) -> Komponenty Skeleton (`WidgetSkeleton`, `ChartSkeleton` w layoucie)
│
├── (Stan błędu) -> Komponent komunikatu o błędzie (`Alert` z Shadcn/ui)
│
├── (Brak danych: `hasTrainingData: false`) -> EmptyDashboardState (`src/components/dashboard/EmptyDashboardState.tsx`)
│   └── Button (Link Shadcn/ui do `/plans`)
│
└── (Dane dostępne: `hasTrainingData: true`) -> DashboardLayout (`src/components/dashboard/DashboardLayout.tsx`) - Client Component
    │   (Props: UserDashboardDataOutput)
    │
    ├── LastTrainingWidget (`src/components/dashboard/LastTrainingWidget.tsx`) - Client
    │   └── Card (Shadcn/ui)
    ├── WeeklyProgressWidget (`src/components/dashboard/WeeklyProgressWidget.tsx`) - Client
    │   └── Card, Progress (Shadcn/ui)
    ├── SystematicsScoreWidget (`src/components/dashboard/SystematicsScoreWidget.tsx`) - Client
    │   └── Card (Shadcn/ui)
    ├── TrainingSummaryWidget (`src/components/dashboard/TrainingSummaryWidget.tsx`) - Client
    │   └── Card (Shadcn/ui)
    ├── DurationTrendChart (`src/components/dashboard/DurationTrendChart.tsx`) - Client
    │   └── ResponsiveContainer -> LineChart (Recharts)
    └── WorkoutsByPlanChart (`src/components/dashboard/WorkoutsByPlanChart.tsx`) - Client
        └── ResponsiveContainer -> BarChart (Recharts)
```

Komponenty szkieletowe (`WidgetSkeleton`, `ChartSkeleton`) będą umieszczone w `src/components/dashboard/skeletons.tsx` lub podobnej lokalizacji.

## 4. Szczegóły komponentów

### `DashboardPage` (`src/app/dashboard/page.tsx`)

- **Opis:** Główny komponent strony serwerowej. Odpowiedzialny za wywołanie akcji serwerowej `getUserDashboardData`, obsługę stanu ładowania (przez `Suspense` jeśli używane) i błędów, oraz renderowanie `EmptyDashboardState` lub `DashboardLayout` na podstawie flagi `hasTrainingData`.
- **Główne elementy:** Logika pobierania danych, obsługa `Suspense`, obsługa błędów, warunkowe renderowanie `EmptyDashboardState` lub `DashboardLayout`.
- **Obsługiwane interakcje:** Nawigacja do strony.
- **Obsługiwana walidacja:** Sprawdzenie flagi `hasTrainingData`, obsługa błędów z akcji serwerowej.
- **Typy:** `UserDashboardDataOutput`.
- **Propsy:** Brak (komponent strony).

### `DashboardLayout` (`src/components/dashboard/DashboardLayout.tsx`)

- **Opis:** Komponent kliencki (`'use client'`). Organizuje widgety i wykresy w responsywnej siatce (np. używając CSS Grid lub Flexbox z klasami Tailwind). Otrzymuje pełne dane dashboardu jako props.
- **Główne elementy:** Kontener siatki (np. `div` ze stylami Tailwind), komponenty dzieci: `LastTrainingWidget`, `WeeklyProgressWidget`, `SystematicsScoreWidget`, `TrainingSummaryWidget`, `DurationTrendChart`, `WorkoutsByPlanChart`.
- **Obsługiwane interakcje:** Brak bezpośrednich (ew. responsywność układu).
- **Obsługiwana walidacja:** Brak (zakłada poprawne dane).
- **Typy:** `UserDashboardDataOutput`.
- **Propsy:** `{ data: UserDashboardDataOutput }`.

### `LastTrainingWidget` (`src/components/dashboard/LastTrainingWidget.tsx`)

- **Opis:** Komponent kliencki. Wyświetla informacje o ostatniej sesji treningowej (nazwa planu, data ukończenia, czas trwania) wewnątrz komponentu `Card` z Shadcn/ui. Wymaga formatowania daty i czasu trwania.
- **Główne elementy:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, elementy tekstowe (`p`, `span`).
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak (dane powinny być nie-null, jeśli ten widget jest renderowany).
- **Typy:** `UserDashboardDataOutput['lastSession']` (wymagane nie-null).
- **Propsy:** `{ lastSession: NonNullable<UserDashboardDataOutput['lastSession']> }`.

### `WeeklyProgressWidget` (`src/components/dashboard/WeeklyProgressWidget.tsx`)

- **Opis:** Komponent kliencki. Pokazuje postęp w bieżącym tygodniu (Pon-Ndz) względem celu (5 treningów) za pomocą komponentu `Progress` i etykiet tekstowych wewnątrz `Card`.
- **Główne elementy:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Progress`, elementy tekstowe.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UserDashboardDataOutput['weeklyProgress']`.
- **Propsy:** `{ progress: UserDashboardDataOutput['weeklyProgress'] }`.

### `SystematicsScoreWidget` (`src/components/dashboard/SystematicsScoreWidget.tsx`)

- **Opis:** Komponent kliencki. Wyświetla ocenę systematyczności ("very_good" -> "Bardzo dobra", etc.) oraz opcjonalnie liczbę sesji w ostatnich 14 dniach wewnątrz `Card`. Wymaga mapowania klucza oceny na etykietę.
- **Główne elementy:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, elementy tekstowe.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UserDashboardDataOutput['systematicsScore']`.
- **Propsy:** `{ systematics: UserDashboardDataOutput['systematicsScore'] }`.

### `TrainingSummaryWidget` (`src/components/dashboard/TrainingSummaryWidget.tsx`)

- **Opis:** Komponent kliencki. Przedstawia zbiorcze statystyki treningowe (ukończone w tyg., całkowity czas, najdłuższy, średni czas) wewnątrz `Card`. Wymaga formatowania czasu trwania.
- **Główne elementy:** `Card`, `CardHeader`, `CardTitle`, `CardContent`, lista statystyk (np. `dl`, `dt`, `dd` lub `div`y).
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UserDashboardDataOutput['trainingSummary']`.
- **Propsy:** `{ summary: UserDashboardDataOutput['trainingSummary'] }`.

### `DurationTrendChart` (`src/components/dashboard/DurationTrendChart.tsx`)

- **Opis:** Komponent kliencki (`'use client'`). Renderuje wykres liniowy (Recharts) pokazujący trend czasu trwania sesji w czasie. Musi być opakowany w `ResponsiveContainer`. Wymaga formatowania etykiet osi (data, czas trwania) i tooltipów.
- **Główne elementy:** `ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`.
- **Obsługiwane interakcje:** Hover na punktach danych (tooltipy Recharts).
- **Obsługiwana walidacja:** Powinien poprawnie renderować się nawet z pustą tablicą danych (`data`).
- **Typy:** `UserDashboardDataOutput['charts']['durationTrend']`.
- **Propsy:** `{ data: UserDashboardDataOutput['charts']['durationTrend'] }`.

### `WorkoutsByPlanChart` (`src/components/dashboard/WorkoutsByPlanChart.tsx`)

- **Opis:** Komponent kliencki (`'use client'`). Renderuje wykres słupkowy (Recharts) pokazujący liczbę ukończonych sesji pogrupowanych według nazwy planu. Musi być opakowany w `ResponsiveContainer`. Wymaga formatowania etykiet osi (nazwa planu, liczba) i tooltipów.
- **Główne elementy:** `ResponsiveContainer`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`.
- **Obsługiwane interakcje:** Hover na słupkach (tooltipy Recharts).
- **Obsługiwana walidacja:** Powinien poprawnie renderować się nawet z pustą tablicą danych (`data`).
- **Typy:** `UserDashboardDataOutput['charts']['workoutsByPlan']`.
- **Propsy:** `{ data: UserDashboardDataOutput['charts']['workoutsByPlan'] }`.

### `EmptyDashboardState` (`src/components/dashboard/EmptyDashboardState.tsx`)

- **Opis:** Komponent kliencki. Wyświetlany, gdy `hasTrainingData` jest `false`. Zawiera komunikat zachęcający do rozpoczęcia treningu i przycisk/link (np. `Button` z Shadcn opakowany w `Link` z Next.js) kierujący do `/plans`. Może zawierać ilustrację lub ikonę.
- **Główne elementy:** Kontener (np. `div` lub `Card`), tekst (`p`), `Button` (jako `Link`).
- **Obsługiwane interakcje:** Kliknięcie przycisku CTA.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak propsów z danymi.
- **Propsy:** Brak.

### `WidgetSkeleton` / `ChartSkeleton` (`src/components/dashboard/skeletons.tsx`)

- **Opis:** Komponenty klienckie używające `Skeleton` z Shadcn/ui do stworzenia wizualnych placeholderów dla widgetów i wykresów podczas ładowania danych. Powinny naśladować strukturę i wymiary docelowych komponentów, aby zminimalizować przesunięcie layoutu (CLS).
- **Główne elementy:** Komponenty `Skeleton` ułożone tak, by przypominały `Card`, wykresy itp.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:** Brak.

## 5. Typy

Głównym typem danych jest `UserDashboardDataOutput` zdefiniowany w `src/types/api.ts`.

```typescript
// src/types/api.ts (fragment)
export interface UserDashboardDataOutput {
  hasTrainingData: boolean;
  lastSession?: {
    plan_name: string;
    completed_at: string; // ISO string format
    duration_seconds: number;
  } | null;
  weeklyProgress: {
    completed_count: number;
    goal: number; // Static goal (e.g., 5)
  };
  systematicsScore: {
    sessions_last_14_days: number;
    score: "very_good" | "good" | "average" | "poor";
  };
  trainingSummary: {
    completed_this_week: number;
    total_duration_seconds: number;
    longest_duration_seconds: number;
    average_duration_seconds: number;
  };
  charts: {
    durationTrend: {
      date: string; // ISO string date part 'YYYY-MM-DD'
      duration_seconds: number;
    }[];
    workoutsByPlan: {
      plan_name: string;
      count: number;
    }[];
  };
}
```

Dodatkowo, mogą być potrzebne typy dla propsów poszczególnych komponentów (jak opisano w sekcji 4) oraz typy dla funkcji pomocniczych (np. formatujących).

Funkcje pomocnicze (np. w `src/lib/utils.ts`):

- `formatDuration(seconds: number): string` - np. `90` -> `"1m 30s"`, `3665` -> `"1h 1m 5s"`
- `formatDateForDisplay(isoString: string): string` - np. `"2024-07-21T10:30:00Z"` -> `"21 Lip 2024"` lub inny wybrany format.
- `formatDateForAxis(dateString: string): string` - np. `"2024-07-21"` -> `"21/07"` lub `"Lip 21"`.
- `mapScoreToLabel(score: UserDashboardDataOutput['systematicsScore']['score']): string` - np. `"very_good"` -> `"Bardzo dobra"`.

## 6. Zarządzanie stanem

- **Pobieranie danych:** Główny stan (dane dashboardu) będzie zarządzany przez Next.js. Akcja serwerowa `getUserDashboardData` zostanie wywołana w komponencie serwerowym (`DashboardPage`).
- **Stan ładowania:** Obsługiwany natywnie przez Next.js `Suspense` jeśli strona jest komponentem serwerowym z asynchronicznym pobieraniem danych. Komponenty `*Skeleton` będą renderowane jako `fallback`.
- **Stan błędu:** Błędy z akcji serwerowej powinny być przechwytywane w `DashboardPage` (np. przez `try...catch` lub mechanizmy Error Boundary Next.js/React) i powinien być renderowany odpowiedni komunikat błędu.
- **Stan pusty:** Logika warunkowa w `DashboardPage` oparta na `data.hasTrainingData` decyduje o renderowaniu `EmptyDashboardState`.
- **Stan komponentów:** Poszczególne widgety i wykresy będą bezstanowe (stateless), otrzymując wszystkie potrzebne dane przez propsy. Wyjątkiem może być wewnętrzny stan biblioteki wykresów (Recharts) do obsługi tooltipów itp.
- **Custom Hooks:** Nie przewiduje się potrzeby tworzenia dedykowanych custom hooków do zarządzania stanem dla tego widoku w początkowej implementacji (przy założeniu pobierania danych w Server Component).

## 7. Integracja API

- **Endpoint:** Wykorzystana zostanie akcja serwerowa `getUserDashboardData` zaimplementowana w `src/db/actions/dashboard/get-user-dashboard.ts`.
- **Wywołanie:** `await getUserDashboardData()` w komponencie serwerowym `DashboardPage`.
- **Typy:**
  - **Żądanie:** Brak (kontekst użytkownika pobierany po stronie serwera).
  - **Odpowiedź (sukces):** `UserDashboardDataOutput` (zgodnie z definicją w `src/types/api.ts`).
  - **Odpowiedź (błąd):** Akcja może rzucić błąd (np. `Error('Unauthorized')` lub `Error('Database error: ...')`). Błędy te muszą zostać obsłużone.
- **Obsługa danych:** Wynik `UserDashboardDataOutput` jest przekazywany jako props do `DashboardLayout`, który następnie dystrybuuje odpowiednie fragmenty do poszczególnych widgetów i wykresów.

## 8. Interakcje użytkownika

- **Wejście na stronę:** Użytkownik nawiguje do `/dashboard`. System pobiera dane. Wyświetlane są szkielety, a następnie albo `EmptyDashboardState`, albo `DashboardLayout` z danymi.
- **Kliknięcie CTA (w stanie pustym):** Użytkownik klika przycisk w `EmptyDashboardState`. Następuje przekierowanie do strony z listą planów (`/plans`).
- **Interakcja z wykresami:** Użytkownik najeżdża kursorem na punkty danych (wykres liniowy) lub słupki (wykres słupkowy). Wyświetlane są tooltipy z dokładnymi wartościami (funkcjonalność Recharts).
- **Zmiana rozmiaru okna:** Układ strony (`DashboardLayout`) oraz wykresy (`ResponsiveContainer` z Recharts) dostosowują się do nowego rozmiaru ekranu.

## 9. Warunki i walidacja

- **Uwierzytelnienie:** Dostęp do ścieżki `/dashboard` powinien być chroniony. Akcja `getUserDashboardData` również weryfikuje uwierzytelnienie. Jeśli użytkownik nie jest zalogowany, powinien zostać przekierowany na stronę logowania.
- **Dostępność danych (`hasTrainingData`):** Warunek sprawdzany w `DashboardPage` do renderowania odpowiedniego widoku (pusty stan lub pełny dashboard).
- **Format danych:** Komponenty oczekują danych w formacie `UserDashboardDataOutput`. Typowanie TypeScript zapewnia spójność. Komponenty wykresów powinny być odporne na puste tablice danych (`charts.durationTrend`, `charts.workoutsByPlan`).

## 10. Obsługa błędów

- **Błąd pobierania danych (API):**
  - Jeśli `getUserDashboardData` rzuci błąd (np. problem z bazą danych, błąd sieciowy po stronie serwera), `DashboardPage` powinien przechwycić ten błąd.
  - Zamiast dashboardu, wyświetlić komponent błędu (np. `Alert` z Shadcn/ui) z przyjaznym komunikatem (np. "Nie udało się załadować danych panelu. Spróbuj ponownie później.")
  - Opcjonalnie dodać przycisk "Spróbuj ponownie", który odświeży stronę lub wywoła ponowne pobranie danych (jeśli używane jest pobieranie po stronie klienta).
  - Zalogować szczegóły błędu do systemu monitoringu (Sentry/GlitchTip).
- **Błąd renderowania komponentu (np. wykresu):**
  - Owinąć komponenty, które mogą potencjalnie rzucić błąd podczas renderowania (zwłaszcza wykresy) w React Error Boundaries.
  - W przypadku błędu, Error Boundary powinno wyświetlić zastępczy interfejs dla tego konkretnego komponentu (np. komunikat "Nie można wyświetlić wykresu") zamiast psuć całą stronę.
  - Zalogować błąd do systemu monitoringu.
- **Nieautoryzowany dostęp (401):** Middleware powinno przekierować na logowanie. Jeśli błąd 401 pojawi się z API (co nie powinno mieć miejsca przy poprawnym middleware), również przekierować na logowanie.

## 11. Kroki implementacji

1.  **Utworzenie struktury plików:** Stworzyć plik strony `src/app/dashboard/page.tsx` oraz katalog `src/components/dashboard/` z plikami dla komponentów: `DashboardLayout.tsx`, `LastTrainingWidget.tsx`, `WeeklyProgressWidget.tsx`, `SystematicsScoreWidget.tsx`, `TrainingSummaryWidget.tsx`, `DurationTrendChart.tsx`, `WorkoutsByPlanChart.tsx`, `EmptyDashboardState.tsx`, `skeletons.tsx`.
2.  **Implementacja `DashboardPage`:**
    - Ustawić jako komponent serwerowy.
    - Wywołać `await getUserDashboardData()` wewnątrz komponentu.
    - Dodać obsługę błędów (`try...catch`). W przypadku błędu renderować komponent `Alert`.
    - Dodać logikę warunkową: jeśli `!data.hasTrainingData`, renderować `<EmptyDashboardState />`, w przeciwnym razie `<DashboardLayout data={data} />`.
    - Rozważyć użycie `Suspense` z odpowiednimi `fallback` (szkieletami), jeśli ładowanie ma być obsługiwane w ten sposób.
3.  **Implementacja `EmptyDashboardState`:**
    - Stworzyć layout komponentu (tekst + przycisk w `Card`).
    - Dodać `Link` z Next.js (`import Link from 'next/link'`) w przycisku, kierujący do `/plans`.
4.  **Implementacja komponentów szkieletowych:**
    - W `skeletons.tsx` stworzyć `WidgetSkeleton` i `ChartSkeleton` używając `Skeleton` z Shadcn/ui, naśladując strukturę docelowych widgetów i wykresów. Stworzyć `DashboardSkeletonLayout` układający te szkielety.
5.  **Implementacja `DashboardLayout`:**
    - Ustawić jako komponent kliencki (`'use client'`).
    - Przyjąć `data: UserDashboardDataOutput` jako props.
    - Zdefiniować responsywną siatkę (np. `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).
    - Umieścić w siatce komponenty widgetów i wykresów, przekazując im odpowiednie fragmenty `data` jako propsy.
6.  **Implementacja Widgetów (`LastTrainingWidget`, `WeeklyProgressWidget`, etc.):**
    - Ustawić jako komponenty klienckie.
    - Przyjąć odpowiednie propsy.
    - Zaimplementować strukturę HTML przy użyciu komponentów Shadcn/ui (`Card`, `Progress` itp.).
    - Wykorzystać funkcje pomocnicze do formatowania dat, czasów trwania, ocen (`formatDateForDisplay`, `formatDuration`, `mapScoreToLabel`).
7.  **Instalacja i konfiguracja biblioteki wykresów:**
    - Zainstalować Recharts: `npm install recharts` lub `yarn add recharts`.
    - Upewnić się, że działa poprawnie w środowisku Next.js/React.
8.  **Implementacja Wykresów (`DurationTrendChart`, `WorkoutsByPlanChart`):**
    - Ustawić jako komponenty klienckie (`'use client'`).
    - Przyjąć `data` jako props.
    - Zaimplementować wykresy używając komponentów Recharts (`LineChart`, `BarChart`, osie, linie/słupki, tooltipy, legendy).
    - Opakować wykresy w `ResponsiveContainer`.
    - Zastosować formatowanie danych dla osi i tooltipów (używając np. atrybutu `formatter` lub `tickFormatter` Recharts i funkcji pomocniczych).
    - Dodać podstawowe stylowanie, aby pasowało do reszty UI.
9.  **Styling i responsywność:**
    - Dopracować styling wszystkich komponentów używając Tailwind, zgodnie z design systemem opartym na Shadcn/ui.
    - Przetestować responsywność na różnych rozmiarach ekranu (mobile, tablet, desktop) i dostosować układ siatki oraz wykresy.
10. **Dostępność:**
    - Przetestować nawigację za pomocą klawiatury.
    - Upewnić się, że elementy mają odpowiednie etykiety (ARIA labels, jeśli potrzebne).
    - Sprawdzić kontrast kolorów.
    - Dodać odpowiednie tytuły i opisy do wykresów, jeśli biblioteka na to pozwala, dla lepszej interpretacji przez czytniki ekranu.
11. **Testowanie:**
    - Przetestować wszystkie scenariusze: stan ładowania, stan błędu, stan pusty, stan z danymi.
    - Sprawdzić poprawność wyświetlanych danych we wszystkich widgetach i na wykresach dla różnych zestawów danych testowych.
    - Przetestować interakcje (CTA, tooltipy).
    - Przetestować na różnych przeglądarkach.
12. **Refaktoryzacja i czyszczenie kodu:** Przejrzeć kod, usunąć nieużywane zmienne/importy, dodać komentarze w razie potrzeby, upewnić się, że kod jest zgodny z przyjętymi standardami.
