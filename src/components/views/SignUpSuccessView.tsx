import { ProjectUrls } from "@/constants";
import { MailCheck } from "lucide-react";
import { MessageCard } from "@/components/shared/MessageCard";

export function SignUpSuccessView() {
  return (
    <MessageCard
      icon={MailCheck}
      title="Check Your Email"
      description="We've sent you a confirmation email. Please check your inbox and click the verification link to activate your account."
      additionalContent="If you don't see the email, please check your spam folder. The link will expire in 24 hours."
      linkHref={ProjectUrls.signIn}
      linkText="Back to sign in"
    />
  );
}
