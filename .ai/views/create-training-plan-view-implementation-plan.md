# Plan implementacji widoku Formularza Danych Treningowych

## 1. Przegląd

Widok ten umożliwia zalogowanemu użytkownikowi wprowadzenie swoich preferencji treningowych oraz nazwy planu w celu wygenerowania nowego, spersonalizowanego planu treningowego przy użyciu AI. Po pomyślnym przesłaniu formularza, użytkownikowi pokazywana jest informacja o procesie generowania planu bezpośrednio w tym samym widoku.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/training-plans/new`. Dostęp do tej ścieżki powinien być ograniczony tylko dla zalogowanych użytkowników.

## 3. Struktura komponentów

```
/training-plans/new (Page Component: TrainingDataFormView)
└── TrainingPreferencesForm (Client Component)
    ├── ShadcnForm (react-hook-form wrapper)
    │   ├── Sekcja "Nazwa Planu"
    │   │   └── ShadcnInput (pole 'name')
    │   ├── Sekcja "Informacje Osobiste"
    │   │   └── ShadcnSelect (pole 'gender')
    │   │   └── ShadcnRadioGroup (pole 'experience')
    │   │   └── ShadcnSelect (pole 'goal')
    │   ├── Sekcja "Dostępność i Sprzęt"
    │   │   └── ShadcnInput[number] lub ShadcnSlider (pole 'days_per_week')
    │   │   └── ShadcnInput[number] lub ShadcnSlider (pole 'session_duration_minutes')
    │   │   └── ShadcnRadioGroup (pole 'equipment')
    │   ├── Sekcja "Ograniczenia"
    │   │   └── ShadcnTextarea (pole 'restrictions')
    │   └── ShadcnButton (przycisk Submit)
    ├── PlanGenerationIndicator (Client Component - conditionally rendered)
    │   └── ShadcnSpinner / ShadcnProgress (lub inna animacja)
    │   └── Text ("Generating your plan...")
    └── ShadcnSonner
```

_Uwaga: Sekcje formularza zostaną zaimplementowane przy użyciu standardowych elementów HTML (`div`, `h2`, `label`) oraz stylów Tailwind._

## 4. Szczegóły komponentów

### `TrainingDataFormView` (Komponent Strony)

- **Opis komponentu:** Główny kontener strony dla ścieżki `/training-plans/new`. Odpowiada za renderowanie formularza, zarządzanie logiką nawigacji po submicie oraz potencjalne wstrzyknięcie zależności do formularza (np. danych użytkownika do pre-fill, jeśli zdecydujemy się na tę funkcjonalność).
- **Główne elementy:** Renderuje komponent `TrainingPreferencesForm`.
- **Obsługiwane interakcje:** Pośrednio obsługuje wynik submita formularza (sukces/błąd) poprzez wywołanie zwrotne z `TrainingPreferencesForm` lub dedykowanego hooka. Inicjuje nawigację do `/training-plans/generating` w przypadku sukcesu.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji; delegowana do `TrainingPreferencesForm`.
- **Typy:** Brak specyficznych typów propsów.
- **Propsy:** Brak.

### `TrainingPreferencesForm` (Komponent Kliencki)

- **Opis komponentu:** Rdzeń widoku; formularz zbudowany przy użyciu `Form` z Shadcn/ui (opartego na `react-hook-form`). Zawiera wszystkie pola wejściowe dla nazwy planu i preferencji treningowych, logikę walidacji oraz obsługę procesu wysyłania danych. Warunkowo renderuje `PlanGenerationIndicator` podczas oczekiwania na odpowiedź API.
- **Główne elementy:** Wykorzystuje komponenty Shadcn/ui: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `Input`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `RadioGroup`, `RadioGroupItem`, `Slider` (opcjonalnie), `Textarea`, `Button`. Struktura oparta na polach zdefiniowanych w `TrainingPreferencesFormViewModel`. Warunkowo renderuje `PlanGenerationIndicator`.
- **Obsługiwane interakcje:**
  - Zmiana wartości w polach formularza (`onChange`).
  - Wysłanie formularza (`onSubmit`).
  - Wyświetlanie błędów walidacji inline.
  - Wyświetlanie powiadomień toast o sukcesie/błędzie wysłania.
  - Wyświetlanie wskaźnika generowania (`PlanGenerationIndicator`) podczas oczekiwania na odpowiedź API.
- **Obsługiwana walidacja:** (Zdefiniowana w schemacie `TrainingPreferencesFormSchema` przy użyciu `zod`)
  - `name`: Wymagane, string, min. 3 znaki, max. 50 znaków.
  - `gender`: Wymagane, musi być jedną z wartości `Enums<'user_gender'>`.
  * `experience`: Wymagane, musi być jedną z wartości `Enums<'experience_level'>`.
  * `goal`: Wymagane, musi być jedną z wartości `Enums<'user_goal'>`.
  * `days_per_week`: Wymagane, liczba całkowita, min. 1, max. 7.
  * `session_duration_minutes`: Wymagane, liczba całkowita, min. 15, max. 180.
  * `equipment`: Wymagane, musi być jedną z wartości `Enums<'equipment_access'>`.
  * `restrictions`: Opcjonalne, string.
- **Typy:**
  - `TrainingPreferencesFormViewModel` (dla stanu formularza)
  - `CreateTrainingPlanInput` (DTO dla API)
- **Propsy:**
  - `onSubmit: (data: TrainingPreferencesFormViewModel) => Promise<void>`: Funkcja wywoływana przy pomyślnym zwalidowaniu i wysłaniu formularza. Powinna zarządzać stanem ładowania.
  - `isSubmitting: boolean`: Flaga wskazująca, czy formularz jest w trakcie przetwarzania (np. oczekiwania na odpowiedź API), używana do deaktywacji przycisku Submit i wyświetlania `PlanGenerationIndicator`.

### `PlanGenerationIndicator` (Komponent Kliencki)

- **Opis komponentu:** Prosty komponent wizualny wyświetlany podczas generowania planu treningowego przez AI. Informuje użytkownika, że proces jest w toku.
- **Główne elementy:** Wskaźnik ładowania (np. `Spinner` z Shadcn lub niestandardowa animacja), tekst informacyjny (np. "Generowanie Twojego planu...").
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów propsów.
- **Propsy:** Brak (komponent jest po prostu renderowany warunkowo).

## 5. Typy

Główne typy danych wymagane przez widok:

1.  **`CreateTrainingPlanInput` (DTO):** Typ danych wysyłanych do API (zdefiniowany w `src/types/api.ts`).

    ```typescript
    import type { Enums } from "@/db/database.types";

    interface CreateTrainingPlanInput {
      name: string;
      preferences: {
        gender: Enums<"user_gender">;
        experience: Enums<"experience_level">;
        goal: Enums<"user_goal">;
        days_per_week: number;
        session_duration_minutes: number;
        equipment: Enums<"equipment_access">;
        restrictions: string[]; // API oczekuje tablicy stringów
      };
    }
    ```

2.  **`TrainingPreferencesFormViewModel` (ViewModel):** Typ danych reprezentujący stan formularza, używany przez `react-hook-form`. Zdefiniowany na podstawie schematu Zod.

    ```typescript
    import { z } from "zod";
    import type { Enums } from "@/db/database.types"; // Załóżmy dostępność Enums

    // Schemat Zod do walidacji
    export const TrainingPreferencesFormSchema = z.object({
      name: z
        .string()
        .min(3, "Nazwa planu musi mieć co najmniej 3 znaki.")
        .max(50, "Nazwa planu nie może przekraczać 50 znaków."),
      gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
        required_error: "Wybierz płeć.",
      }),
      experience: z.enum(["beginner", "intermediate", "advanced"], {
        required_error: "Wybierz poziom doświadczenia.",
      }),
      goal: z.enum(
        ["weight_loss", "muscle_gain", "general_fitness", "strength_increase"],
        { required_error: "Wybierz główny cel." }
      ),
      days_per_week: z.coerce
        .number({
          required_error: "Podaj liczbę dni treningowych.",
          invalid_type_error: "Wartość musi być liczbą.",
        })
        .int()
        .min(1, "Minimum 1 dzień.")
        .max(7, "Maksimum 7 dni."),
      session_duration_minutes: z.coerce
        .number({
          required_error: "Podaj czas trwania sesji.",
          invalid_type_error: "Wartość musi być liczbą.",
        })
        .int()
        .min(15, "Minimum 15 minut.")
        .max(180, "Maksimum 180 minut."),
      equipment: z.enum(["none", "home_basic", "full_gym"], {
        required_error: "Wybierz dostępny sprzęt.",
      }),
      restrictions: z.string().optional(), // Ograniczenia jako pojedynczy string w formularzu
    });

    // Typ TypeScript wygenerowany ze schematu Zod
    export type TrainingPreferencesFormViewModel = z.infer<
      typeof TrainingPreferencesFormSchema
    >;
    ```

3.  **`Enums<...>`:** Typy pochodzące z `database.types.ts` używane do definicji dozwolonych wartości dla pól typu enum (`gender`, `experience`, `goal`, `equipment`). Należy upewnić się, że wartości używane w komponentach `Select` i `RadioGroup` dokładnie odpowiadają tym typom.

## 6. Zarządzanie stanem

- Stan formularza (wartości pól, błędy walidacji, status `touched`/`dirty`) będzie zarządzany za pomocą biblioteki `react-hook-form` i hooka `useForm`.
- Schemat walidacji `zod` (`TrainingPreferencesFormSchema`) zostanie zintegrowany z `react-hook-form` za pomocą `@hookform/resolvers/zod`.
- Stan ładowania (`isSubmitting`) będzie zarządzany lokalnie w komponencie lub w dedykowanym customowym hooku (`useTrainingPlanForm`), aby kontrolować stan przycisku Submit podczas komunikacji z API.
- **Custom Hook (`useTrainingPlanForm`):** Zalecane jest stworzenie hooka, który enkapsuluje:
  - Inicjalizację `useForm` z `zodResolver`.
  - Stan `isSubmitting`.
  - Funkcję `onSubmit`, która:
    - Mapuje `TrainingPreferencesFormViewModel` do `CreateTrainingPlanInput`.
    - Wywołuje akcję serwera `createTrainingPlan`.
    - Obsługuje sukces (nawigacja, toast).
    - Obsługuje błędy (toast, reset `isSubmitting`).
    - Zarządza stanem `isSubmitting`.
  - Hook zwracałby metody `form` z `useForm`, stan `isSubmitting` oraz przygotowaną funkcję `handleSubmit`.

## 7. Integracja API

- Komponent `TrainingPreferencesForm` (lub hook `useTrainingPlanForm`) będzie wywoływał akcję serwera `createTrainingPlan` (zdefiniowaną w `src/db/actions/training-plans/create.ts`).
- **Typ Żądania:** `CreateTrainingPlanInput`. Przed wywołaniem API, dane z formularza (`TrainingPreferencesFormViewModel`) muszą zostać zmapowane do tego typu. Szczególną uwagę należy zwrócić na pole `restrictions`, które w formularzu jest stringiem, a w DTO tablicą stringów (np. przez podział stringa po przecinkach lub nowych liniach).
- **Typ Odpowiedzi (Sukces):** `TrainingPlanDetailOutput`. Odpowiedź zawiera ID nowo utworzonego planu.
- **Obsługa Odpowiedzi:**
  - **Sukces:** Ukrycie `PlanGenerationIndicator`. Wyświetlenie powiadomienia toast o sukcesie (`title: "Sukces!"`, `description: "Twój plan treningowy został wygenerowany."`). Nawigacja do widoku szczegółów planu (`/training-plans/${response.id}`).
  - **Błąd:** Ukrycie `PlanGenerationIndicator`. Wyświetlenie powiadomienia toast o błędzie (`variant: "destructive"`, `title: "Błąd"`, odpowiedni `description` w zależności od typu błędu - patrz sekcja Obsługa Błędów). Ustawienie `isSubmitting` na `false`.

## 8. Interakcje użytkownika

- **Wypełnianie formularza:** Użytkownik wprowadza dane w poszczególne pola. `react-hook-form` aktualizuje stan. Błędy walidacji mogą pojawiać się dynamicznie (np. `onBlur`).
- **Kliknięcie przycisku "Generuj Plan" (Submit):**
  - Jeśli formularz jest **niepoprawny**: `react-hook-form` zapobiega wysłaniu, a błędy są wyświetlane przy odpowiednich polach.
  - Jeśli formularz jest **poprawny**:
    1. Wywoływana jest funkcja `onSubmit` opakowana w `handleSubmit` z `react-hook-form`.
    2. Stan `isSubmitting` ustawiany jest na `true`, przycisk Submit jest deaktywowany, a `PlanGenerationIndicator` jest wyświetlany.
    3. Dane są mapowane z `ViewModel` do `DTO`.
    4. Wywoływana jest akcja serwera `createTrainingPlan`.
    5. **API zwraca sukces:** `PlanGenerationIndicator` jest ukrywany, wyświetlany jest toast sukcesu, a użytkownik jest przekierowywany na `/training-plans/[id]` nowo utworzonego planu. Stan `isSubmitting` resetowany (chociaż po nawigacji może to nie być konieczne).
    6. **API zwraca błąd:** `PlanGenerationIndicator` jest ukrywany, wyświetlany jest toast błędu, stan `isSubmitting` ustawiany jest na `false`, przycisk Submit jest ponownie aktywowany. Użytkownik pozostaje na stronie formularza.

## 9. Warunki i walidacja

- Walidacja odbywa się na poziomie klienta przy użyciu `zod` i `react-hook-form` zgodnie ze schematem `TrainingPreferencesFormSchema`.
- **Warunki pól:**
  - `name`: Wymagane, 3-50 znaków.
  - `gender`, `experience`, `goal`, `equipment`: Wymagane, wybór jednej z predefiniowanych opcji (enum).
  - `days_per_week`: Wymagane, liczba całkowita 1-7.
  - `session_duration_minutes`: Wymagane, liczba całkowita 15-180.
  - `restrictions`: Opcjonalne.
- **Wpływ na interfejs:**
  - Komponenty `FormMessage` z Shadcn/ui wyświetlają komunikaty o błędach walidacji przy odpowiednich polach.
  - Przycisk Submit jest deaktywowany (`disabled`) podczas przetwarzania żądania API (`isSubmitting === true`).

## 10. Obsługa błędów

- **Błędy walidacji formularza:** Obsługiwane przez `react-hook-form` i `zod`, komunikaty wyświetlane inline.
- **Błędy API (`createTrainingPlan`):** Przechwytywane w bloku `catch` w logice `onSubmit`. Identyfikacja błędu na podstawie obiektu `Error` i jego `message`.
  - **400 (Bad Request):** Toast: `title: "Błąd"`, `description: "Nieprawidłowe dane. Sprawdź formularz."` (jeśli API nie dostarcza szczegółów).
  - **401 (Unauthorized):** Toast: `title: "Błąd autoryzacji"`, `description: "Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie."`. Można rozważyć automatyczne przekierowanie do logowania.
  - **429 (Too Many Requests):** Toast: `title: "Błąd"`, `description: "Osiągnięto limit generowania planów. Spróbuj ponownie później."`.
  - **500 (Internal Server Error / AI Error / DB Error):** Toast: `title: "Błąd serwera"`, `description: "Wystąpił nieoczekiwany błąd podczas generowania planu. Spróbuj ponownie."` (można dostarczyć bardziej szczegółowy komunikat, jeśli `error.message` na to pozwala, np. "Błąd komunikacji z AI.").
  - **Błąd sieci:** Toast: `title: "Błąd sieci"`, `description: "Nie można połączyć się z serwerem. Sprawdź połączenie internetowe."`.
- Wszystkie błędy API powinny skutkować ustawieniem `isSubmitting` na `false` i wyświetleniem powiadomienia toast przy użyciu hooka `useToast` z Shadcn/ui (`variant: "destructive"`).

## 11. Kroki implementacji

1.  **Utworzenie pliku strony:** Stworzyć plik dla nowej strony w `src/app/training-plans/new/page.tsx`. Upewnić się, że routing Next.js działa poprawnie i strona jest chroniona (wymaga zalogowania).
2.  **Stworzenie komponentu `TrainingDataFormView`:** Zaimplementować podstawową strukturę strony w `page.tsx`.
3.  **Definicja typów i schematu:** Zdefiniować `TrainingPreferencesFormViewModel` oraz `TrainingPreferencesFormSchema` (np. w osobnym pliku `src/components/training-plans/form.types.ts` lub w pliku komponentu formularza). Zdefiniować funkcję mapującą `mapViewModelToDto`.
4.  **Implementacja Custom Hooka `useTrainingPlanForm` (opcjonalnie, ale zalecane):** Stworzyć hook (`src/hooks/useTrainingPlanForm.ts`?) enkapsulujący logikę `useForm`, `isSubmitting`, wywołanie API, obsługę błędów i sukcesu (nawigacja, toasty). Hook powinien zarządzać stanem `isSubmitting`, który będzie kontrolował wyświetlanie `PlanGenerationIndicator`.
5.  **Stworzenie komponentu `PlanGenerationIndicator`:** Zaimplementować prosty komponent (np. `src/components/training-plans/PlanGenerationIndicator.tsx`) wyświetlający spinner i tekst.
6.  **Implementacja komponentu `TrainingPreferencesForm`:**
    - Stworzyć plik komponentu (np. `src/components/training-plans/TrainingPreferencesForm.tsx`).
    - Użyć hooka `useForm` (bezpośrednio lub przez `useTrainingPlanForm`) ze zdefiniowanym `resolver` i `ViewModel`.
    - Zbudować strukturę formularza przy użyciu komponentów `Form`, `FormField`, `FormItem` itd. z Shadcn/ui dla każdego pola w `ViewModel`.
    - Poprawnie skonfigurować komponenty wejściowe (`Input`, `Select`, `RadioGroup`, `Textarea`, `Slider`) i powiązać je z `react-hook-form` (`form.control`).
    - Dodać odpowiednie `label`, `placeholder` i `description` dla pól.
    - Zaimplementować logikę `onSubmit` przekazaną przez `handleSubmit` (bezpośrednio lub z custom hooka), która wywołuje mapowanie i akcję serwera.
    - Powiązać stan `isSubmitting` z atrybutem `disabled` przycisku Submit oraz z warunkowym renderowaniem komponentu `PlanGenerationIndicator` (np. `isSubmitting && <PlanGenerationIndicator />`).
7.  **Integracja komponentów:** Użyć `TrainingPreferencesForm` wewnątrz `TrainingDataFormView`. Przekazać potrzebne propsy (jeśli nie używamy hooka wewnątrz formularza).
8.  **Styling:** Dodać style Tailwind dla odpowiedniego layoutu sekcji formularza, odstępów itp. Ustylować `PlanGenerationIndicator`, aby dobrze prezentował się w kontekście formularza (np. jako overlay lub dedykowana sekcja).
9.  **Obsługa Toastów:** Upewnić się, że `ToastProvider` jest skonfigurowany globalnie (zgodnie ze standardem Shadcn/ui) i że hook `useToast` jest poprawnie używany do wyświetlania powiadomień.
10. **Testowanie:** Przetestować walidację, proces wysyłania danych (w tym widoczność wskaźnika generowania), obsługę sukcesu (nawigacja), obsługę różnych scenariuszy błędów API oraz responsywność widoku.
11. **Dostępność:** Sprawdzić dostępność formularza i wskaźnika generowania przy użyciu narzędzi deweloperskich i nawigacji klawiaturą. Upewnić się, że stan ładowania jest komunikowany użytkownikom technologii wspomagających (np. przez `aria-live` regiony, jeśli wskaźnik jest bardziej złożony).
