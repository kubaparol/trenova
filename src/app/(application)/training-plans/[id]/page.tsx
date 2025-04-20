import { TrainingPlanView } from "@/components/views/TrainingPlanView";
import { PageProps } from "@/types";

export default function TrainingPlanPage(props: PageProps) {
  const id = props.params?.id as string;
  return <TrainingPlanView id={id} />;
}
