# Plan Testów Aplikacji Trenova

## 1. Wprowadzenie

### 1.1. Cel planu testów

Celem niniejszego planu jest zdefiniowanie strategii, zakresu, zasobów i harmonogramu działań związanych z testowaniem aplikacji Trenova. Plan ma na celu zapewnienie wysokiej jakości produktu końcowego poprzez systematyczną weryfikację funkcjonalności, wydajności, bezpieczeństwa, użyteczności i dostępności aplikacji, zgodnie z wymaganiami projektowymi i oczekiwaniami użytkowników. Dokument ten stanowi podstawę do prowadzenia, monitorowania i raportowania postępów prac testowych.

### 1.2. Zakres testowania

Zakres testowania obejmuje całą aplikację Trenova, w tym:

- **Frontend:**
  - Interfejs użytkownika (UI) zbudowany w Next.js 15, React 19 i Shadcn/ui.
  - Logika komponentów po stronie klienta.
  - Routing i nawigacja w aplikacji (Next.js App Router).
  - Responsywność i kompatybilność z różnymi przeglądarkami i urządzeniami.
  - Dostępność (WCAG).
- **Backend (API Routes / Server Actions):**
  - Endpointy API (jeśli zdefiniowane w `src/app/api` lub jako Server Actions w `src/db/actions`).
  - Logika biznesowa po stronie serwera.
  - Integracja z bazą danych Supabase.
  - Integracja z zewnętrznym API OpenRouter.ai.
  - Middleware (`src/middleware.ts`).
- **Baza Danych (Supabase):**
  - Poprawność schematu bazy danych.
  - Integralność danych.
  - Poprawność działania reguł bezpieczeństwa (Row Level Security).
- **Integracje:**
  - Przepływ danych między frontendem, backendem, bazą danych i OpenRouter.ai.
  - Mechanizmy autentykacji i autoryzacji (Supabase Auth).
- **Niefunkcjonalne:**
  - Wydajność aplikacji (ładowanie, responsywność).
  - Bezpieczeństwo (podstawowe testy penetracyjne, sprawdzanie podatności).
  - Użyteczność interfejsu.

**Poza zakresem:**

- Testowanie infrastruktury hostingowej (DigitalOcean, Supabase Cloud) poza weryfikacją poprawnej konfiguracji i działania aplikacji.
- Testowanie wewnętrznych mechanizmów działania modeli AI dostarczanych przez OpenRouter.ai (skupiamy się na integracji i obsłudze odpowiedzi/błędów).
- Szczegółowe testy penetracyjne (wymagające dedykowanego zespołu/narzędzi).

## 2. Strategia testowania

Strategia opiera się na podejściu wielopoziomowym, wykorzystującym różne typy testów w celu zapewnienia kompleksowego pokrycia aplikacji, zgodnie z piramidą testów i dostępnym stosem technologicznym.

### 2.1. Typy testów do przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - **Narzędzia:** `Vitest`
  - **Zakres:** Funkcje pomocnicze (`src/utils`), logika w hookach (`src/hooks`), serwisy (`src/lib`), izolowana logika komponentów React, logika endpointów API/Server Actions (z mockowanymi zależnościami).
  - **Cel:** Weryfikacja poprawności działania małych, izolowanych fragmentów kodu.
- **Testy Integracyjne (Integration Tests):**
  - **Narzędzia:** `Vitest`, `React Testing Library (RTL)`, `Mock Service Worker (MSW)`
  - **Zakres:** Interakcje między komponentami React, komponenty korzystające z hooków i stanu, integracja komponentów z serwisami (`src/lib`), testowanie API routes/Server Actions z zamockowanymi zależnościami (np. baza danych, OpenRouter API).
  - **Cel:** Weryfikacja poprawnej współpracy pomiędzy różnymi modułami aplikacji.
- **Testy Komponentów (Component Tests):**
  - **Narzędzia:** `Playwright Component Testing`
  - **Zakres:** Testowanie komponentów UI (`src/components`, w tym `ui`) w izolacji, w środowisku przeglądarki. Weryfikacja renderowania, interakcji i wyglądu.
  - **Cel:** Szybkie testowanie wizualne i interakcyjne komponentów UI bez uruchamiania całej aplikacji.
- **Testy End-to-End (E2E Tests):**
  - **Narzędzia:** `Playwright`
  - **Zakres:** Pełne scenariusze użytkownika przeprowadzane na działającej aplikacji (frontend + backend + baza danych). Obejmuje kluczowe przepływy, np. logowanie, rejestracja, główna funkcjonalność AI, operacje CRUD.
  - **Cel:** Weryfikacja działania aplikacji z perspektywy użytkownika końcowego.
- **Testy Wizualne (Visual Regression Tests):**
  - **Narzędzia:** `Percy` / `Chromatic` (integracja z Playwright/Storybook)
  - **Zakres:** Porównywanie zrzutów ekranu kluczowych komponentów i stron w celu wykrycia niezamierzonych zmian wizualnych.
  - **Cel:** Zapewnienie spójności wizualnej interfejsu użytkownika.
- **Testy Dostępności (Accessibility Tests):**
  - **Narzędzia:** `axe-core` (zintegrowane z `Playwright` lub `RTL`)
  - **Zakres:** Automatyczna weryfikacja zgodności z wytycznymi WCAG (Web Content Accessibility Guidelines).
  - **Cel:** Zapewnienie dostępności aplikacji dla osób z niepełnosprawnościami.
- **Testy Wydajnościowe (Performance Tests):**
  - **Narzędzia:** `Lighthouse CI`, monitorowanie `Web Vitals`
  - **Zakres:** Pomiar kluczowych metryk wydajności (np. FCP, LCP, TTI, CLS) dla najważniejszych stron aplikacji. Integracja z CI/CD.
  - **Cel:** Monitorowanie i zapewnienie odpowiedniej wydajności aplikacji.
- **(Opcjonalnie) Testy Kontraktowe:**
  - **Narzędzia:** Dedykowane narzędzia lub własne skrypty.
  - **Zakres:** Weryfikacja zgodności żądań i odpowiedzi z kontraktem API OpenRouter.ai.
  - **Cel:** Wczesne wykrywanie niezgodności w integracji z zewnętrznym API.

### 2.2. Priorytety testowania

Testowanie będzie priorytetyzowane na podstawie krytyczności funkcjonalności dla biznesu, ryzyka technicznego oraz częstotliwości użycia.

- **Priorytet Wysoki:**
  - Funkcjonalności związane z autentykacją i autoryzacją (`middleware.ts`, Supabase Auth).
  - Główne przepływy użytkownika związane z interakcją z AI (OpenRouter.ai).
  - Operacje CRUD na kluczowych danych.
  - Logika biznesowa w API Routes / Server Actions (`src/app/api` / `src/db/actions`).
  - Integracja z Supabase (`src/db`, `src/lib`).
  - Kluczowe komponenty UI i serwisy (`src/components`, `src/lib`).
- **Priorytet Średni:**
  - Pozostałe funkcjonalności aplikacji.
  - Mniej krytyczne komponenty UI.
  - Testy wydajnościowe i dostępności.
  - Obsługa przypadków brzegowych i błędów.
- **Priorytet Niski:**
  - Statyczne strony informacyjne.
  - Elementy UI o niskiej interaktywności.
  - Testy wizualne mniej istotnych elementów.

## 3. Środowisko testowe

### 3.1. Wymagania sprzętowe i programowe

- **Sprzęt:** Standardowe stacje robocze dla zespołu QA, dostęp do urządzeń mobilnych (lub emulatorów/symulatorów) do testów responsywności.
- **Oprogramowanie:**
  - Przeglądarki: Najnowsze wersje Chrome, Firefox, Safari, Edge.
  - Systemy operacyjne: macOS, Windows, Linux (dla zespołu QA).
  - Node.js (wersja zgodna z `.nvmrc`).
  - Docker (do uruchamiania lokalnego środowiska, jeśli dotyczy).
  - Narzędzia deweloperskie przeglądarek.
  - Dostęp do instancji Supabase (developerska, testowa/stagingowa).
  - Klucze API do OpenRouter.ai (dla środowiska testowego, z limitami).

### 3.2. Konfiguracja środowiska

- **Środowisko Developerskie (Lokalne):** Używane do uruchamiania testów jednostkowych, integracyjnych i komponentów podczas developmentu. Wymaga lokalnej instancji aplikacji i potencjalnie lokalnej instancji Supabase (lub połączenia ze zdalną instancją developerską). Zależności zewnętrzne (OpenRouter) będą mockowane (MSW) lub używane z kluczami developerskimi.
- **Środowisko Testowe/Stagingowe:** Odseparowana instancja aplikacji i bazy danych Supabase, jak najbardziej zbliżona do środowiska produkcyjnego. Używane do testów E2E, testów manualnych, UAT. Zintegrowane z CI/CD (np. Github Actions) do automatycznego deploymentu i uruchamiania testów. Powinno używać dedykowanych kluczy API dla OpenRouter.ai.
- **Środowisko Produkcyjne:** Testowanie ograniczone do testów typu "smoke tests" po wdrożeniu nowej wersji.

## 4. Przypadki testowe

Poniżej znajduje się lista wysokopoziomowych przypadków testowych dla kluczowych funkcjonalności. Szczegółowe przypadki testowe będą tworzone i zarządzane w dedykowanym narzędziu (np. Jira, TestRail).

- **TC-AUTH-01:** Rejestracja nowego użytkownika (poprawna, walidacja pól, istniejący email).
- **TC-AUTH-02:** Logowanie użytkownika (poprawne dane, błędne dane, obsługa "zapomniałem hasła").
- **TC-AUTH-03:** Wylogowanie użytkownika.
- **TC-AUTH-04:** Ochrona tras wymagających zalogowania (`middleware.ts`).
- **TC-AI-01:** Inicjalizacja interfejsu AI (np. czatu).
- **TC-AI-02:** Wysłanie zapytania do modelu AI i poprawne wyświetlenie odpowiedzi.
- **TC-AI-03:** Obsługa stanów ładowania podczas oczekiwania na odpowiedź AI.
- **TC-AI-04:** Obsługa błędów ze strony API OpenRouter.ai (np. błąd sieci, błąd API, przekroczenie limitu).
- **TC-DATA-01:** Wyświetlanie listy rekordów (np. historii interakcji).
- **TC-DATA-02:** Tworzenie nowego rekordu danych (walidacja, potwierdzenie).
- **TC-DATA-03:** Edycja istniejącego rekordu danych (ładowanie danych, zapis zmian, walidacja).
- **TC-DATA-04:** Usuwanie rekordu danych (potwierdzenie, weryfikacja usunięcia).
- **TC-UI-01:** Weryfikacja responsywności interfejsu na różnych rozdzielczościach (desktop, tablet, mobile).
- **TC-UI-02:** Weryfikacja poprawności działania kluczowych komponentów Shadcn/ui (np. formularze, modale, tabele).
- **TC-NFR-01:** Testy dostępności głównych stron i przepływów za pomocą `axe-core`.
- **TC-NFR-02:** Pomiar metryk Web Vitals dla strony głównej i kluczowych podstron.
- **TC-EDGE-01:** Testowanie walidacji formularzy (puste pola, niepoprawne formaty, znaki specjalne).
- **TC-EDGE-02:** Testowanie zachowania aplikacji przy braku połączenia sieciowego (jeśli dotyczy logiki offline).

## 5. Harmonogram testów

Harmonogram testów będzie ściśle powiązany z harmonogramem developmentu (np. sprintami w metodyce Agile).

- **Testy jednostkowe, integracyjne, komponentów:** Wykonywane ciągle przez deweloperów podczas tworzenia kodu. Uruchamiane automatycznie przy każdym pushu do repozytorium (pre-commit hooks, CI).
- **Testy E2E, wizualne, dostępności, wydajnościowe:** Uruchamiane automatycznie w ramach pipeline'u CI/CD po każdym merge do głównej gałęzi developerskiej (np. `develop` lub `main`) oraz przed wdrożeniem na środowisko Staging/Produkcję.
- **Testy manualne/eksploracyjne:** Przeprowadzane przez zespół QA na środowisku Staging przed każdym wydaniem (np. na koniec sprintu). Czas trwania zależny od zakresu zmian (szacunkowo 1-3 dni na sprint).
- **Testy regresji:** Automatyczne (E2E, wizualne) i manualne (krytyczne ścieżki) wykonywane przed każdym wydaniem produkcyjnym.
- **User Acceptance Testing (UAT):** Przeprowadzane przez interesariuszy/klienta na środowisku Staging po zakończeniu testów QA.

Dokładne ramy czasowe zostaną ustalone w planie wydania/sprintu.

## 6. Role i odpowiedzialności

- **Deweloperzy:**
  - Pisanie testów jednostkowych, integracyjnych i komponentów dla tworzonego kodu.
  - Utrzymanie wysokiego pokrycia kodu testami.
  - Naprawianie błędów znalezionych na wszystkich etapach testowania.
  - Uczestnictwo w przeglądach kodu pod kątem testowalności.
- **Inżynierowie QA:**
  - Tworzenie i utrzymanie planu testów.
  - Projektowanie, implementacja i utrzymanie automatycznych testów E2E, wizualnych, dostępności i wydajnościowych.
  - Wykonywanie testów manualnych i eksploracyjnych.
  - Raportowanie i śledzenie błędów.
  - Analiza wyników testów automatycznych.
  - Zapewnienie jakości procesu testowego.
  - Konfiguracja i utrzymanie środowisk testowych.
- **Product Owner / Interesariusze:**
  - Definiowanie kryteriów akceptacji.
  - Udział w User Acceptance Testing (UAT).
  - Priorytetyzacja funkcjonalności i błędów.
- **DevOps / Inżynierowie Infrastruktury:**
  - Wsparcie w konfiguracji i utrzymaniu pipeline'ów CI/CD oraz środowisk testowych.

## 7. Kryteria akceptacji

Testy zostaną uznane za zakończone dla danego wydania, gdy spełnione zostaną następujące kryteria:

- **Kryteria wejścia (rozpoczęcia testów):**
  - Dostępna stabilna wersja aplikacji na środowisku testowym.
  - Ukończone testy jednostkowe i integracyjne dla nowych funkcjonalności (zgodnie z ustaloną metryką pokrycia kodu).
  - Dostępna dokumentacja wymagań/zmian dla testowanej wersji.
- **Kryteria wyjścia (zakończenia testów):**
  - Wszystkie zaplanowane przypadki testowe (automatyczne i manualne) zostały wykonane.
  - Wszystkie testy automatyczne (jednostkowe, integracyjne, E2E, wizualne, etc.) przechodzą pomyślnie w CI/CD.
  - Brak otwartych błędów o priorytecie krytycznym (Blocker) lub wysokim (Critical).
  - Wszystkie błędy o priorytecie średnim (Major) i niższym (Minor, Trivial) zostały przeanalizowane, a decyzja o ich naprawie lub odłożeniu została podjęta przez Product Ownera.
  - Spełnione zostały zdefiniowane metryki jakości (np. pokrycie kodu testami, wyniki testów wydajnościowych i dostępności).
  - Pomyślnie zakończone testy UAT (jeśli dotyczy).
  - Raport końcowy z testów został przygotowany i zaakceptowany.

## 8. Raportowanie i śledzenie błędów

- **Narzędzie:** Dedykowany system do śledzenia błędów (np. Jira, GitHub Issues).
- **Proces zgłaszania:**
  - Każdy znaleziony błąd musi zostać zgłoszony w systemie śledzenia błędów.
  - Zgłoszenie powinno zawierać:
    - Tytuł (jasny i zwięzły opis problemu).
    - Opis (szczegółowe kroki do reprodukcji błędu).
    - Oczekiwany rezultat.
    - Aktualny (błędny) rezultat.
    - Środowisko testowe (przeglądarka, system operacyjny, wersja aplikacji).
    - Priorytet (Krytyczny, Wysoki, Średni, Niski) i dotkliwość (Severity) błędu.
    - Zrzuty ekranu / nagrania wideo (jeśli to możliwe).
    - Przypisanie do odpowiedniego komponentu/modułu.
- **Cykl życia błędu:** Zgłoszony -> Analizowany -> Przypisany do naprawy -> Naprawiony -> Gotowy do retestu -> Retestowany -> Zamknięty / Ponownie otwarty.
- **Raportowanie postępów:** Regularne raporty o stanie testów (np. codzienne, tygodniowe) zawierające liczbę wykonanych testów, znalezionych błędów (wg priorytetów i statusu), pokrycie kodu testami, status testów automatycznych.

## 9. Ryzyka i plany awaryjne

| Ryzyko                                    | Prawdopodobieństwo | Wpływ  | Plan Mitygacji / Awaryjny                                                                                                                                                                    |
| :---------------------------------------- | :----------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Niedostępność środowiska testowego**    | Średnie            | Wysoki | Posiadanie procedur szybkiego odtwarzania środowiska, backupy konfiguracji, komunikacja z DevOps w celu szybkiej naprawy. Użycie lokalnych środowisk jako alternatywy dla niektórych testów. |
| **Opóźnienia w dostarczaniu buildu**      | Średnie            | Średni | Elastyczne planowanie testów, priorytetyzacja testów dla dostępnych funkcjonalności, komunikacja z zespołem developerskim.                                                                   |
| **Duża liczba krytycznych błędów**        | Niskie             | Wysoki | Alokacja dodatkowych zasobów developerskich do naprawy błędów, re-priorytetyzacja zakresu wydania, intensywna współpraca QA-Dev.                                                             |
| **Niska jakość kodu utrudniająca testy**  | Niskie             | Średni | Wprowadzenie statycznej analizy kodu (linters), przeglądy kodu (code reviews), promowanie dobrych praktyk TDD/BDD, szkolenia dla deweloperów.                                                |
| **Problemy z wydajnością aplikacji**      | Średnie            | Wysoki | Wczesne i regularne testy wydajnościowe (Lighthouse CI), profilowanie aplikacji, optymalizacja zapytań do bazy danych i logiki backendowej.                                                  |
| **Problemy z integracją z OpenRouter.ai** | Średnie            | Wysoki | Dokładne testy integracyjne z mockowaniem API (MSW), testy kontraktowe (opcjonalnie), obsługa błędów API po stronie Trenova, monitorowanie limitów API.                                      |
| **Niewystarczające zasoby QA**            | Średnie            | Średni | Automatyzacja testów (szczególnie regresji), priorytetyzacja zadań testowych, rekrutacja/szkolenie dodatkowych testerów, outsourcing części testów (jeśli to możliwe).                       |
| **Zmiany wymagań w trakcie testowania**   | Wysokie            | Średni | Bliska współpraca z Product Ownerem, elastyczne podejście do planowania testów, szybka aktualizacja przypadków testowych, ocena wpływu zmian na harmonogram i zakres.                        |
