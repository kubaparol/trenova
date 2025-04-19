import { ProjectUrls } from "@/constants";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function ResetPasswordSentView() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <CardTitle>Password Reset Email Sent</CardTitle>

        <CardDescription>
          Check your email for a link to reset your password. If it doesn&apos;t
          appear within a few minutes, check your spam folder.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email? Make sure you&apos;ve entered the
          correct email address or check your spam folder.
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <Link href={ProjectUrls.signIn}>Back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
