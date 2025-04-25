# Aplikacja - Trenova (MVP)

## Główny problem

Użytkownicy często mają trudność ze stworzeniem spersonalizowanego planu treningowego, który uwzględniałby ich indywidualne cele, poziom zaawansowania, dostępny sprzęt, ograniczenia czasowe i ewentualne dolegliwości. Istniejące gotowe plany są zbyt generyczne, a zatrudnienie personalnego trenera bywa kosztowne lub logistycznie trudne. Brakuje prostego narzędzia, które na podstawie kluczowych informacji szybko wygeneruje sensowny i dopasowany plan startowy.

## Najmniejszy zestaw funkcjonalności

1. Uwierzytelnianie użytkownika:

- Rejestracja: Prosty formularz (adres e-mail, hasło).

- Logowanie: Formularz logowania (e-mail, hasło). (Bez logowania przez media społecznościowe na tym etapie).

2. Formularz:

- Formularz zbierający kluczowe dane _do wygenerowania bieżącego planu_ (dane te nie są trwale zapisywane jako profil użytkownika):

  - Cel główny: (np. Redukcja masy ciała, Budowa masy mięśniowej, Poprawa kondycji ogólnej, Zwiększenie siły - wybór z predefiniowanej listy).

  - Poziom doświadczenia: (np. Początkujący [nigdy/rzadko trenowałem], Średniozaawansowany [trenuję nieregularnie/z przerwami], Zaawansowany [trenuję regularnie od dłuższego czasu] - wybór z listy).

  - Dostępność czasowa: Ile dni w tygodniu użytkownik chce/może trenować (np. 2, 3, 4, 5 dni - wybór z listy).

  - Preferowana długość sesji: (np. 30-45 minut, 45-60 minut, 60-90 minut - wybór z listy).

  - Dostęp do sprzętu: (np. Brak sprzętu [trening w domu], Podstawowy sprzęt w domu [np. hantle, gumy oporowe], Pełna siłownia - wybór z listy).

  - Ograniczenia/Dolegliwości: Proste pole tekstowe z wyraźnym zastrzeżeniem (disclaimer), że aplikacja nie zastępuje porady lekarskiej/fizjoterapeutycznej i w przypadku poważnych problemów należy skonsultować się ze specjalistą. Na tym etapie AI może po prostu unikać pewnych ćwiczeń lub sugerować ostrożność.

  - Płeć: (Może wpływać na pewne sugestie lub normy).

3. Generowanie planu treningowego przez AI:

- Na podstawie danych z formularza _wypełnionego w bieżącej sesji_, system generuje jeden podstawowy plan treningowy.
- Plan zawiera również krótki, AI-generowany opis wyjaśniający jego założenia, cel i potencjalne korzyści.
- Format planu: Prosta lista ćwiczeń na poszczególne dni treningowe, zawierająca:

  - Nazwę ćwiczenia.

  - Sugerowaną liczbę serii.

  - Sugerowaną liczbę powtórzeń (lub czas trwania dla ćwiczeń izometrycznych/cardio).

  - Sugerowany czas odpoczynku między seriami.

4. Zarządzanie planami:

- **Przeglądanie**: Możliwość wyświetlenia wygenerowanego planu treningowego w czytelnej formie (np. podział na dni treningowe, wyświetlenie opisu planu). Użytkownik może mieć w systemie zapisanych kilka planów. Lista zapisanych planów.

- **Edycja (minimalna)**: Możliwość zmiany nazwy planu (np. "Mój plan na masę - Marzec"). Na tym etapie MVP nie zakładamy edycji poszczególnych ćwiczeń, serii czy powtórzeń w ramach wygenerowanego planu, aby nie komplikować logiki i interakcji z AI.

## Co NIE wchodzi w zakres MVP

- Śledzenie postępów (wpisywanie ciężarów, powtórzeń, ukończonych treningów).

- Biblioteka ćwiczeń z filmami instruktażowymi czy opisami techniki.

- Funkcje społecznościowe (udostępnianie planów, rankingi, grupy).

- Planowanie diety i śledzenie kalorii.

- Integracja z urządzeniami wearables (zegarki, opaski fitness).

- Zaawansowane funkcje AI (np. adaptacyjne zmiany planu w oparciu o feedback, analiza techniki przez kamerę).

- Gamifikacja (odznaki, punkty, wyzwania).

- Tryb offline.

- Płatności, subskrypcje, wersje premium.

- Rozbudowana edycja planu (zmiana ćwiczeń, dodawanie własnych, modyfikacja parametrów).

- Powiadomienia push przypominające o treningu.

## Kryteria sukcesu

- **Ukończenie procesu**: Użytkownicy są w stanie pomyślnie przejść proces od rejestracji, przez wypełnienie formularza _generowania planu_, aż po wygenerowanie i wyświetlenie swojego pierwszego planu treningowego.

- **Trafność generowanych planów**: Pierwsze opinie użytkowników (np. z krótkiej ankiety po wygenerowaniu planu) wskazują, że wygenerowany plan jest postrzegany jako sensowny i dopasowany do ich danych wejściowych (nawet jeśli wymagałby drobnych korekt w przyszłości).

- **Podstawowe zaangażowanie**: Pewien procent zarejestrowanych użytkowników generuje co najmniej jeden plan treningowy.

- **Walidacja techniczna**: Aplikacja działa stabilnie, proces generowania planu jest wystarczająco szybki.

- **Zebranie feedbacku**: Zbieranie pierwszych opinii i sugestii od użytkowników MVP, które posłużą do planowania rozwoju kolejnych wersji aplikacji i weryfikacji, czy podstawowa koncepcja (automatyczne generowanie planów) jest wartościowa dla użytkowników.
