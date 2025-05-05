import { ProjectUrls } from "@/constants";
import { CheckCircle } from "lucide-react";
import { MessageCard } from "@/components/shared/MessageCard";

export function ResetPasswordSuccessView() {
  return (
    <MessageCard
      icon={CheckCircle}
      iconClassName="text-green-600"
      title="Password Reset Successful"
      description="Your password has been successfully changed. You can now go to application."
      linkHref={ProjectUrls.dashboard}
      linkText="Go to application"
    />
  );
}
