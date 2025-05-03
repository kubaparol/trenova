import { TrainingPlanSessionView } from "@/components/views/TrainingPlanSessionView";
import { PageProps } from "@/types";

export const runtime = "edge";

export default async function TrainingPlanSessionPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const id = params?.id as string;
  const day = searchParams?.day as string;

  return <TrainingPlanSessionView id={id} dayName={day} />;
}
