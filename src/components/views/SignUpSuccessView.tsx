import { ProjectUrls } from "@/constants";
import { PartyPopper } from "lucide-react";
import { MessageCard } from "@/components/shared/MessageCard";

export function SignUpSuccessView() {
  return (
    <MessageCard
      icon={PartyPopper}
      title="Welcome aboard!"
      description="Your account is ready. Let's get started!"
      linkHref={ProjectUrls.trainingPlans}
      linkText="Start exploring"
    />
  );
}
