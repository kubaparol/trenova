import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeFromSeconds } from "@/utils";
import { Calendar, HelpCircle } from "lucide-react";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProjectUrls } from "@/constants";

interface LastSessionCardProps {
  lastSession?: {
    plan_id: string;
    plan_name: string;
    completed_at: string;
    duration_seconds: number;
  } | null;
}

export const LastSessionCard = ({ lastSession }: LastSessionCardProps) => {
  return (
    <Card className="gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium">Last Workout</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Details of your most recent completed workout session
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold line-clamp-1">
          {lastSession ? (
            <Button asChild size="lg" variant="link" className="px-0 text-2xl">
              <Link href={ProjectUrls.trainingPlan(lastSession.plan_id)}>
                {lastSession.plan_name}
              </Link>
            </Button>
          ) : (
            "No data yet"
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {lastSession
            ? `${dayjs(lastSession.completed_at).format(
                "MMM D, YYYY"
              )} • ${formatTimeFromSeconds(lastSession.duration_seconds)}`
            : "Complete your first workout to see your data here"}
        </p>
      </CardContent>
    </Card>
  );
};
