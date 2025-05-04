import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeeklyProgressCardProps {
  completed: number;
  goal: number;
}

export const WeeklyProgressCard = ({
  completed,
  goal,
}: WeeklyProgressCardProps) => {
  const progressPercentage =
    goal > 0 ? Math.min(100, (completed / goal) * 100) : 0;

  const remainingWorkouts = Math.max(0, goal - completed);

  return (
    <Card className="gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Your weekly goal progress - track how close you are to meeting
                  your target
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">
          {completed} of {goal} workouts
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {progressPercentage < 100
            ? `${remainingWorkouts} workout${
                remainingWorkouts !== 1 ? "s" : ""
              } remaining to reach your goal`
            : "Weekly goal achieved! 🎉"}
        </p>
      </CardContent>
    </Card>
  );
};
