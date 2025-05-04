# RFC: Panel Użytkownika dla Przeglądu Treningów

## 1. Podsumowanie

Niniejszy dokument RFC (Request for Comments) proponuje wprowadzenie nowej funkcji "Panel Użytkownika" (User Dashboard) w aplikacji Trenova. Głównym celem panelu jest zapewnienie użytkownikom skonsolidowanego widoku ich aktywności treningowej i postępów, opierając się na danych zbieranych przez podstawową funkcję śledzenia treningów (zdefiniowaną w `rfc-training-tracking-progress.md`). Panel będzie zawierał kluczowe komponenty (widgety) takie jak podsumowanie ostatniego treningu, wskaźnik tygodniowego postępu, ocenę systematyczności, ogólne statystyki treningowe oraz wykresy wizualizujące trendy. Oczekuje się, że wprowadzenie panelu zwiększy zaangażowanie użytkowników i dostarczy im cennych informacji na temat ich wzorców treningowych.

## 2. Motywacja

Obecnie aplikacja oferuje jedynie prostą listę ukończonych sesji treningowych, co jest niewystarczające do pełnego zrozumienia postępów i nawyków treningowych przez użytkownika. Brakuje szybkiego, wizualnego podsumowania kluczowych metryk. Wprowadzenie Panelu Użytkownika odpowiada na tę potrzebę, dostarczając:

- **Szybki przegląd:** Umożliwienie użytkownikom natychmiastowego dostępu do najważniejszych statystyk (np. ostatni trening, tygodniowy postęp).
- **Wizualizację postępów:** Prezentacja danych w formie wykresów (np. trend czasu trwania treningów), co ułatwia identyfikację wzorców.
- **Zwiększoną motywację:** Widżety takie jak "Ocena systematyczności" i "Tygodniowy postęp" mogą zachęcać użytkowników do regularnych ćwiczeń.
- **Wartość dodaną:** Wykorzystanie już istniejącej infrastruktury do zbierania danych (`training_sessions`) do stworzenia bardziej angażującego doświadczenia.

Panel Użytkownika jest naturalnym rozwinięciem funkcjonalności śledzenia treningów, przekształcając surowe dane w użyteczne informacje.

## 3. Proponowane Rozwiązanie

Proponuje się stworzenie dedykowanej strony/widoku "Panel Użytkownika", dostępnej dla zalogowanych użytkowników. Panel będzie składał się z następujących widgetów:

- **Ostatni trening:**

  - Wyświetla dane ostatniej zarejestrowanej sesji treningowej użytkownika.
  - Informacje: Nazwa planu (`plan_name`), data sesji (`session_date`), czas trwania (`duration_seconds`).
  - **Wymaga:** Pobrania `plan_name` z tabeli `training_plans` na podstawie `plan_id` z najnowszego rekordu `training_sessions` dla danego użytkownika (wymagany `JOIN` lub dodatkowe zapytanie).

- **Tygodniowy postęp:**

  - Wizualizuje postęp w realizacji tygodniowego celu treningowego.
  - Forma: Pasek postępu (np. `Progress` z Shadcn/ui).
  - Logika: Pokazuje liczbę ukończonych sesji w bieżącym standardowym tygodniu kalendarzowym (od poniedziałku do niedzieli) w stosunku do **stałego celu 5 treningów**.

- **Ocena systematyczności:**

  - Ocenia regularność treningów użytkownika na podstawie ostatnich 14 dni.
  - Logika: Obliczana na podstawie liczby sesji (`N`) w ciągu ostatnich 14 dni (włącznie z dniem dzisiejszym).
  - Skala ocen:
    - `N >= 8`: "Bardzo dobra"
    - `N >= 5`: "Dobra"
    - `N >= 3`: "Średnia"
    - `N < 3`: "Słaba"

- **Podsumowanie treningów:**

  - Zestawienie kluczowych statystyk historycznych.
  - Metryki:
    - **Ukończone treningi (tydzień):** Liczba sesji w ostatnim standardowym tygodniu kalendarzowym (poniedziałek-niedziela).
    - **Całkowity czas:** Suma `duration_seconds` ze _wszystkich_ zarejestrowanych sesji w historii użytkownika.
    - **Najdłuższy trening:** Maksymalna wartość `duration_seconds` ze _wszystkich_ zarejestrowanych sesji.
    - **Średni czas treningu:** Średnia wartość `duration_seconds` ze _wszystkich_ zarejestrowanych sesji.
  - **Uwaga:** Należy jasno zakomunikować (np. poprzez tooltip lub opis), że statystyki "Całkowity czas", "Najdłuższy trening" i "Średni czas treningu" odzwierciedlają _aktualny_ stan danych w tabeli `training_sessions`. Oznacza to, że usunięcie planu treningowego (i powiązanych z nim sesji) spowoduje przeliczenie tych statystyk. Zostało to potwierdzone jako akceptowalne zachowanie.

- **Wykresy:**

  - **Trend czasu treningów:**
    - Typ: Wykres liniowy.
    - Dane: `session_date` (oś X) vs `duration_seconds` (oś Y) dla _wszystkich_ sesji w historii użytkownika.
  - **Ilość treningów wg planu:**
    - Typ: Wykres słupkowy.
    - Dane: Całkowita liczba ukończonych sesji pogrupowana według `plan_name` dla _wszystkich aktualnie istniejących_ planów w historii użytkownika.
    - **UI:** Należy uwzględnić potencjalny problem z długimi nazwami planów na osiach wykresu (np. zastosować skracanie tekstu z tooltipem lub rotację etykiet).

- **Stan początkowy/pusty:**
  - Wyświetlany, gdy użytkownik nie ma jeszcze żadnych zarejestrowanych sesji treningowych.
  - Wygląd: Elementy statystyk i wykresów są widoczne jako "placeholdery" z efektem rozmycia (`blur`).
  - Nakładka tekstowa: "Wykonaj pierwszy trening aby odblokować statystyki".
  - Dodatkowy element: Przycisk/link kierujący do strony z listą planów treningowych użytkownika, zachęcający do rozpoczęcia aktywności.

**Technologia:**

- **Frontend:** Komponenty React budowane w ramach Next.js.
- **Backend:** Logika pobierania i agregacji danych zaimplementowana jako Server Actions w Next.js.
- **Wykresy:** Wykorzystanie biblioteki do wykresów, np. Recharts, z zachowaniem spójności stylistycznej z Shadcn/ui.
- **Stylowanie:** Tailwind CSS i komponenty Shadcn/ui.

## 4. Alternatywy Rozważane

Podczas dyskusji skupiono się na zdefiniowaniu podstawowych widgetów i metryk możliwych do zrealizowania w oparciu o istniejące, minimalne dane śledzenia (zgodnie z `rfc-training-tracking-progress.md`).

- **Alternatywne układy/widgety:** Nie eksplorowano dogłębnie innych kombinacji widgetów lub alternatywnych układów panelu w tej iteracji. Priorytetem było dostarczenie wartości bazującej na dostępnych danych.
- **Zaawansowane śledzenie:** Funkcje wymagające bardziej szczegółowych danych (np. śledzenie wydajności per ćwiczenie, monitorowanie podnoszonych ciężarów, analiza tętna) zostały świadomie wykluczone, ponieważ wykraczają poza zakres MVP i możliwości obecnego systemu śledzenia.
- **Konfiguracja użytkownika:** Rozważano możliwość wprowadzenia konfiguracji przez użytkownika (np. ustawienie własnego celu tygodniowego zamiast stałych 5, wybór zakresu dat dla wykresów), ale zdecydowano o **pominięciu** tych opcji w pierwszej wersji w celu uproszczenia implementacji i interfejsu.

## 5. Plan Implementacji

Implementacja zostanie podzielona na następujące etapy:

1.  **Backend (Server Actions):**

    - Stworzenie nowej/nowych Akcji Serwera do pobierania danych z `training_sessions`.
    - Implementacja logiki `JOIN` z `training_plans` w celu uzyskania `plan_name` dla "Ostatniego treningu" i wykresu "Ilość treningów wg planu".
    - Zaimplementowanie logiki agregacji danych dla poszczególnych widgetów:
      - Filtrowanie po użytkowniku (`user_id`).
      - Obliczanie liczby sesji w bieżącym tygodniu (poniedziałek-niedziela).
      - Obliczanie liczby sesji w ostatnich 14 dniach.
      - Obliczanie sumy, maksimum i średniej `duration_seconds` dla wszystkich sesji.
      - Grupowanie sesji według `plan_id` (i pobieranie `plan_name`).
    - Zapewnienie poprawnej i wydajnej obsługi operacji na datach (uwzględnienie stref czasowych, jeśli dotyczy).

2.  **Frontend (Komponenty React):**

    - Stworzenie głównego komponentu widoku `DashboardView` (`/src/components/DashboardView.tsx` lub podobnie).
    - Opracowanie osobnych, reużywalnych komponentów dla każdego widgetu (np. `LastTrainingWidget`, `WeeklyProgressWidget`, `SystematicsScoreWidget`, `TrainingSummaryWidget`, `DurationTrendChart`, `WorkoutsByPlanChart`).
    - Integracja biblioteki Recharts (lub innej wybranej) do tworzenia komponentów wykresów, zgodnie ze stylistyką Shadcn/ui.
    - Implementacja stanów ładowania (`loading states`) podczas pobierania danych przez Server Actions.
    - Implementacja dedykowanego widoku dla stanu pustego/początkowego.
    - Dodanie odpowiedniego routingu w Next.js, aby strona panelu była dostępna (np. `/dashboard`).

3.  **Baza Danych (Supabase):**

    - Weryfikacja istnienia lub dodanie niezbędnych indeksów w tabeli `training_sessions` w celu optymalizacji zapytań wykonywanych przez panel. Kluczowe kolumny to `user_id` i `session_date`. Indeks na `plan_id` również może być pomocny przy `JOIN`.

4.  **Testowanie:**
    - Testy jednostkowe dla logiki agregacji w Server Actions.
    - Testy komponentów React.
    - Testy E2E symulujące interakcję użytkownika z panelem w różnych stanach (z danymi, stan pusty).

## 6. Ryzyka i Mitygacja

- **Ryzyko:** Potencjalne problemy z wydajnością przy obliczaniu statystyk i generowaniu wykresów obejmujących całą historię treningową użytkownika, szczególnie dla użytkowników z dużą liczbą sesji.

  - **Mitygacja:**
    - **Optymalizacja zapytań:** Upewnienie się, że zapytania SQL/Supabase są wydajne i wykorzystują odpowiednie indeksy bazodanowe.
    - **Monitorowanie:** Śledzenie wydajności panelu po wdrożeniu.
    - **Przyszłe optymalizacje (w razie potrzeby):** Rozważenie ograniczenia domyślnego widoku danych (np. do ostatnich 3 lub 6 miesięcy z opcją "pokaż wszystko"), implementacja paginacji dla wykresów historycznych lub wprowadzenie mechanizmów pre-agregacji danych (np. w tle za pomocą funkcji cron). Obecne wymaganie zakłada jednak pokazywanie całej historii.

- **Ryzyko:** Możliwość konfuzji lub błędnej interpretacji przez użytkowników faktu, że statystyki obejmujące całą historię ("Całkowity czas", "Najdłuższy trening", "Średni czas treningu") zmieniają się po usunięciu planów treningowych (i powiązanych sesji).

  - **Mitygacja:**
    - **Akceptacja zachowania:** Zgodnie z potwierdzeniem, jest to oczekiwane działanie systemu.
    - **Komunikacja w UI (opcjonalnie):** W przyszłości można rozważyć dodanie dyskretnej informacji (np. tooltip przy statystykach), wyjaśniającej, że odzwierciedlają one aktualnie zapisane sesje.

- **Ryzyko:** Stały cel 5 treningów tygodniowo w widgecie "Tygodniowy postęp" może nie odpowiadać rzeczywistym planom lub celom wszystkich użytkowników.
  - **Mitygacja:**
    - **Świadome uproszczenie:** Uznanie tego za uproszczenie w pierwszej wersji panelu.
    - **Potencjalne przyszłe ulepszenie:** Zaznaczenie możliwości wprowadzenia konfiguracji celu przez użytkownika jako potencjalnej przyszłej funkcjonalności.

## 7. Otwarte Pytania

Na podstawie przeprowadzonych dyskusji, główne wymagania dotyczące funkcjonalności i zawartości Panelu Użytkownika zostały wyjaśnione. Obecnie nie zidentyfikowano żadnych istotnych otwartych pytań blokujących rozpoczęcie implementacji. Potwierdzono ostateczne brzmienie tekstów (np. dla stanu pustego) i logikę obliczeń.
