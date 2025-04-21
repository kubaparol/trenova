"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const UserGenderEnum = {
  male: "male",
  female: "female",
  other: "other",
  prefer_not_to_say: "prefer_not_to_say",
} as const;

const ExperienceLevelEnum = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
} as const;

const UserGoalEnum = {
  weight_loss: "weight_loss",
  muscle_gain: "muscle_gain",
  general_fitness: "general_fitness",
  strength_increase: "strength_increase",
} as const;

const EquipmentAccessEnum = {
  none: "none",
  home_basic: "home_basic",
  full_gym: "full_gym",
} as const;

const trainingPreferencesSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nazwa planu musi mieć co najmniej 3 znaki" })
    .max(50, { message: "Nazwa planu nie może przekraczać 50 znaków" }),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Proszę wybrać płeć",
  }),
  experience: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Proszę wybrać poziom doświadczenia",
  }),
  goal: z.enum(
    ["weight_loss", "muscle_gain", "general_fitness", "strength_increase"],
    {
      required_error: "Proszę wybrać główny cel",
    }
  ),
  days_per_week: z.coerce
    .number()
    .int({ message: "Wartość musi być liczbą całkowitą" })
    .min(1, { message: "Minimum 1 dzień w tygodniu" })
    .max(7, { message: "Maksimum 7 dni w tygodniu" }),
  session_duration_minutes: z.coerce
    .number()
    .int({ message: "Wartość musi być liczbą całkowitą" })
    .min(15, { message: "Minimum 15 minut" })
    .max(180, { message: "Maksimum 180 minut" }),
  equipment: z.enum(["none", "home_basic", "full_gym"], {
    required_error: "Proszę wybrać dostępny sprzęt",
  }),
  restrictions: z.string().optional(),
});

export type TrainingPreferencesFormValues = z.infer<
  typeof trainingPreferencesSchema
>;

interface TrainingPreferencesFormProps {
  onSubmit: (data: TrainingPreferencesFormValues) => Promise<void>;
}

export function TrainingPreferencesForm({
  onSubmit,
}: TrainingPreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TrainingPreferencesFormValues>({
    resolver: zodResolver(trainingPreferencesSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      experience: undefined,
      goal: undefined,
      days_per_week: undefined,
      session_duration_minutes: undefined,
      equipment: undefined,
      restrictions: "",
    },
  });

  const handleSubmit = async (data: TrainingPreferencesFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      toast.error("Error", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Nowy Plan Treningowy</CardTitle>
        <CardDescription>
          Wprowadź swoje preferencje, aby wygenerować spersonalizowany plan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Szczegóły Planu</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa Planu</FormLabel>

                    <FormControl>
                      <Input placeholder="Mój plan treningowy" {...field} />
                    </FormControl>

                    <FormDescription>
                      Nadaj swojemu planowi unikalną nazwę.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informacje Osobiste</h3>

              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Płeć</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz płeć" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserGenderEnum.male}>
                            Mężczyzna
                          </SelectItem>
                          <SelectItem value={UserGenderEnum.female}>
                            Kobieta
                          </SelectItem>
                          <SelectItem value={UserGenderEnum.other}>
                            Inna
                          </SelectItem>
                          <SelectItem value={UserGenderEnum.prefer_not_to_say}>
                            Wolę nie podawać
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Poziom Doświadczenia</FormLabel>

                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4 justify-between"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={ExperienceLevelEnum.beginner}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Początkujący
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={ExperienceLevelEnum.intermediate}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Średniozaawansowany
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={ExperienceLevelEnum.advanced}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Zaawansowany
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Główny Cel</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz główny cel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserGoalEnum.weight_loss}>
                            Utrata wagi
                          </SelectItem>
                          <SelectItem value={UserGoalEnum.muscle_gain}>
                            Budowa mięśni
                          </SelectItem>
                          <SelectItem value={UserGoalEnum.general_fitness}>
                            Ogólna sprawność
                          </SelectItem>
                          <SelectItem value={UserGoalEnum.strength_increase}>
                            Zwiększenie siły
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dostępność i Sprzęt</h3>

              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="days_per_week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dni treningowych w tygodniu</FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={7}
                          placeholder="3"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="session_duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Preferowany czas trwania sesji (minuty)
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min={15}
                          max={180}
                          placeholder="60"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Dostępny Sprzęt</FormLabel>

                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={EquipmentAccessEnum.none}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Brak</FormLabel>
                          </FormItem>

                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={EquipmentAccessEnum.home_basic}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Podstawowy domowy
                            </FormLabel>
                          </FormItem>

                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={EquipmentAccessEnum.full_gym}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Pełna siłownia
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ograniczenia</h3>

              <FormField
                control={form.control}
                name="restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ograniczenia lub uwagi</FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder="Np. kontuzja kolana, problemy z kręgosłupem..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      Wpisz wszelkie ograniczenia zdrowotne, kontuzje lub inne
                      uwagi.
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Trwa generowanie planu..." : "Generuj plan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
