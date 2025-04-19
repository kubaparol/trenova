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
import { ProjectUrls } from "@/constants";

export function ResetPasswordSuccessView() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <CardTitle>Password Reset Successful</CardTitle>

        <CardDescription>
          Your password has been successfully changed. You can now sign in using
          your new password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-center text-sm text-muted-foreground">
          For security purposes, you&apos;ve been logged out of all your active
          sessions.
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <Link href={ProjectUrls.signIn}>Go to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
