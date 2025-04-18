# Dokument wymagań produktu (PRD) - Trenova

## 1. Przegląd produktu

Trenova to aplikacja webowa oferująca automatyczne generowanie spersonalizowanych planów treningowych przy pomocy sztucznej inteligencji. Produkt jest skierowany głównie do osób początkujących i średniozaawansowanych, które potrzebują profesjonalnie przygotowanego programu treningowego, ale nie chcą lub nie mogą korzystać z usług osobistego trenera.

Główne funkcjonalności MVP obejmują:

- Rejestrację i logowanie użytkowników
- Formularz zbierający dane treningowe (cele, doświadczenie, dostępność czasową, sprzęt, ograniczenia zdrowotne)
- Generowanie planu treningowego przez AI na podstawie danych z formularza
- Przeglądanie i podstawowe zarządzanie wygenerowanymi planami
- Wsparcie techniczne przez e-mail

Aplikacja będzie dostępna wyłącznie w języku angielskim, z architekturą umożliwiającą łatwe dodanie innych języków w przyszłości. Trenova przyjmuje podejście mobile-first i będzie w pełni responsywna.

## 2. Problem użytkownika

Użytkownicy często mają trudność ze stworzeniem spersonalizowanego planu treningowego, który uwzględniałby ich indywidualne potrzeby:

- Cele treningowe (np. redukcja masy ciała, budowa masy mięśniowej)
- Poziom zaawansowania
- Dostępny sprzęt
- Ograniczenia czasowe
- Ewentualne dolegliwości lub ograniczenia zdrowotne

Istniejące rozwiązania na rynku mają następujące wady:

- Gotowe plany treningowe są zbyt generyczne i nie uwzględniają indywidualnych potrzeb
- Zatrudnienie personalnego trenera jest kosztowne i często logistycznie trudne
- Brak prostego narzędzia, które szybko wygeneruje sensowny, dostosowany plan startowy

Główne motywacje użytkowników Trenova to:

- Wygoda i oszczędność czasu
- Brak wystarczającej wiedzy do samodzielnego tworzenia planów
- Potrzeba personalizacji
- Niższy koszt w porównaniu do trenera personalnego

## 3. Wymagania funkcjonalne

### 3.1. Uwierzytelnianie użytkownika

- Rejestracja użytkownika z wymaganiem podania adresu e-mail i hasła
- Logowanie przy użyciu adresu e-mail i hasła
- Bezpieczna komunikacja z wykorzystaniem HTTPS
- Implementacja uwierzytelniania przez Supabase
- Walidacja danych po stronie frontendu i backendu

### 3.2. Formularz danych treningowych

- Zbieranie następujących danych od użytkownika:
  - Cel główny (wybór z predefiniowanej listy)
  - Poziom doświadczenia (wybór z predefiniowanej listy)
  - Dostępność czasowa (liczba dni treningowych w tygodniu)
  - Preferowana długość sesji treningowej
  - Dostęp do sprzętu
  - Ograniczenia/dolegliwości (wybór z predefiniowanej listy)
  - Płeć
- Możliwość edycji wprowadzonych danych
- Przechowywanie ostatnich wprowadzonych danych

### 3.3. Generowanie planu treningowego

- Wykorzystanie AI do tworzenia planu na podstawie danych z formularza
- Generowanie planu zawierającego:
  - Nazwę ćwiczenia
  - Sugerowaną liczbę serii
  - Sugerowaną liczbę powtórzeń lub czas trwania
  - Sugerowany czas odpoczynku między seriami
- Możliwość generowania nieograniczonej liczby planów

### 3.4. Zarządzanie planami treningowymi

- Wyświetlanie listy zapisanych planów treningowych
- Przeglądanie szczegółów planu treningowego z podziałem na dni treningowe
- Możliwość zmiany nazwy planu
- Możliwość usunięcia planu

### 3.5. Wsparcie użytkownika

- Sekcja FAQ i porad w aplikacji
- Mikro-podpowiedzi w interfejsie użytkownika
- Wsparcie techniczne przez e-mail
- Możliwość zgłoszenia żądania usunięcia konta i danych

### 3.6. Wymagania techniczne

- Responsywny design (mobile-first)
- Szybkie ładowanie i płynne działanie
- Czas odpowiedzi API (poza generowaniem planu) poniżej 1-2 sekund
- Monitoring błędów (Sentry/GlitchTip)
- Analityka użytkownika (Google Analytics)
- Zgodność z RODO

## 4. Granice produktu

Poniższe funkcje NIE są uwzględnione w MVP:

- Śledzenie postępów (wpisywanie ciężarów, powtórzeń, ukończonych treningów)
- Biblioteka ćwiczeń z filmami instruktażowymi czy opisami techniki
- Funkcje społecznościowe (udostępnianie planów, rankingi, grupy)
- Planowanie diety i śledzenie kalorii
- Integracja z urządzeniami wearables (zegarki, opaski fitness)
- Zaawansowane funkcje AI (adaptacyjne zmiany planu w oparciu o feedback, analiza techniki)
- Gamifikacja (odznaki, punkty, wyzwania)
- Tryb offline
- Płatności, subskrypcje, wersje premium
- Rozbudowana edycja planu (zmiana ćwiczeń, dodawanie własnych, modyfikacja parametrów)
- Powiadomienia push przypominające o treningu
- Eksport planu poza aplikację
- Historia zmian planów/formularzy
- Logowanie przez media społecznościowe

## 5. Historyjki użytkowników

### Rejestracja i logowanie

US-001: Rejestracja nowego użytkownika

- Jako nowy użytkownik, chcę zarejestrować się w aplikacji, aby móc korzystać z jej funkcjonalności.
- Kryteria akceptacji:
  - Użytkownik może wprowadzić adres e-mail i hasło
  - System waliduje format adresu e-mail i siłę hasła
  - Użytkownik otrzymuje potwierdzenie udanej rejestracji
  - W przypadku błędu system wyświetla odpowiedni komunikat

US-002: Logowanie do aplikacji

- Jako zarejestrowany użytkownik, chcę zalogować się do aplikacji, aby uzyskać dostęp do moich danych i planów.
- Kryteria akceptacji:
  - Użytkownik może wprowadzić swój adres e-mail i hasło
  - System weryfikuje poprawność danych
  - Po udanym logowaniu użytkownik jest przekierowany do głównego widoku aplikacji
  - W przypadku błędnych danych system wyświetla odpowiedni komunikat

US-003: Wylogowanie z aplikacji

- Jako zalogowany użytkownik, chcę wylogować się z aplikacji, aby zabezpieczyć swoje konto przed nieautoryzowanym dostępem.
- Kryteria akceptacji:
  - Użytkownik może kliknąć przycisk wylogowania
  - Po wylogowaniu sesja użytkownika jest zakończona
  - Użytkownik jest przekierowany do strony logowania

### Formularz danych treningowych

US-004: Wypełnienie formularza danych treningowych

- Jako zalogowany użytkownik, chcę wypełnić formularz z moimi danymi treningowymi, aby wygenerować spersonalizowany plan.
- Kryteria akceptacji:
  - Formularz zawiera wszystkie wymagane pola (cel, poziom, dostępność czasowa, długość sesji, sprzęt, ograniczenia, płeć)
  - Wszystkie pola oferują predefiniowane opcje do wyboru
  - System zapisuje wprowadzone dane
  - Użytkownik może przejść do generowania planu po wypełnieniu wszystkich wymaganych pól

US-005: Edycja danych formularza

- Jako zalogowany użytkownik, chcę edytować moje wcześniej wprowadzone dane treningowe, aby dostosować je do zmieniających się okoliczności.
- Kryteria akceptacji:
  - Formularz wyświetla ostatnio wprowadzone dane
  - Użytkownik może zmienić dowolne pole
  - System zapisuje zaktualizowane dane
  - Użytkownik może wygenerować nowy plan na podstawie zaktualizowanych danych

### Generowanie i zarządzanie planami

US-006: Generowanie planu treningowego

- Jako zalogowany użytkownik, chcę wygenerować plan treningowy na podstawie moich danych, aby otrzymać spersonalizowany program ćwiczeń.
- Kryteria akceptacji:
  - System wykorzystuje AI do generowania planu na podstawie danych z formularza
  - Podczas generowania system wyświetla informację o postępie
  - Wygenerowany plan zawiera wszystkie wymagane elementy (nazwy ćwiczeń, serie, powtórzenia, czas odpoczynku)
  - Po wygenerowaniu plan jest zapisywany i wyświetlany użytkownikowi

US-007: Przeglądanie listy planów

- Jako zalogowany użytkownik, chcę przeglądać listę moich zapisanych planów treningowych, aby mieć do nich łatwy dostęp.
- Kryteria akceptacji:
  - System wyświetla listę wszystkich planów użytkownika
  - Lista zawiera nazwę każdego planu i datę utworzenia
  - Użytkownik może wybrać plan z listy, aby zobaczyć jego szczegóły

US-008: Przeglądanie szczegółów planu

- Jako zalogowany użytkownik, chcę przeglądać szczegóły mojego planu treningowego, aby wiedzieć, jakie ćwiczenia wykonywać.
- Kryteria akceptacji:
  - System wyświetla plan z podziałem na dni treningowe
  - Dla każdego ćwiczenia wyświetlane są: nazwa, liczba serii, powtórzeń i czas odpoczynku
  - Interfejs jest czytelny i łatwy w nawigacji

US-009: Zmiana nazwy planu

- Jako zalogowany użytkownik, chcę zmienić nazwę mojego planu treningowego, aby lepiej go zidentyfikować.
- Kryteria akceptacji:
  - Użytkownik może edytować nazwę planu
  - System zapisuje zaktualizowaną nazwę
  - Po zapisaniu lista planów wyświetla zaktualizowaną nazwę

US-010: Usunięcie planu

- Jako zalogowany użytkownik, chcę usunąć niepotrzebny plan treningowy, aby utrzymać porządek w moich planach.
- Kryteria akceptacji:
  - Użytkownik może wybrać opcję usunięcia planu
  - System prosi o potwierdzenie przed usunięciem
  - Po potwierdzeniu plan jest usuwany z systemu i znika z listy planów

### Wsparcie użytkownika

US-011: Przeglądanie FAQ i porad

- Jako użytkownik, chcę przeglądać sekcję FAQ i porady, aby znaleźć odpowiedzi na moje pytania i poprawić swoje doświadczenie treningowe.
- Kryteria akceptacji:
  - System udostępnia sekcję FAQ z odpowiedziami na najczęstsze pytania
  - System wyświetla porady dotyczące treningów i korzystania z aplikacji
  - Informacje są zorganizowane w czytelny i przystępny sposób

US-012: Kontakt ze wsparciem technicznym

- Jako użytkownik, chcę skontaktować się ze wsparciem technicznym, aby zgłosić problem lub zadać pytanie.
- Kryteria akceptacji:
  - System udostępnia formularz kontaktowy lub adres e-mail wsparcia
  - Użytkownik może wysłać wiadomość z opisem problemu
  - System potwierdza otrzymanie zgłoszenia

US-013: Usunięcie konta

- Jako użytkownik, chcę mieć możliwość usunięcia mojego konta i danych, aby zachować kontrolę nad moimi informacjami.
- Kryteria akceptacji:
  - System udostępnia formularz na dedykowanej stronie ustawień umożliwiający usunięcie konta
  - Usunięcie konta wymaga potwierdzenia
  - Po wyrażeniu chęci usunięcia konta i potwierdzeniu wszystkie dane użytkownika są usuwane z systemu
  - Użytkownik otrzymuje potwierdzenie usunięcia konta

### Scenariusze brzegowe

US-014: Obsługa błędów w formularzu

- Jako użytkownik, chcę otrzymywać jasne komunikaty o błędach w formularzu, aby móc je poprawić.
- Kryteria akceptacji:
  - System waliduje dane wprowadzone przez użytkownika
  - W przypadku błędów system wyświetla konkretne komunikaty przy odpowiednich polach
  - Użytkownik może poprawić błędy i kontynuować

US-015: Obsługa błędów generowania planu

- Jako użytkownik, chcę być poinformowany o problemach z generowaniem planu, aby wiedzieć, co się dzieje.
- Kryteria akceptacji:
  - W przypadku błędu podczas generowania planu system wyświetla zrozumiały komunikat
  - System oferuje opcję ponownej próby
  - Użytkownik może wrócić do formularza, aby zmodyfikować dane

US-016: Odzyskiwanie hasła

- Jako użytkownik, który zapomniał hasła, chcę mieć możliwość jego zresetowania, aby odzyskać dostęp do konta.
- Kryteria akceptacji:
  - System udostępnia funkcję "Zapomniałem hasła" na stronie logowania
  - Użytkownik może wprowadzić swój adres e-mail
  - System wysyła link do resetowania hasła na podany adres
  - Użytkownik może ustawić nowe hasło po kliknięciu w link

## 6. Metryki sukcesu

### Metryki ukończenia procesu

- Współczynnik konwersji: Procent użytkowników, którzy przechodzą cały proces od rejestracji do wygenerowania planu
- Czas ukończenia: Średni czas potrzebny na przejście przez cały proces
- Współczynnik porzuceń: Procent użytkowników, którzy rozpoczynają, ale nie kończą generowania planu

### Metryki trafności planów

- Satysfakcja użytkownika: Wyniki ankiety po wygenerowaniu planu (skala 1-5)
- Ocena dopasowania: Procent użytkowników, którzy oceniają plan jako dobrze dopasowany do ich potrzeb
- Wskaźnik ponownego generowania: Procent użytkowników, którzy generują nowy plan po pierwszym

### Metryki zaangażowania

- Liczba wygenerowanych planów na użytkownika
- Procent zarejestrowanych użytkowników, którzy generują co najmniej jeden plan
- Częstotliwość powrotów: Jak często użytkownicy wracają do aplikacji

### Metryki techniczne

- Czas odpowiedzi API (poza generowaniem planu): Cel poniżej 1-2 sekund
- Stabilność aplikacji: Liczba błędów na 1000 sesji
- Czas generowania planu: Średni czas potrzebny na wygenerowanie planu

### Metryki feedbacku

- Liczba otrzymanych opinii i sugestii
- Wskaźnik NPS (Net Promoter Score)
- Jakościowa analiza zgłaszanych problemów i sugestii
