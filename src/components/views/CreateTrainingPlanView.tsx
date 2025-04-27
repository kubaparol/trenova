"use client";

import {
  TrainingPreferencesForm,
  TrainingPreferencesFormValues,
} from "../forms/TrainingPreferencesForm";
import { createTrainingPlan } from "@/db/actions/training-plans/create";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectUrls } from "@/constants";

export function CreateTrainingPlanView() {
  const router = useRouter();

  const handleCreatePlan = async (data: TrainingPreferencesFormValues) => {
    const restrictionsArray = data.restrictions
      ? data.restrictions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const result = await createTrainingPlan({
      name: data.name,
      preferences: {
        gender: data.gender,
        experience: data.experience,
        goal: data.goal,
        days_per_week: data.days_per_week,
        session_duration_minutes: data.session_duration_minutes,
        equipment: data.equipment,
        restrictions: restrictionsArray,
      },
    });

    toast.success("Training Plan Created!", {
      description: `Training plan "${result.name}" created successfully.`,
    });

    router.push(ProjectUrls.trainingPlan(result.id));
  };

  return <TrainingPreferencesForm onSubmit={handleCreatePlan} />;
}
