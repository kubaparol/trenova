import { ProjectUrls } from "@/constants";
import { CheckCircle } from "lucide-react";
import { MessageCard } from "@/components/shared/MessageCard";

export function ResetPasswordSentView() {
  return (
    <MessageCard
      icon={CheckCircle}
      iconClassName="text-green-600"
      title="Password Reset Email Sent"
      description="Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
      additionalContent="Didn't receive the email? Make sure you've entered the correct email address or check your spam folder."
      linkHref={ProjectUrls.signIn}
      linkText="Back to sign in"
    />
  );
}
