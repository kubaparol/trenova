"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkoutsByPlanChartProps {
  data: { plan_name: string; count: number }[];
}

export const WorkoutsByPlanChart = ({ data }: WorkoutsByPlanChartProps) => {
  const chartData = data.map((item) => ({
    name:
      item.plan_name.length > 15
        ? `${item.plan_name.substring(0, 15)}...`
        : item.plan_name,
    count: item.count,
    original_name: item.plan_name,
  }));

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium">
            Workouts by Plan
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Distribution of your completed workouts across different
                  training plans
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground text-sm">
              No data available yet. Complete workouts to see your distribution.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={{
              count: { color: "hsl(var(--primary))" },
            }}
          >
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              layout="vertical"
              height={300}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      `${value} workout${Number(value) !== 1 ? "s" : ""}`,
                      "Count",
                    ]}
                    labelFormatter={(value) => {
                      const item = chartData.find((i) => i.name === value);
                      return item ? item.original_name : value;
                    }}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                name="Workout Count"
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
