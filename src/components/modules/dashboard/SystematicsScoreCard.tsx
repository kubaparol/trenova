import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SystematicsScoreCardProps {
  sessions: number;
  score: "very_good" | "good" | "average" | "poor";
}

export const SystematicsScoreCard = ({
  sessions,
  score,
}: SystematicsScoreCardProps) => {
  const getScoreInfo = (score: string) => {
    switch (score) {
      case "very_good":
        return { text: "Excellent", color: "text-green-600" };
      case "good":
        return { text: "Good", color: "text-emerald-600" };
      case "average":
        return { text: "Average", color: "text-amber-600" };
      case "poor":
        return { text: "Needs Improvement", color: "text-rose-600" };
      default:
        return { text: "Unrated", color: "text-gray-600" };
    }
  };

  const scoreInfo = getScoreInfo(score);

  const getScoreDescription = (score: string) => {
    switch (score) {
      case "very_good":
        return "You're maintaining an excellent workout schedule!";
      case "good":
        return "You're doing well with your workout routine.";
      case "average":
        return "Your workout consistency could be improved.";
      case "poor":
        return "Try to increase your workout frequency for better results.";
      default:
        return "Complete more workouts to get a consistency rating.";
    }
  };

  return (
    <Card className="gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium">Consistency</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{getScoreDescription(score)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${scoreInfo.color}`}>
          {scoreInfo.text}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {sessions} workout{sessions !== 1 ? "s" : ""} in the last 14 days
        </p>
      </CardContent>
    </Card>
  );
};
