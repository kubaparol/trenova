import { TrainingPlanView } from "@/components/views/TrainingPlanView";
import { PageProps } from "@/types";

export default async function TrainingPlanPage(props: PageProps) {
  const params = await props.params;
  const id = params?.id as string;

  return <TrainingPlanView id={id} />;
}
