"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatTimeFromSeconds } from "@/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DurationTrendChartProps {
  data: { date: string; duration_seconds: number }[];
}

export const DurationTrendChart = ({ data }: DurationTrendChartProps) => {
  const chartData = data.map((item) => ({
    date: dayjs(item.date).format("MMM D"),
    duration: Math.round(item.duration_seconds / 60),
    duration_raw: item.duration_seconds,
    tooltip_date: dayjs(item.date).format("MMM D, YYYY"),
  }));

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium">
            Workout Duration Trend
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Shows how your workout duration has changed over time
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
              No data available yet. Complete workouts to see your trend.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={{
              duration: { color: "var(--primary)" },
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorDuration"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis unit=" min" tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        const item = chartData.find(
                          (i) => i.duration === Number(value)
                        );
                        return item
                          ? formatTimeFromSeconds(item.duration_raw)
                          : `${value} min`;
                      }}
                      labelFormatter={(value) => {
                        const item = chartData.find((i) => i.date === value);
                        return item ? item.tooltip_date : value;
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="duration"
                  stroke="var(--primary)"
                  fillOpacity={1}
                  fill="url(#colorDuration)"
                  name="Duration"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
