import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeFromSeconds } from "@/utils";
import { History, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrainingSummaryCardProps {
  completedThisWeek: number;
  totalDurationSeconds: number;
  longestDurationSeconds: number;
  averageDurationSeconds: number;
}

export const TrainingSummaryCard = ({
  completedThisWeek,
  totalDurationSeconds,
  longestDurationSeconds,
  averageDurationSeconds,
}: TrainingSummaryCardProps) => {
  return (
    <Card className="col-span-full gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium">Workout Summary</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Key statistics from your workout history
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <History className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-lg font-semibold">
              {completedThisWeek} workout{completedThisWeek !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Time</p>
            <p className="text-lg font-semibold">
              {formatTimeFromSeconds(totalDurationSeconds)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Longest Workout</p>
            <p className="text-lg font-semibold">
              {formatTimeFromSeconds(longestDurationSeconds)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Average Time</p>
            <p className="text-lg font-semibold">
              {formatTimeFromSeconds(averageDurationSeconds)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
