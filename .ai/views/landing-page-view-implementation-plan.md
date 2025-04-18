# Plan implementacji widoku Landing Page

## 1. Przegląd

Widok strony głównej (Landing Page) jest pierwszym punktem kontaktu dla potencjalnych użytkowników aplikacji Trenova. Jego głównym celem jest przedstawienie wartości produktu – aplikacji generującej spersonalizowane plany treningowe AI – oraz zachęcenie użytkowników do rejestracji lub logowania. Strona musi być przejrzysta, responsywna (mobile-first) i zgodna z wymaganiami PRD.

## 2. Routing widoku

Widok Landing Page powinien być dostępny pod główną ścieżką aplikacji: `/`

## 3. Struktura komponentów

Struktura będzie oparta na Next.js i React, wykorzystując komponenty z Shadcn/ui oraz stylowanie Tailwind CSS.

```
<HomeLayout> (Layout dla ścieżki '/', src/app/page.tsx lub dedykowany)
  <main> (Główny kontener treści strony)
    <HeroSection />
    <BenefitsSection />
    <FAQSection />
  </main>
</HomeLayout>
```

LandingPageLayout zawiera w sobie komponenty Header i Footer.

HomeLayout zostanie umieszczony w katalogu `src/components/layouts`, a HeroSection i BenefitsSection i FAQSection w `src/components/modules/home`. Header i Footer natomiast w `src/components/layouts/components`

## 4. Szczegóły komponentów

### `Header`

- **Opis komponentu**: Górny pasek nawigacyjny, zazwyczaj widoczny na wielu stronach. Zawiera logo aplikacji oraz przyciski akcji "Zaloguj się" i "Zarejestruj się". Powinien być responsywny.
- **Główne elementy**: Logo (obrazek lub tekst), komponent nawigacyjny (`<nav>`), przyciski (Shadcn/ui `Button`).
- **Obsługiwane interakcje**: Kliknięcie "Zaloguj się" (nawigacja do `/login`), Kliknięcie "Zarejestruj się" (nawigacja do `/register`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak specyficznych typów DTO/ViewModel.
- **Propsy**: Brak (lub ewentualnie dane o stanie zalogowania użytkownika, jeśli ma się zmieniać dynamicznie, ale dla MVP landing page raczej statyczny).

### `HeroSection`

- **Opis komponentu**: Główna sekcja powitalna strony. Zawiera chwytliwy nagłówek (`<h1>`), krótki opis wartości Trenova oraz główny przycisk Call to Action (CTA), np. "Rozpocznij teraz" lub "Zarejestruj się za darmo". Może zawierać element graficzny (tło, ilustracja).
- **Główne elementy**: Nagłówek (`<h1>`), paragrafy tekstu (`<p>`), główny przycisk CTA (Shadcn/ui `Button` z odpowiednim wariantem).
- **Obsługiwane interakcje**: Kliknięcie głównego przycisku CTA (nawigacja do `/register`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak specyficznych typów DTO/ViewModel. Treść statyczna.
- **Propsy**: Brak.

### `BenefitsSection`

- **Opis komponentu**: Sekcja przedstawiająca kluczowe korzyści płynące z używania aplikacji. Powinna odpowiadać na problemy użytkowników zidentyfikowane w PRD (personalizacja, oszczędność czasu, dostępność ekspertyzy, koszt). Może być zrealizowana jako siatka (grid) kart korzyści.
- **Główne elementy**: Nagłówek sekcji (`<h2>`), kontenery dla poszczególnych korzyści (np. `<div>`), każda korzyść zawiera ikonę (opcjonalnie), tytuł (`<h3>` lub `<h4>`) i krótki opis (`<p>`).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `BenefitItem { icon?: React.ReactNode; title: string; description: string; }` (lub podobny interfejs dla danych).
- **Propsy**: `benefits: BenefitItem[]`.

### `FAQSection`

- **Opis komponentu**: Sekcja z najczęściej zadawanymi pytaniami i odpowiedziami. Używa komponentu typu "Accordion" (np. Shadcn/ui `Accordion`), aby domyślnie pokazywać tylko pytania, a odpowiedzi rozwijać po kliknięciu.
- **Główne elementy**: Nagłówek sekcji (`<h2>`), Komponent `Accordion` (Shadcn/ui), zawierający `AccordionItem`, `AccordionTrigger` (pytanie) i `AccordionContent` (odpowiedź) dla każdego FAQ.
- **Obsługiwane interakcje**: Rozwijanie/zwijanie odpowiedzi na pytania (obsługiwane wewnętrznie przez komponent `Accordion`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FAQItem { question: string; answer: string; }`.
- **Propsy**: `faqs: FAQItem[]`.

### `Footer`

- **Opis komponentu**: Stopka strony, znajdująca się na samym dole. Zawiera informacje o prawach autorskich, linki do podstron prawnych (Polityka Prywatności, Regulamin) oraz ewentualnie link do kontaktu/wsparcia.
- **Główne elementy**: Tekst praw autorskich (`<p>`), lista linków (`<ul>`, `<li>`, `<a>` lub Next.js `<Link>`).
- **Obsługiwane interakcje**: Kliknięcie linków (nawigacja do odpowiednich podstron, np. `/privacy-policy`, `/terms-of-service`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `LinkItem { text: string; href: string; }`.
- **Propsy**: `links?: LinkItem[]`.

## 5. Typy

Główne typy potrzebne do implementacji (poza standardowymi typami React/HTML) będą dotyczyć struktury danych dla sekcji dynamicznych lub list:

```typescript
// src/types.ts lub src/components/landing/types.ts

interface BenefitItem {
  icon?: React.ReactNode; // Komponent ikony lub ścieżka do obrazka
  title: string;
  description: string;
}

interface FAQItem {
  question: string;
  answer: string;
  value: string; // Unikalna wartość dla komponentu Accordion Shadcn/ui
}

interface LinkItem {
  text: string;
  href: string;
}

// Typy dla propsów komponentów (przykłady)
interface BenefitsSectionProps {
  benefits: BenefitItem[];
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

interface FooterProps {
  links?: LinkItem[];
  // inne potrzebne propsy, np. rok do copyright
}
```

Nie przewiduje się potrzeby definiowania złożonych DTO ani ViewModeli pobieranych z API dla samego widoku Landing Page w wersji MVP.

## 6. Zarządzanie stanem

Widok Landing Page jest w dużej mierze statyczny. Zarządzanie stanem będzie minimalne:

- Stan wewnętrzny komponentu `FAQSection` (lub komponentu `Accordion` z Shadcn/ui) będzie odpowiedzialny za śledzenie, które elementy FAQ są rozwinięte.
- Nie przewiduje się potrzeby używania globalnego stanu (np. Zustand, Redux) ani kontekstu React dla danych tej strony.
- Nie ma potrzeby tworzenia dedykowanych custom hooków dla logiki tej strony. Nawigacja będzie obsługiwana przez Next.js (`<Link>` lub `useRouter`).

## 7. Integracja API

Landing Page nie wymaga bezpośredniej integracji z API w celu pobierania danych do wyświetlenia treści (treść będzie statyczna w MVP).
Integracja z API występuje pośrednio:

- **Akcje użytkownika (kliknięcia CTA)** inicjują nawigację do stron (`/login`, `/register`), które będą odpowiedzialne za interakcję z API uwierzytelniania Supabase.
- Landing Page nie wysyła ani nie odbiera bezpośrednio danych z API backendu.

## 8. Interakcje użytkownika

- **Kliknięcie "Zaloguj się"**: Użytkownik jest przenoszony na stronę logowania (`/login`). Implementacja: `<Link href="/login">` lub `router.push('/login')` w komponencie `Header`.
- **Kliknięcie "Zarejestruj się" / Główny CTA**: Użytkownik jest przenoszony na stronę rejestracji (`/register`). Implementacja: `<Link href="/register">` lub `router.push('/register')` w komponencie `Header` i `HeroSection`.
- **Kliknięcie pytania w FAQ**: Rozwija/zwija odpowiedź na kliknięte pytanie. Implementacja: Wewnętrzna logika komponentu Shadcn/ui `Accordion`.
- **Kliknięcie linku w stopce**: Użytkownik jest przenoszony do odpowiedniej strony (np. `/privacy-policy`). Implementacja: `<Link href="...">` w komponencie `Footer`.
- **Przewijanie strony**: Użytkownik może przewijać stronę w pionie, aby zobaczyć wszystkie sekcje.
- **Zmiana rozmiaru okna / Orientacji urządzenia**: Layout strony dostosowuje się responsywnie.

## 9. Warunki i walidacja

Landing Page nie zawiera formularzy ani pól wejściowych wymagających walidacji po stronie klienta. Walidacja (np. formatu email, siły hasła) będzie implementowana na dedykowanych stronach `/login` i `/register`.

## 10. Obsługa błędów

Ponieważ strona jest głównie statyczna, główne potencjalne błędy dotyczą renderowania i dostępności:

- **Błędy renderowania React**: Powinny być przechwytywane przez globalny mechanizm Error Boundary w Next.js (np. w głównym `layout.tsx` lub przez dedykowany plik `error.tsx`).
- **Błędy nawigacji**: Standardowe strony błędów Next.js (np. 404 Not Found), jeśli linki prowadzą do nieistniejących ścieżek.
- **Problemy z dostępnością (Accessibility)**: Należy zapewnić semantyczną strukturę HTML (nagłówki, landmarki), odpowiedni kontrast kolorów (zgodnie z WCAG AA), możliwość nawigacji klawiaturą i wsparcie dla czytników ekranu. Testowanie za pomocą narzędzi jak `axe-core`.
- **Problemy z responsywnością**: Layout powinien być testowany na różnych szerokościach ekranu. Użycie Tailwind CSS i jego breakpointów (`sm`, `md`, `lg`, `xl`, `2xl`).

## 11. Kroki implementacji

1.  **Utworzenie struktury plików**:
    - Zdefiniuj potrzebne typy w `src/types.ts` lub `src/components/landing/types.ts`.
2.  **Implementacja `Header`**:
    - Dodaj logo i przyciski "Zaloguj się", "Zarejestruj się" (używając Shadcn/ui `Button`).
    - Dodaj nawigację do `/login` i `/register` za pomocą Next.js `<Link>`.
    - Zapewnij responsywność (np. ukrywanie tekstu przycisków na małych ekranach, menu hamburgerowe - jeśli wymagane w designie).
3.  **Implementacja `HeroSection`**:
    - Dodaj główny nagłówek (`<h1>`), tekst marketingowy i główny przycisk CTA (Shadcn/ui `Button`).
    - Ostyluj sekcję za pomocą Tailwind CSS, dbając o czytelność i atrakcyjność wizualną.
    - Podłącz nawigację CTA do `/register`.
4.  **Implementacja `BenefitsSection`**:
    - Przygotuj dane (tablicę `BenefitItem[]`) – na razie mogą być zahardkodowane.
    - Wyświetl listę korzyści, mapując dane do komponentów podrzędnych (np. `BenefitCard`).
    - Użyj Tailwind CSS do stworzenia layoutu (np. flexbox, grid) i stylizacji. Rozważ użycie ikon.
5.  **Implementacja `FAQSection`**:
    - Przygotuj dane (tablicę `FAQItem[]`) – zahardkodowane. Pamiętaj o unikalnym `value` dla każdego elementu.
    - Użyj komponentu Shadcn/ui `Accordion` do wyświetlenia pytań i odpowiedzi.
    - Ostyluj sekcję i komponent Accordion zgodnie z designem.
6.  **Implementacja `Footer`**:
    - Dodaj tekst praw autorskich.
    - Dodaj linki do stron prawnych (np. `/privacy-policy`, `/terms-of-service`) używając Next.js `<Link>`. Utwórz te strony, nawet jeśli są puste na początku.
    - Ostyluj stopkę.
7.  **Złożenie widoku w `src/app/page.tsx`**:
    - Zaimportuj i użyj stworzonych komponentów (`Header`, `HeroSection`, `BenefitsSection`, `FAQSection`, `Footer`) w odpowiedniej kolejności.
    - Przekaż potrzebne propsy (dane dla `BenefitsSection`, `FAQSection`, `Footer`).
8.  **Styling i Responsywność**:
    - Przejrzyj wszystkie komponenty i całą stronę, dopracowując style za pomocą Tailwind CSS.
    - Dokładnie przetestuj responsywność na różnych urządzeniach/szerokościach ekranu (mobile-first).
9.  **Dostępność (Accessibility)**:
    - Sprawdź semantykę HTML.
    - Przetestuj kontrast kolorów.
    - Sprawdź nawigację klawiaturą.
10. **Review i Refaktoryzacja**: Przejrzyj kod pod kątem czystości, zgodności z wytycznymi projektu i potencjalnych ulepszeń.
