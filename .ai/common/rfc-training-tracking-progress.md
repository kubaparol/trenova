# RFC: Podstawowe Śledzenie Postępów Treningowych

**Data:** [Aktualna Data]
**Autor:** [Twoje Imię/Zespół]
**Status:** Wersja Robocza

## 1. Podsumowanie

Niniejszy dokument RFC (Request for Comments) proponuje wprowadzenie nowej funkcji do aplikacji Trenova: podstawowego śledzenia postępów treningowych. Celem tej funkcji jest umożliwienie użytkownikom oznaczania ukończenia poszczególnych dni treningowych w ramach wygenerowanych planów, mierzenie całkowitego czasu trwania sesji oraz przeglądanie prostej historii ukończonych treningów.

Funkcja ta została zaprojektowana z naciskiem na absolutną prostotę implementacji i użytkowania. Użytkownicy będą mogli rozpocząć sesję dla konkretnego dnia planu, sekwencyjnie oznaczać ukończenie ćwiczeń/serii i automatycznie zapisać sesję po ukończeniu _ostatniego_ elementu. Kluczowym założeniem jest brak możliwości częściowego zapisu postępów – przerwanie sesji (np. zamknięcie przeglądarki) skutkuje utratą danych dla tej konkretnej sesji. Historia będzie zawierać jedynie podstawowe informacje o ukończonych sesjach. Śledzone dane nie będą miały wpływu na przyszłe generowanie planów przez AI w tej iteracji.

## 2. Motywacja

Potrzeba wprowadzenia funkcji śledzenia postępów wynika z chęci dostarczenia użytkownikom możliwości monitorowania ich zaangażowania w realizację wygenerowanych planów treningowych. Chociaż nie było to częścią pierwotnego zakresu MVP (Minimum Viable Product), dodanie tej funkcjonalności stanowi naturalne rozszerzenie, które zwiększa wartość aplikacji dla użytkownika, dając poczucie postępu i spełnienia.

Główną korzyścią jest zapewnienie użytkownikom prostego rejestru ukończonych sesji treningowych. Nawet bez zaawansowanych analiz czy wpływu na mechanizmy AI w obecnej fazie, możliwość przejrzenia historii ukończonych treningów (kiedy, jaki plan, jaki dzień, jak długo) stanowi cenną informację zwrotną i motywację do dalszych ćwiczeń. Wprowadzenie tej podstawowej wersji pozwoli zebrać opinie użytkowników i potencjalnie rozbudować funkcję w przyszłości.

## 3. Proponowane Rozwiązanie

Szczegółowy opis proponowanej funkcji śledzenia postępów, oparty wyłącznie na uzgodnionych założeniach:

### 3.1. Przepływ Użytkownika (User Flow)

1.  **Inicjacja Sesji:** Użytkownik w widoku szczegółów aktywnego planu treningowego, dla konkretnego dnia, klika przycisk "Rozpocznij Sesję".
2.  **Interfejs Sesji:** Wyświetlany jest minimalistyczny widok zawierający listę ćwiczeń i serii zaplanowanych na dany dzień. Interfejs automatycznie podświetla pierwszy element do wykonania.
3.  **Oznaczanie Ukończenia:**
    - Dla ćwiczeń opartych na powtórzeniach (`exercise.repetitions`): Użytkownik jednym kliknięciem/dotknięciem oznacza ukończenie danej serii.
    - Dla ćwiczeń opartych na czasie (`exercise.duration_minutes` || `exercise.duration_seconds`): Użytkownik uruchamia stoper (jeśli wymagane manualne uruchomienie - do ustalenia) lub stoper startuje automatycznie. Po upływie czasu, użytkownik jednym kliknięciem/dotknięciem oznacza ukończenie.
    - **Brak możliwości cofnięcia (Undo):** Przypadkowe oznaczenie jako ukończone jest nieodwracalne w ramach sesji.
    - **Brak możliwości pomijania:** Użytkownik musi oznaczać ukończenie elementów sekwencyjnie, zgodnie z planem. Nie ma możliwości pominięcia ćwiczenia lub serii.
4.  **Licznik Odpoczynku:** Po oznaczeniu ukończenia elementu, automatycznie uruchamiany jest licznik czasu odpoczynku (`exercise.rest_time_second`), jeśli jest zdefiniowany dla następującego po nim odpoczynku.
5.  **Wizualizacja Odpoczynku:** Zakończenie odliczania czasu odpoczynku jest sygnalizowane wizualnie (np. animacją). Użytkownik manualnie przechodzi do oznaczenia kolejnego elementu (klikając/dotykając go lub przycisk kontynuacji). Interfejs automatycznie przewija/podświetla kolejny aktywny element.
6.  **Zakończenie i Zapis Sesji:** Sesja kończy się i jest automatycznie zapisywana w bazie danych _tylko i wyłącznie_ po oznaczeniu ukończenia **ostatniego** ćwiczenia/serii w danym dniu treningowym. Zapisywany jest całkowity czas trwania sesji (od kliknięcia "Rozpocznij Sesję" do oznaczenia ostatniego elementu).
7.  **Przerwanie Sesji:** Zamknięcie przeglądarki, aplikacji, przejście do innej strony lub jakakolwiek inna forma przerwania sesji przed oznaczeniem ostatniego elementu skutkuje **całkowitą utratą** postępów dla tej sesji. Żadne dane nie są zapisywane.
8.  **Przeglądanie Historii:** Użytkownik ma dostęp do widoku historii, gdzie wyświetlana jest lista ukończonych sesji.

### 3.2. Śledzone Dane (Data Tracked)

Podczas aktywnej sesji śledzone jest jedynie _co_ zostało oznaczone jako ukończone w celu zarządzania przepływem. Po pomyślnym ukończeniu całej sesji, zapisywane są wyłącznie następujące dane zagregowane:

- Identyfikator użytkownika (`user_id`)
- Identyfikator planu (`plan_id`)
- Data i czas ukończenia sesji (`session_date`)
- Nazwa dnia planu (`plan_day_name`)
- Całkowity czas trwania sesji w sekundach (`duration_seconds`)

Nie są zapisywane żadne szczegółowe informacje o poszczególnych seriach, powtórzeniach, czasie trwania konkretnych ćwiczeń czy osiągniętych wynikach (ciężar, RPE itp.).

### 3.3. Interfejs Użytkownika (UI)

- **Widok Sesji:** Minimalistyczny interfejs wyświetlający listę ćwiczeń/serii na dany dzień. Elementy są prezentowane w ustalonej kolejności. Aktywny element (następny do wykonania lub w trakcie odpoczynku) jest wyraźnie podświetlony. Interfejs automatycznie przewija się do aktywnego elementu. Wyświetlany jest licznik czasu odpoczynku (jeśli aktywny). Interakcja ogranicza się do kliknięcia/dotknięcia w celu oznaczenia ukończenia.
- **Widok Historii:** Prosta lista ukończonych sesji treningowych. Każdy wpis zawiera: datę ukończenia (`session_date`), nazwę planu (`plan_name` - do pobrania na podstawie `plan_id`), nazwę dnia planu (`plan_day_name`) oraz całkowity czas trwania sesji (`duration_seconds`).
- **Brak Wskaźników na Planie:** W widoku głównym planu treningowego nie będzie żadnych wizualnych oznaczeń wskazujących, które dni zostały już ukończone.

### 3.4. Przechowywanie Danych (Data Storage)

W bazie danych Supabase zostanie utworzona nowa tabela: `training_sessions`.

**Struktura tabeli `training_sessions`:**

- `id`: `uuid` (Primary Key)
- `user_id`: `uuid` (Foreign Key do tabeli `users`)
- `plan_id`: `uuid` (Foreign Key do tabeli `plans`)
- `session_date`: `timestamp with time zone` (Data i czas ukończenia sesji)
- `plan_day_name`: `text` (Nazwa dnia z planu, np. "Dzień 1 - Klatka piersiowa")
- `duration_seconds`: `integer` (Całkowity czas trwania sesji w sekundach)

Indeksy powinny być utworzone na `user_id` i `plan_id` w celu optymalizacji zapytań.

### 3.5. Cykl Życia Danych (Data Lifecycle)

- **Zapis:** Dane sesji (pojedynczy rekord w `training_sessions`) są zapisywane **tylko** po pomyślnym ukończeniu ostatniego elementu w zaplanowanym dniu treningowym.
- **Usuwanie:** Wszystkie rekordy w `training_sessions` powiązane z danym `plan_id` są **usuwane** w momencie, gdy użytkownik usunie ten plan treningowy.

### 3.6. Integracja AI (AI Integration)

Dane gromadzone w tabeli `training_sessions` (informacje o ukończonych sesjach i ich czasie trwania) **nie będą** wykorzystywane do wpływania na generowanie przyszłych planów treningowych przez mechanizmy AI w tej iteracji. Funkcja ma charakter czysto informacyjny dla użytkownika.

## 4. Rozważane Alternatywy

Podczas definiowania zakresu tej funkcji rozważano i świadomie odrzucono następujące alternatywy, głównie w celu priorytetyzacji absolutnej prostoty implementacji i minimalizacji złożoności, nawet kosztem pewnych udogodnień dla użytkownika:

- **Zapis przyrostowy / Odzyskiwanie sesji:** Odrzucono możliwość zapisywania postępów po każdym ukończonym ćwiczeniu/serii lub wykorzystania `localStorage` do przechowywania stanu sesji w celu jej odzyskania po przerwaniu (np. zamknięciu karty).
  - _Powód odrzucenia:_ Znacząco zwiększa złożoność implementacji (zarządzanie stanem, synchronizacja, obsługa błędów zapisu). Decyzja o akceptacji ryzyka utraty danych w zamian za prostotę była świadoma i zgodna z wytycznymi.
- **Możliwość edycji / cofania (Undo):** Odrzucono dodanie przycisku "Cofnij" dla przypadkowo oznaczonych elementów.
  - _Powód odrzucenia:_ Dodaje złożoność do zarządzania stanem sesji i logiki przepływu. Utrzymanie minimalizmu interfejsu i logiki było priorytetem.
- **Możliwość pomijania ćwiczeń/serii:** Odrzucono opcję pozwalającą użytkownikom na pomijanie elementów planu w trakcie sesji.
  - _Powód odrzucenia:_ Utrzymanie ścisłej zgodności z zaplanowanym treningiem i uproszczenie logiki sesji.
- **Manualne zakończenie sesji:** Odrzucono możliwość manualnego zakończenia sesji przez użytkownika przed ukońzeniem wszystkich elementów.
  - _Powód odrzucenia:_ Uproszczenie logiki - sesja jest albo ukończona w całości i zapisana, albo przerwana i odrzucona.
- **Szczegółowe logi per seria/ćwiczenie:** Odrzucono podejście polegające na tworzeniu osobnych rekordów dla każdej ukończonej serii/ćwiczenia (np. w tabeli `session_set_logs`).
  - _Powód odrzucenia:_ Znacząco zwiększa objętość przechowywanych danych i złożoność zarówno zapisu, jak i późniejszego odczytu/prezentacji, bez dostarczania kluczowej wartości w ramach założonej prostoty. Zdecydowano się na przechowywanie jedynie zagregowanych danych o całej sesji.
- **Śledzenie dodatkowych metryk:** Odrzucono śledzenie używanego ciężaru, liczby wykonanych powtórzeń (jeśli inna niż planowana), RPE (Rate of Perceived Exertion) itp.
  - _Powód odrzucenia:_ Złożoność interfejsu wprowadzania danych i przechowywania, wykraczająca poza cel podstawowego śledzenia _ukończenia_ sesji.
- **Zachowanie danych po usunięciu planu:** Odrzucono pomysł pozostawienia danych w `training_sessions` po usunięciu powiązanego planu.
  - _Powód odrzucenia:_ Utrzymanie spójności danych i uproszczenie zarządzania cyklem życia danych. Dane sesji są ściśle powiązane z kontekstem planu.
- **Wykorzystanie danych przez AI:** Odrzucono wykorzystanie danych o postępach do modyfikacji przyszłych planów AI w tej iteracji.
  - _Powód odrzucenia:_ Skupienie się na dostarczeniu podstawowej funkcjonalności śledzenia. Integracja z AI jest potencjalnym, ale znacznie bardziej złożonym rozszerzeniem na przyszłość.

## 5. Plan Implementacji

Wysokopoziomowe kroki niezbędne do wdrożenia funkcji:

1.  **Baza Danych (Supabase):**
    - Zdefiniować schemat tabeli `training_sessions` w SQL lub poprzez migracje Supabase.
    - Zastosować migrację w środowisku deweloperskim i produkcyjnym.
    - Dodać odpowiednie polityki RLS (Row Level Security) zapewniające dostęp użytkownika tylko do jego własnych danych sesji.
2.  **Logika Backendowa (Next.js Server Actions):**
    - Utworzyć nowy plik akcji serwera, np. `src/db/actions/training-sessions/complete.ts`.
    - W tym pliku zaimplementować funkcję Server Action, np. `completeTrainingSession`, oznaczoną `"use server";`.
      - Akcja ta będzie przyjmować parametry: `plan_id`, `plan_day_name`, `duration_seconds`.
      - Będzie odpowiedzialna za:
        - Pobranie danych użytkownika (z `supabase.auth.getUser()`).
        - Walidację danych wejściowych (np. czy użytkownik ma dostęp do danego `plan_id`).
        - Wstawienie nowego rekordu do tabeli `training_sessions` przy użyciu `supabaseClient`.
    - Zmodyfikować istniejącą akcję usuwania planu (prawdopodobnie w `src/db/actions/training-plans/delete.ts` lub podobnym pliku).
      - Rozszerzyć logikę tej akcji, aby przed usunięciem planu z tabeli `training_plans`, usuwała również wszystkie powiązane rekordy sesji z tabeli `training_sessions` dla danego `plan_id`. Należy to zrobić w ramach tej samej transakcji, jeśli to możliwe, lub zapewnić odporność na błędy.
3.  **Frontend (React/Next.js Components):**
    - **Przycisk "Rozpocznij Sesję":** Dodać przycisk do widoku szczegółów dnia planu. Przycisk powinien być aktywny tylko dla aktywnego planu.
    - **Komponent Widoku Sesji (`WorkoutSessionView`):**
      - Pobiera dane dnia planu (listę ćwiczeń, serii, czasów odpoczynku).
      - Zarządza stanem sesji po stronie klienta (który element jest aktywny, stan timera odpoczynku, całkowity czas trwania sesji).
      - Obsługuje interakcje użytkownika (oznaczanie ukończenia).
      - Implementuje logikę timera odpoczynku i jego wizualizację (animację).
      - Po ukończeniu ostatniego elementu, **wywołuje Server Action `completeTrainingSession`**, przekazując wymagane dane.
      - Obsługuje nawigację po zakończeniu lub przerwaniu sesji (oraz ewentualne błędy zwrócone przez Server Action).
    - **Komponent Widoku Historii (`TrainingHistoryView`):**
      - Prawdopodobnie będzie potrzebował własnej Server Action (np. `getTrainingHistory` w `src/db/actions/training-sessions/list.ts`) do pobrania listy ukończonych sesji dla zalogowanego użytkownika.
      - Wyświetla dane w formacie listy zgodnie z projektem UI.
    - **Routing:** Dodać odpowiednie ścieżki Next.js dla strony/komponentu widoku sesji i widoku historii.

## 6. Ryzyka i Mitygacja

- **Główne Ryzyko:** Wysokie prawdopodobieństwo frustracji użytkownika z powodu **utraty danych sesji** w przypadku jej przerwania przed ukończeniem _ostatniego_ elementu (np. awaria przeglądarki, przypadkowe zamknięcie karty, utrata połączenia, przejście do innej strony). Użytkownik traci cały włożony wysiłek w daną sesję bez możliwości odzyskania.
  - **Mitygacja:** Świadoma **akceptacja** tego ryzyka jako kompromisu na rzecz maksymalnej prostoty implementacji, zgodnie z bezpośrednimi wytycznymi projektowymi. Ta decyzja i jej konsekwencje muszą być jasno zakomunikowane w dokumentacji i potencjalnie w interfejsie użytkownika (np. ostrzeżenie przed rozpoczęciem sesji). Jest to kluczowy element uproszczonego podejścia.
- **Ryzyko Drugorzędne:** Frustracja użytkownika wynikająca z braku możliwości poprawienia przypadkowego kliknięcia oznaczającego ukończenie (brak funkcji "Cofnij").
  - **Mitygacja:** Świadoma **akceptacja** tego ryzyka na rzecz prostoty interfejsu i logiki. Minimalistyczny design zakłada mniejsze prawdopodobieństwo przypadkowych kliknięć, ale nie eliminuje go całkowicie.

## 7. Otwarte Pytania

- **Szczegóły UI/UX:**
  - Jak dokładnie ma wyglądać animacja zakończenia czasu odpoczynku?
  - Jakie konkretne style (Tailwind/Shadcn) zostaną zastosowane w widoku sesji i historii?
  - Czy potrzebne jest dodatkowe ostrzeżenie dla użytkownika o ryzyku utraty danych przed rozpoczęciem sesji?
- **Obsługa Błędów:**
  - Jaki dokładnie komunikat zobaczy użytkownik, jeśli operacja zapisu ostatniego elementu (wywołanie `POST /complete`) nie powiedzie się z przyczyn technicznych (np. błąd sieci, błąd serwera)? Zgodnie z logiką, dane sesji i tak zostaną utracone, ale należy obsłużyć ten przypadek od strony UI.
