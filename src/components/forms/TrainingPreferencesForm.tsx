"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

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
    .min(3, { message: "Plan name must be at least 3 characters long" })
    .max(50, { message: "Plan name cannot exceed 50 characters" }),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Please select your gender",
  }),
  experience: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your experience level",
  }),
  goal: z.enum(
    ["weight_loss", "muscle_gain", "general_fitness", "strength_increase"],
    {
      required_error: "Please select your main goal",
    }
  ),

  days_per_week: z
    .number()
    .min(1, { message: "Minimum 1 day per week" })
    .max(7, { message: "Maximum 7 days per week" }),
  session_duration_minutes: z
    .number()
    .min(15, { message: "Minimum 15 minutes" })
    .max(180, { message: "Maximum 180 minutes" }),
  equipment: z.enum(["none", "home_basic", "full_gym"], {
    required_error: "Please select your available equipment",
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
      days_per_week: 4,
      session_duration_minutes: 60,
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
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while creating the plan.";
      setError(message);
      toast.error("Plan Creation Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>New Training Plan</CardTitle>
          <CardDescription>
            Enter your preferences to generate a personalized plan.
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
                <h3 className="text-lg font-medium">Plan Details</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>

                      <FormControl>
                        <Input placeholder="My Training Plan" {...field} />
                      </FormControl>

                      <FormDescription>
                        Give your plan a unique name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>

                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>

                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserGenderEnum.male}>
                              Male
                            </SelectItem>
                            <SelectItem value={UserGenderEnum.female}>
                              Female
                            </SelectItem>
                            <SelectItem value={UserGenderEnum.other}>
                              Other
                            </SelectItem>
                            <SelectItem
                              value={UserGenderEnum.prefer_not_to_say}
                            >
                              Prefer not to say
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
                        <FormLabel>Experience Level</FormLabel>

                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4 justify-between flex-wrap"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={ExperienceLevelEnum.beginner}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Beginner
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={ExperienceLevelEnum.intermediate}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Intermediate
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={ExperienceLevelEnum.advanced}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Advanced
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
                        <FormLabel>Main Goal</FormLabel>

                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select main goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserGoalEnum.weight_loss}>
                              Weight Loss
                            </SelectItem>
                            <SelectItem value={UserGoalEnum.muscle_gain}>
                              Muscle Gain
                            </SelectItem>
                            <SelectItem value={UserGoalEnum.general_fitness}>
                              General Fitness
                            </SelectItem>
                            <SelectItem value={UserGoalEnum.strength_increase}>
                              Strength Increase
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
                <h3 className="text-lg font-medium">
                  Availability & Equipment
                </h3>

                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="days_per_week"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Training Days per Week</FormLabel>

                          <span className="text-sm font-medium">
                            {field.value} {field.value === 1 ? "day" : "days"}
                          </span>
                        </div>

                        <FormControl>
                          <Slider
                            id="days_per_week"
                            min={1}
                            max={7}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
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
                        <div className="flex items-center justify-between">
                          <FormLabel>
                            Preferred Session Duration (minutes)
                          </FormLabel>

                          <span className="text-sm font-medium">
                            {field.value} min
                          </span>
                        </div>

                        <FormControl>
                          <Slider
                            id="session_duration_minutes"
                            min={15}
                            max={180}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
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
                        <FormLabel>Available Equipment</FormLabel>

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
                              <FormLabel className="font-normal">
                                None
                              </FormLabel>
                            </FormItem>

                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={EquipmentAccessEnum.home_basic}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Basic Home
                              </FormLabel>
                            </FormItem>

                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={EquipmentAccessEnum.full_gym}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Full Gym
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
                <h3 className="text-lg font-medium">Restrictions</h3>

                <FormField
                  control={form.control}
                  name="restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restrictions or Notes</FormLabel>

                      <FormControl>
                        <Textarea
                          placeholder="E.g., knee injury, back problems..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>

                      <FormDescription>
                        Enter any health restrictions, injuries, or other notes.
                      </FormDescription>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                Generate Plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isLoading}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogTitle className="sr-only">
            Generating Training Plan
          </DialogTitle>

          <div className="flex justify-center">
            <Image
              src="/robot-loader.svg"
              alt="Robot generating training plan"
              width={220}
              height={200}
              priority
            />
          </div>

          <DialogDescription asChild>
            <p className="text-center text-sm text-muted-foreground">
              Generating your personalized training plan. This may take a
              moment, please wait...
            </p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
