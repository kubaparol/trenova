import { LucideIcon } from "lucide-react";
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

interface MessageCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  additionalContent?: string;
  linkHref: string;
  linkText: string;
}

export function MessageCard({
  icon: Icon,
  iconClassName = "text-primary",
  title,
  description,
  additionalContent,
  linkHref,
  linkText,
}: MessageCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Icon className={`h-12 w-12 ${iconClassName}`} />
        </div>

        <CardTitle>{title}</CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {additionalContent && (
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            {additionalContent}
          </div>
        </CardContent>
      )}

      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <Link href={linkHref}>{linkText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
