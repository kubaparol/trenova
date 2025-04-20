# Plan implementacji widoku Szczegółów Planu Treningowego

## 1. Przegląd

Widok Szczegółów Planu Treningowego (`/training-plans/[id]`) ma na celu wyświetlenie pełnych informacji o konkretnym planie treningowym wybranym przez użytkownika. Prezentuje nazwę planu oraz szczegółowy podział na dni treningowe, wraz z listą ćwiczeń, liczbą serii, powtórzeń (lub czasem trwania) i czasem odpoczynku dla każdego ćwiczenia. Widok musi być responsywny i zapewniać czytelność oraz łatwość nawigacji, zgodnie z User Story US-008. Dane do widoku będą pobierane za pomocą serwerowej akcji `getTrainingPlanById`.

## 2. Routing widoku

Widok będzie dostępny pod dynamiczną ścieżką: `/training-plans/[id]`, gdzie `[id]` jest unikalnym identyfikatorem (UUID) planu treningowego. Implementacja będzie znajdować się w pliku `src/app/training-plans/[id]/page.tsx`.

## 3. Struktura komponentów

Komponenty będą zorganizowane w następującej hierarchii (z wykorzystaniem komponentów Shadcn/ui):

```
TrainingPlanDetailPage (Server Component, /src/app/training-plans/[id]/page.tsx)
│
├── Loading State Placeholder (np. Shadcn Skeleton)
├── Error State Component (np. Shadcn Alert)
│
└── Success State:
    ├── PlanHeader (Client Component, np. w src/components/training-plans/)
    │   └── Shadcn Heading (Nazwa planu)
    │   └── (Opcjonalnie: Placeholder na przyszłe przyciski akcji - Shadcn Button)
    │
    └── PlanDaysAccordion (Client Component, np. w src/components/training-plans/)
        └── Shadcn Accordion (type="multiple" lub "single")
            └── Dla każdego dnia (day in plan_details.days):
                └── Shadcn AccordionItem (value={`day-${index}`)
                    ├── Shadcn AccordionTrigger (Nazwa dnia, np. day.day)
                    └── Shadcn AccordionContent
                        └── DayWorkout (Client Component, np. w src/components/training-plans/)
                            └── ExerciseList (Client Component, np. w src/components/training-plans/)
                                └── Dla każdego ćwiczenia (exercise in day.exercises):
                                    └── ExerciseListItem (Client Component, np. w src/components/training-plans/)
                                        ├── Nazwa ćwiczenia
                                        └── Szczegóły (serie, powtórzenia/czas, odpoczynek)
```

## 4. Szczegóły komponentów

### `TrainingPlanDetailPage` (Page Component - Server Component)

- **Opis komponentu:** Główny komponent strony, odpowiedzialny za pobranie danych planu treningowego na podstawie `id` z URL, obsługę stanów ładowania i błędów oraz renderowanie odpowiednich komponentów podrzędnych. Wykorzystuje Server Components do pobierania danych po stronie serwera.
- **Główne elementy:** Warunkowe renderowanie komponentów ładowania (np. `Skeleton`), błędów (np. `Alert`) lub `PlanHeader` i `PlanDaysAccordion` w przypadku sukcesu.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika (obsługuje logikę pobierania danych).
- **Obsługiwana walidacja:** Pośrednio obsługuje błędy zwracane przez akcję `getTrainingPlanById` (np. Not Found, Unauthorized, Server Error). Walidacja `id` z URL (format UUID) może być dodana opcjonalnie lub polegać na błędzie z akcji.
- **Typy:** Pobiera `{ params: { id: string } }` z Next.js. Oczekuje `TrainingPlanDetailOutput` z `getTrainingPlanById`.
- **Propsy:** `{ params: { id: string } }`

### `PlanHeader` (Client Component)

- **Opis komponentu:** Wyświetla nazwę planu treningowego. Może zawierać miejsce na przyszłe przyciski akcji (np. zmiana nazwy, usunięcie).
- **Główne elementy:** `<h1>` lub `<h2>` (Shadcn `Heading`) dla nazwy planu. Opcjonalnie `div` z przyciskami (Shadcn `Button`).
- **Obsługiwane interakcje:** Kliknięcia na przyciski akcji (w przyszłości).
- **Obsługiwana walidacja:** Brak walidacji dla samego wyświetlania nazwy.
- **Typy:** Przyjmuje `planName: string`. Opcjonalnie `planId: string` dla przyszłych akcji.
- **Propsy:** `{ planName: string; planId: string; }`

### `PlanDaysAccordion` (Client Component)

- **Opis komponentu:** Renderuje listę dni treningowych w formie akordeonu, używając komponentu `Accordion` z Shadcn/ui. Każdy element akordeonu reprezentuje jeden dzień treningowy.
- **Główne elementy:** Komponent `Accordion` (np. `type="multiple"` aby pozwolić na otwarcie wielu dni naraz), zawierający listę `AccordionItem`.
- **Obsługiwane interakcje:** Rozwijanie/zwijanie poszczególnych dni treningowych przez użytkownika.
- **Obsługiwana walidacja:** Brak walidacji; renderuje dni na podstawie otrzymanych danych. Powinien obsłużyć pustą listę dni (`days`).
- **Typy:** Przyjmuje `days: PlanDay[]` (gdzie `PlanDay` pochodzi z `src/types/api.ts`).
- **Propsy:** `{ days: PlanDay[]; }`

### `DayWorkout` (Client Component)

- **Opis komponentu:** Renderuje zawartość pojedynczego elementu akordeonu (dnia treningowego), głównie listę ćwiczeń dla tego dnia.
- **Główne elementy:** Komponent `ExerciseList`. Może zawierać dodatkowe informacje o dniu, jeśli będą potrzebne w przyszłości.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji.
- **Obsługiwana walidacja:** Brak walidacji; renderuje `ExerciseList`.
- **Typy:** Przyjmuje `day: PlanDay`.
- **Propsy:** `{ day: PlanDay; }`

### `ExerciseList` (Client Component)

- **Opis komponentu:** Renderuje uporządkowaną lub nieuporządkowaną listę ćwiczeń dla danego dnia treningowego.
- **Główne elementy:** `<ul>` lub `<ol>`, zawierające listę komponentów `ExerciseListItem`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji.
- **Obsługiwana walidacja:** Brak walidacji; renderuje listę ćwiczeń. Powinien obsłużyć pustą listę `exercises`.
- **Typy:** Przyjmuje `exercises: Exercise[]` (gdzie `Exercise` pochodzi z `src/types/api.ts`).
- **Propsy:** `{ exercises: Exercise[]; }`

### `ExerciseListItem` (Client Component)

- **Opis komponentu:** Wyświetla szczegóły pojedynczego ćwiczenia: nazwę, liczbę serii, liczbę powtórzeń (lub czas trwania) oraz czas odpoczynku.
- **Główne elementy:** Element listy (`<li>`), zawierający `<span>` lub `<p>` dla nazwy ćwiczenia i jego parametrów. Można użyć małych komponentów lub `div` do strukturyzacji danych (np. Serie: X, Powtórzenia: Y, Odpoczynek: Zs).
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji.
- **Obsługiwana walidacja:** Sprawdza obecność opcjonalnych pól (`duration_seconds`, `duration_minutes`) i wyświetla je warunkowo zamiast `repetitions`.
- **Typy:** Przyjmuje `exercise: Exercise`.
- **Propsy:** `{ exercise: Exercise; }`

## 5. Typy

Głównym typem danych dla tego widoku jest `TrainingPlanDetailOutput` zdefiniowany w `src/types/api.ts`. Kluczowe podtypy używane w komponentach to:

- `PlanDay`: Reprezentuje pojedynczy dzień treningowy.
  ```typescript
  interface PlanDay {
    day: string; // np. "Monday", "Day 1"
    exercises: Exercise[];
  }
  ```
- `Exercise`: Reprezentuje pojedyncze ćwiczenie.
  ```typescript
  interface Exercise {
    name: string;
    sets: number;
    repetitions: number; // Używane, gdy duration nie jest podane
    rest_time_seconds: number;
    duration_seconds?: number; // Opcjonalny czas trwania w sekundach
    duration_minutes?: number; // Opcjonalny czas trwania w minutach
  }
  ```
- `TrainingPlanDetailOutput`: Główny obiekt odpowiedzi API.
  ```typescript
  type TrainingPlanDetailOutput = Pick<
    Tables<"training_plans">,
    "id" | "name" | "created_at" | "user_id"
  > & {
    plan_details: PlanDetails; // Zawiera PlanDay[]
    preferences_snapshot: TrainingPreferences; // Może być nieużywane w tym widoku
  };
  ```
  Nie przewiduje się potrzeby tworzenia dodatkowych, złożonych typów ViewModel dla tego widoku, ponieważ struktura `TrainingPlanDetailOutput` jest wystarczająco dopasowana do potrzeb UI.

## 6. Zarządzanie stanem

- **Pobieranie danych:** Stan ładowania i błędu będzie zarządzany w `TrainingPlanDetailPage` (Server Component) przy użyciu `async/await` i `try...catch`. Nie jest potrzebny stan po stronie klienta do samego pobierania danych.
- **Stan UI:** Komponent `PlanDaysAccordion` będzie zarządzał stanem rozwinięcia/zwinięcia swoich elementów (`AccordionItem`). Komponent `Accordion` z Shadcn/ui zazwyczaj obsługuje ten stan wewnętrznie lub poprzez propsy (`type`, `defaultValue`, `value`, `onValueChange`), eliminując potrzebę ręcznego zarządzania stanem za pomocą `useState` w naszym komponencie.
- **Custom Hooks:** Na tym etapie (wyświetlanie danych) nie jest wymagany żaden niestandardowy hook. W przyszłości, przy dodawaniu funkcji edycji/usuwania, może pojawić się potrzeba hooków do zarządzania stanem formularzy, modali lub logiki mutacji danych.

## 7. Integracja API

- **Endpoint:** Wykorzystana zostanie serwerowa akcja `getTrainingPlanById` zdefiniowana w `src/db/actions/training-plans/get-by-id.ts`.
- **Wywołanie:** W komponencie `TrainingPlanDetailPage` (Server Component):

  ```typescript
  import { getTrainingPlanById } from "@/db/actions/training-plans/get-by-id";
  import type { TrainingPlanDetailOutput } from "@/types/api";

  export default async function TrainingPlanDetailPage({
    params,
  }: {
    params: { id: string };
  }) {
    let planData: TrainingPlanDetailOutput | null = null;
    let error: string | null = null;

    try {
      // Walidacja ID (opcjonalnie, np. prosty regex dla UUID)
      if (
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          params.id
        )
      ) {
        throw new Error("Invalid plan ID format.");
      }
      planData = await getTrainingPlanById({ id: params.id });
    } catch (err: any) {
      console.error("Failed to fetch training plan:", err);
      if (err.message?.includes("not found or access denied")) {
        error =
          "Nie znaleziono planu treningowego lub nie masz do niego dostępu.";
      } else if (err.message === "User not authenticated") {
        // Ten błąd powinien być przechwycony przez middleware, ale na wszelki wypadek
        error = "Nie jesteś zalogowany.";
      } else if (err.message === "Invalid plan ID format.") {
        error = "Nieprawidłowy format ID planu.";
      } else {
        error =
          "Wystąpił błąd podczas ładowania planu treningowego. Spróbuj ponownie później.";
      }
      // Można dodać logowanie błędu do systemu monitoringu (np. Sentry)
    }

    if (error) {
      // Renderuj komponent błędu (np. Alert z Shadcn)
      // return <ErrorComponent message={error} />;
    }

    if (!planData) {
      // Renderuj stan ładowania lub fallback jeśli planData jest null mimo braku błędu (mało prawdopodobne)
      // return <LoadingComponent />;
    }

    // Renderuj widok sukcesu z planData
    // return (
    //   <div>
    //     <PlanHeader planName={planData.name} planId={planData.id} />
    //     <PlanDaysAccordion days={planData.plan_details.days} />
    //   </div>
    // );
  }
  ```

- **Typy żądania/odpowiedzi:**
  - Żądanie (do akcji `getTrainingPlanById`): `GetTrainingPlanInput` (`{ id: string }`)
  - Odpowiedź (z akcji `getTrainingPlanById`): `Promise<TrainingPlanDetailOutput>`

## 8. Interakcje użytkownika

- **Nawigacja do strony:** Użytkownik przechodzi na URL `/training-plans/[id]`.
- **Ładowanie danych:** Wyświetlany jest wskaźnik ładowania (np. `Skeleton`).
- **Wyświetlenie danych:** Po pomyślnym załadowaniu, wskaźnik znika, pojawia się nazwa planu i akordeon z dniami treningowymi.
- **Rozwijanie/Zwijanie dnia:** Użytkownik klika na nazwę dnia w akordeonie, co powoduje rozwinięcie lub zwinięcie sekcji z listą ćwiczeń dla tego dnia.
- **Obsługa błędów:** W przypadku problemów z ładowaniem danych (brak planu, brak uprawnień, błąd serwera), wyświetlany jest odpowiedni komunikat błędu (np. `Alert`).

## 9. Warunki i walidacja

- **Uwierzytelnienie:** Akcja `getTrainingPlanById` sprawdza, czy użytkownik jest zalogowany. Komponent strony (`TrainingPlanDetailPage`) polega na tej weryfikacji oraz na middleware aplikacji. W przypadku braku uwierzytelnienia, akcja zwróci błąd, który zostanie obsłużony przez stronę (wyświetlenie błędu lub middleware przekieruje użytkownika).
- **Autoryzacja (Własność planu):** Akcja `getTrainingPlanById` sprawdza, czy `user_id` planu pasuje do ID zalogowanego użytkownika. W przypadku braku dopasowania, zwracany jest błąd `PGRST116`, który strona interpretuje jako "brak dostępu" lub "nie znaleziono".
- **Istnienie planu:** Akcja `getTrainingPlanById` obsługuje przypadek, gdy plan o danym `id` nie istnieje (również błąd `PGRST116`). Strona wyświetla komunikat "nie znaleziono".
- **Format ID:** Opcjonalna walidacja formatu UUID w `TrainingPlanDetailPage` przed wywołaniem akcji może zapewnić szybszą informację zwrotną o błędnym URL. Jeśli walidacja nie zostanie dodana, błędny format prawdopodobnie spowoduje błąd w zapytaniu do bazy danych, który również zostanie obsłużony.
- **Opcjonalne dane ćwiczeń:** Komponent `ExerciseListItem` musi sprawdzać, czy `exercise.duration_seconds` lub `exercise.duration_minutes` są zdefiniowane i wyświetlać czas trwania zamiast `exercise.repetitions`, jeśli tak jest.
- **Puste listy:** Komponenty `PlanDaysAccordion` i `ExerciseList` powinny renderować informację zwrotną (np. "Brak zdefiniowanych dni treningowych.", "Brak ćwiczeń na ten dzień."), gdy odpowiednie tablice (`days` lub `exercises`) są puste.

## 10. Obsługa błędów

- **Błędy sieciowe / serwera (5xx):** W bloku `catch` w `TrainingPlanDetailPage` przechwytywać ogólne błędy i wyświetlać komunikat typu "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.". Logować szczegóły błędu po stronie serwera.
- **Brak uwierzytelnienia (401):** Przechwycić błąd "User not authenticated" i wyświetlić stosowny komunikat. Idealnie, middleware powinno zająć się przekierowaniem do logowania.
- **Brak autoryzacji / Nie znaleziono (403/404):** Przechwycić błąd `PGRST116` (lub specyficzny komunikat z akcji, np. "not found or access denied") i wyświetlić komunikat "Nie znaleziono planu treningowego lub nie masz do niego dostępu.".
- **Nieprawidłowy format ID:** Jeśli dodano walidację formatu UUID, wyświetlić błąd "Nieprawidłowy format ID planu.".
- **Błędy renderowania (po stronie klienta):** W przypadku problemów z renderowaniem komponentów klienckich (np. z powodu nieoczekiwanej struktury danych pomimo typowania), zastosować granice błędów React (`Error Boundary`) na odpowiednim poziomie, aby zapobiec awarii całej strony i wyświetlić komunikat zastępczy.
- **Puste dane:** Jak wspomniano w sekcji Walidacja, obsłużyć przypadki pustych list dni lub ćwiczeń, wyświetlając użytkownikowi informację, zamiast pustego interfejsu.

## 11. Kroki implementacji

1.  **Utworzenie struktury plików:**
    - Utwórz plik strony: `src/app/training-plans/[id]/page.tsx`.
    - Utwórz folder dla komponentów specyficznych dla tej funkcji, np. `src/components/training-plans/`.
    - Utwórz pliki dla komponentów klienckich: `PlanHeader.tsx`, `PlanDaysAccordion.tsx`, `DayWorkout.tsx`, `ExerciseList.tsx`, `ExerciseListItem.tsx` w folderze `src/components/training-plans/`.
2.  **Implementacja `TrainingPlanDetailPage` (Server Component):**
    - Dodaj logikę pobierania danych z `getTrainingPlanById` używając `async/await` i `try...catch`.
    - Implementuj obsługę stanów ładowania (np. za pomocą Next.js `loading.tsx` lub warunkowo w komponencie) i błędów (renderowanie komponentu `Alert`).
    - W przypadku sukcesu, przekaż pobrane dane (`planData`) jako propsy do komponentów `PlanHeader` i `PlanDaysAccordion`.
3.  **Implementacja `PlanHeader`:**
    - Przyjmij `planName` i `planId` jako propsy.
    - Wyświetl nazwę planu używając komponentu `Heading` z Shadcn/ui.
    - (Opcjonalnie) Dodaj placeholder na przyszłe przyciski akcji.
4.  **Implementacja `PlanDaysAccordion`:**
    - Przyjmij `days` jako props.
    - Użyj komponentów `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` z Shadcn/ui.
    - Iteruj po tablicy `days`, renderując `AccordionItem` dla każdego dnia.
    - W `AccordionTrigger` wyświetl `day.day`.
    - W `AccordionContent` renderuj komponent `DayWorkout`, przekazując mu `day`.
    - Obsłuż przypadek pustej tablicy `days`.
5.  **Implementacja `DayWorkout`:**
    - Przyjmij `day` jako props.
    - Renderuj komponent `ExerciseList`, przekazując mu `day.exercises`.
6.  **Implementacja `ExerciseList`:**
    - Przyjmij `exercises` jako props.
    - Iteruj po tablicy `exercises`, renderując `ExerciseListItem` dla każdego ćwiczenia.
    - Użyj `ul` lub `ol` dla listy.
    - Obsłuż przypadek pustej tablicy `exercises`.
7.  **Implementacja `ExerciseListItem`:**
    - Przyjmij `exercise` jako props.
    - Wyświetl `exercise.name`.
    - Wyświetl `exercise.sets`.
    - Warunkowo wyświetl `exercise.repetitions` LUB `exercise.duration_minutes`/`exercise.duration_seconds`.
    - Wyświetl `exercise.rest_time_seconds`.
    - Zastosuj odpowiednie stylowanie Tailwind dla czytelności.
8.  **Styling:** Zastosuj Tailwind i klasy Shadcn/ui we wszystkich komponentach, aby zapewnić spójny wygląd i responsywność (mobile-first).
9.  **Testowanie:**
    - Przetestuj ręcznie na różnych urządzeniach/rozmiarach ekranu.
    - Sprawdź obsługę błędów (wpisując nieprawidłowe ID, ID planu innego użytkownika, symulując błędy serwera).
    - Sprawdź przypadek z pustymi dniami lub ćwiczeniami.
    - Sprawdź dostępność (nawigacja klawiaturą, screen reader).
    - (Opcjonalnie) Napisz testy jednostkowe/integracyjne dla komponentów (np. z Vitest/RTL) i E2E (np. z Playwright).
10. **Refaktoryzacja i czyszczenie kodu:** Upewnij się, że kod jest zgodny z wytycznymi projektu (linting, formatowanie, nazewnictwo). Usuń zbędne `console.log`.
