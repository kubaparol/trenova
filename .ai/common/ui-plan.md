# Architektura UI dla Trenova

## 1. Przegląd struktury UI

Trenova to aplikacja webowa oferująca automatyczne generowanie spersonalizowanych planów treningowych przy pomocy sztucznej inteligencji. Struktura interfejsu użytkownika jest podzielona na dwie główne części:

1. **Obszar publiczny** - dostępny dla niezalogowanych użytkowników:

   - Strona główna (landing page)
   - Formularz rejestracji
   - Formularz logowania
   - Proces odzyskiwania hasła
   - Sekcja FAQ
   - Formularz kontaktowy

2. **Obszar prywatny** - dostępny dla zalogowanych użytkowników:
   - Nawigacja główna (górny pasek)
   - Lista planów treningowych
   - Szczegóły planu treningowego
   - Formularz danych treningowych
   - Ekran generowania planu treningowego
   - Profil użytkownika / preferencje treningowe
   - Zarządzanie kontem

Architektura UI opiera się na następujących zasadach:

- Mobile-first responsive design
- Logiczny i intuicyjny przepływ
- Dostępność zgodna ze standardami WCAG
- Spójny system komponentów (oparty na Shadcn/ui)
- Minimalistyczny interfejs z jasną hierarchią informacji
- Toast notifications dla informacji zwrotnych
- Skeleton screens podczas ładowania zawartości

## 2. Lista widoków

### 2.1. Strona główna (landing page)

- **Ścieżka**: `/`
- **Główny cel**: Przedstawić wartość produktu i zachęcić do rejestracji
- **Kluczowe informacje**:
  - Nagłówek i opis produktu
  - Główne korzyści z korzystania z aplikacji
  - Przyciski CTA (rejestracja, logowanie)
- **Kluczowe komponenty**:
  - Header z logo i przyciskami akcji
  - Sekcja hero z głównym CTA
  - Sekcje korzyści
  - FAQ (zwinięty)
  - Stopka z linkami
- **UX i dostępność**:
  - Wyraźna hierarchia treści
  - Dostępne przyciski CTA z odpowiednim kontrastem
  - Semantyczna struktura HTML dla czytników ekranu

### 2.2. Rejestracja

- **Ścieżka**: `/auth/signup`
- **Główny cel**: Umożliwić utworzenie nowego konta
- **Kluczowe informacje**:
  - Formularz rejestracji
  - Informacje o wymaganiach dotyczących hasła
  - Link do logowania
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Wskaźnik siły hasła
  - Przyciski akcji
- **UX i dostępność**:
  - Informacje o błędach dostępne dla czytników ekranu
  - Walidacja pól formularza z jasnymi komunikatami
  - Zrozumiałe etykiety formularza
  - Zabezpieczenia CSRF
  - Weryfikacja captcha (opcjonalnie)

### 2.3. Logowanie

- **Ścieżka**: `/auth/login`
- **Główny cel**: Umożliwić zalogowanie się istniejącym użytkownikom
- **Kluczowe informacje**:
  - Formularz logowania
  - Link do odzyskiwania hasła
  - Link do rejestracji
- **Kluczowe komponenty**:
  - Prosty formularz z walidacją
  - Przyciski akcji
- **UX i dostępność**:
  - Jednoznaczna informacja zwrotna o błędach
  - Możliwość pokazania/ukrycia hasła
  - Dostępne etykiety formularza

### 2.4. Odzyskiwanie hasła (4 ekrany)

- **Ścieżka**: `/auth/forgot-password`, `/auth/reset-password-sent`, `/auth/reset-password`, `/auth/reset-password-success`
- **Główny cel**: Umożliwić odzyskanie dostępu do konta
- **Kluczowe informacje**:
  - Formularz wprowadzania adresu email
  - Potwierdzenie wysłania linku
  - Formularz ustawiania nowego hasła
  - Potwierdzenie zmiany hasła
- **Kluczowe komponenty**:
  - Formularze z walidacją
  - Komunikaty informacyjne
  - Przyciski akcji
- **UX i dostępność**:
  - Jasne komunikaty o statusie
  - Prowadzenie przez proces krok po kroku
  - Walidacja hasła z jasnymi wskazówkami

### 2.5. Lista planów treningowych

- **Ścieżka**: `/training-plans`
- **Główny cel**: Wyświetlić zapisane plany treningowe użytkownika
- **Kluczowe informacje**:
  - Lista planów z datą utworzenia
  - Przyciski akcji dla każdego planu
  - Stan pusty, gdy brak planów
- **Kluczowe komponenty**:
  - Karty planów treningowych
  - Pływający przycisk (FAB) do generowania nowego planu
  - Stan pusty (empty state) z CTA
  - Paginacja (jeśli potrzebna)
- **UX i dostępność**:
  - Jasne oznaczenie każdej karty planu
  - Możliwość nawigacji klawiaturą
  - Skeleton screens podczas ładowania

### 2.6. Szczegóły planu treningowego

- **Ścieżka**: `/training-plans/[id]`
- **Główny cel**: Wyświetlić szczegóły konkretnego planu treningowego
- **Kluczowe informacje**:
  - Nazwa planu
  - Plany treningowe podzielone na dni
  - Listy ćwiczeń dla każdego dnia
  - Dane o powtórzeniach, seriach i czasie odpoczynku
- **Kluczowe komponenty**:
  - Akordeony dla dni treningowych
  - Listy ćwiczeń
  - Przyciski akcji (zmiana nazwy, usunięcie)
- **UX i dostępność**:
  - Przejrzysta prezentacja danych
  - Responsywny układ (pionowy na mobile)
  - Czytelna typografia
  - Dostępne akordeony i przyciski

### 2.7. Formularz danych treningowych

- **Ścieżka**: `/training-plans/create`
- **Główny cel**: Zebrać dane do generowania planu treningowego i pokazać proces generowania
- **Kluczowe informacje**:
  - Sekcje formularza dla różnych kategorii danych
  - Wyjaśnienia i opisy pól
  - Stan ładowania/generowania po wysłaniu formularza
- **Kluczowe komponenty**:
  - Formularz podzielony na sekcje tematyczne
  - Selekty, radio buttony, slidery
  - Przycisk akcji "Generuj plan"
  - Komponent wskaźnika generowania (widoczny po wysłaniu)
- **UX i dostępność**:
  - Jasne etykiety dla wszystkich pól
  - Logiczne grupowanie pól
  - Walidacja z jasnymi komunikatami
  - Dostępne pola formularza
  - Wyraźna informacja o statusie generowania (np. wskaźnik postępu, komunikat)

### 2.8. Ustawienia konta

- **Ścieżka**: `/settings`
- **Główny cel**: Umożliwić zarządzanie kontem użytkownika, w tym jego usunięcie oraz zmiana hasł.
- **Kluczowe informacje**:
  - Sekcja zarządzania kontem:
    - Opcja zmiany hasła
    - Opcja usunięcia konta
  - Proces zmiany hasła:
    - Pola do aktualnego hasła, nowego oraz potwierdzenie nowego
    - Przycisk wysyłający formularz
  - Proces usuwania konta:
    - Przycisk "Usuń konto"
    - Modal potwierdzający z polem tekstowym do wpisania frazy potwierdzającej (np. "USUŃ KONTO")
- **Kluczowe komponenty**:
  - Sekcja ustawień konta
  - Przycisk "Usuń konto" (Destructive action)
  - Modal potwierdzający z inputem tekstowym
- **UX i dostępność**:
  - Czytelny podział sekcji zarządzania kontem
  - Wyraźne ostrzeżenie w modalu przed nieodwracalną akcją usunięcia konta
  - Dostępne przyciski i pola formularza w modalu

### 2.9. FAQ

- **Ścieżka**: `/faq`
- **Główny cel**: Dostarczyć odpowiedzi na najczęstsze pytania
- **Kluczowe informacje**:
  - Pytania i odpowiedzi pogrupowane tematycznie
- **Kluczowe komponenty**:
  - Akordeony z pytaniami i odpowiedziami
- **UX i dostępność**:
  - Dostępne akordeony
  - Łatwa nawigacja między sekcjami
  - Możliwość wyszukiwania (opcjonalnie)

### 2.10. Formularz kontaktowy

- **Ścieżka**: `/contact`
- **Główny cel**: Umożliwić kontakt ze wsparciem technicznym
- **Kluczowe informacje**:
  - Formularz z polami na imię, e-mail, temat i wiadomość
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Przyciski akcji
- **UX i dostępność**:
  - Jasne komunikaty o sukcesie/błędzie
  - Dostępne pola formularza

## 3. Mapa podróży użytkownika

### 3.1. Rejestracja i pierwsze generowanie planu

1. Użytkownik trafia na stronę główną
2. Klika przycisk "Zarejestruj się"
3. Wypełnia formularz rejestracji i zatwierdza
4. Po udanej rejestracji, jest przekierowywany do formularza danych treningowych (`/training-plans/create`)
5. Wypełnia formularz danych treningowych i klika "Generuj plan"
6. W widoku formularza pojawia się stan ładowania/generowania planu
7. Po zakończeniu generowania, zostaje przekierowany do widoku szczegółów nowo utworzonego planu (`/training-plans/[id]`)

### 3.2. Logowanie i przeglądanie planów

1. Użytkownik trafia na stronę główną
2. Klika przycisk "Zaloguj się"
3. Wprowadza dane logowania i zatwierdza
4. Zostaje przekierowany do listy planów treningowych
5. Klika na wybrany plan, aby zobaczyć szczegóły
6. Przegląda plan treningowy podzielony na dni

### 3.3. Generowanie nowego planu

1. Zalogowany użytkownik znajduje się na liście planów
2. Klika pływający przycisk "Nowy plan"
3. Zostaje przekierowany do formularza danych treningowych (`/training-plans/create`)
4. Wypełnia lub modyfikuje dane i klika "Generuj plan"
5. W widoku formularza pojawia się stan ładowania/generowania planu
6. Po zakończeniu generowania, zostaje przekierowany do widoku szczegółów nowo utworzonego planu (`/training-plans/[id]`)

### 3.4. Zmiana nazwy planu

1. Użytkownik przegląda szczegóły planu
2. Klika przycisk "Zmień nazwę"
3. Wprowadza nową nazwę w modal'u
4. Zatwierdza zmianę
5. Zostaje w widoku szczegółów planu z zaktualizowaną nazwą

### 3.5. Usunięcie planu

1. Użytkownik przegląda szczegóły planu
2. Klika przycisk "Usuń plan"
3. Potwierdza chęć usunięcia w modal'u
4. Zostaje przekierowany do listy planów treningowych

### 3.6. Odzyskiwanie hasła

1. Użytkownik na ekranie logowania klika "Zapomniałem hasła"
2. Wprowadza adres e-mail i zatwierdza
3. Zostaje przekierowany do ekranu potwierdzenia wysłania linku
4. Klika link w otrzymanym e-mailu
5. Zostaje przekierowany do formularza resetowania hasła
6. Wprowadza nowe hasło i zatwierdza
7. Zostaje przekierowany do ekranu potwierdzenia zmiany hasła
8. Klika przycisk "Zaloguj się" i przechodzi do ekranu logowania

### 3.8. Zmiana hasła

1. Zalogowany użytkownik przechodzi do strony Ustawienia (`/settings`).
2. W sekcji zarządzania kontem wybiera opcję "Zmień hasło".
3. System wyświetla formularz zmiany hasła z trzema polami:
   - Aktualne hasło
   - Nowe hasło
   - Potwierdzenie nowego hasła
4. Użytkownik uzupełnia formularz, wpisując swoje aktualne hasło oraz nową wartość (w obu polach nowego hasła).
5. Po zatwierdzeniu formularza system waliduje:
   a. Poprawność aktualnego hasła.
   b. Zgodność nowego hasła i jego potwierdzenia.
6. W przypadku wykrycia błędów system wyświetla odpowiednie komunikaty, umożliwiające korektę danych.
7. Po poprawnej walidacji system aktualizuje hasło użytkownika.
8. Użytkownik otrzymuje potwierdzenie zmiany hasła i pozostaje zalogowany na stronie ustawień.

## 4. Układ i struktura nawigacji

### 4.1. Nawigacja dla niezalogowanych użytkowników

- **Górny pasek (header)** zawiera:
  - Logo aplikacji (link do strony głównej)
  - Przycisk "Zaloguj się"
  - Przycisk "Zarejestruj się"
- **Stopka (footer)** zawiera:
  - Link do FAQ
  - Link do formularza kontaktowego
  - Informacje prawne

### 4.2. Nawigacja dla zalogowanych użytkowników

- **Górny pasek (header)** zawiera:
  - Logo aplikacji (link do listy planów)
  - Link do listy planów
  - Link do Ustawień (`/settings`)
  - Przycisk wylogowania
- **Pływający przycisk akcji (FAB)** dla kluczowej akcji "Nowy plan" widoczny na ekranie listy planów
- **Nawigacja kontekstowa** w widoku szczegółów planu:
  - Przycisk powrotu do listy planów
  - Przyciski akcji dla konkretnego planu

## 5. Kluczowe komponenty

### 5.1. Layout

- **RootLayout**: Bazowy układ dla całej aplikacji, zawiera globalny kontekst
- **AuthLayout**: Układ dla stron autoryzacji, z uproszczonym headerem
- **AppLayout**: Układ dla zalogowanych użytkowników, z pełnym headerem
- **Toast Container**: System powiadomień typu toast, obecny w całej aplikacji

### 5.2. Komponenty interfejsu

- **Card**: Karta używana do prezentacji planów treningowych
- **Accordion**: Używany do prezentacji dni treningowych i FAQ
- **Form**: Komponenty formularza z walidacją
- **Button**: Przyciski z różnymi wariantami (Primary, Secondary, Destructive)
- **Modal**: Używany do potwierdzenia akcji i drobnych formularzy
- **Skeleton**: Stosowany podczas ładowania treści
- **Toast**: Powiadomienia o sukcesie, błędzie, informacji
- **FAB (Floating Action Button)**: Pływający przycisk akcji
- **EmptyState**: Komponent dla pustych list i kolekcji

### 5.3. Komponenty funkcjonalne

- **AuthGuard**: Zabezpiecza prywatne ścieżki
- **FormProvider**: Dostarcza kontekst dla formularzy
- **ErrorBoundary**: Przechwytuje i obsługuje błędy UI
- **LoadingIndicator**: Wskaźnik ładowania dla różnych sytuacji
- **ConfirmDialog**: Komponent do potwierdzania krytycznych akcji

### 5.4. Komponenty specyficzne dla aplikacji

- **TrainingPlanCard**: Karta planu treningowego
- **ExerciseItem**: Prezentacja pojedynczego ćwiczenia
- **DayAccordion**: Akordeon dnia treningowego
- **PreferencesForm**: Formularz preferencji treningowych
- **PlanGenerationIndicator**: Wskaźnik postępu/stanu generowania planu (używany w widoku formularza po wysłaniu)
