import React, { useState } from "react";
import { Calendar, Dumbbell, Heart, Timer, BarChart } from "lucide-react";

interface WorkoutDay {
  day: string;
  type: string;
  icon: React.ReactNode;
  exercises: string[];
  intensity: number;
  color: string;
}

const WorkoutPlanVisualization: React.FC = () => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const workoutWeek: WorkoutDay[] = [
    {
      day: "MON",
      type: "Strength",
      icon: <Dumbbell size={24} className="text-primary" />,
      exercises: ["Squats", "Bench Press", "Rows", "Shoulder Press"],
      intensity: 85,
      color: "bg-primary/80",
    },
    {
      day: "TUE",
      type: "Cardio",
      icon: <Heart size={24} className="text-accent-foreground" />,
      exercises: ["Running", "HIIT Intervals", "Cycling", "Stair Climber"],
      intensity: 70,
      color: "bg-accent",
    },
    {
      day: "WED",
      type: "Strength",
      icon: <Dumbbell size={24} className="text-primary" />,
      exercises: ["Deadlifts", "Pull-Ups", "Lunges", "Core Circuit"],
      intensity: 90,
      color: "bg-primary/80",
    },
    {
      day: "THU",
      type: "Rest",
      icon: <Timer size={24} className="text-accent-foreground" />,
      exercises: ["Active Recovery", "Stretching", "Mobility Work"],
      intensity: 20,
      color: "bg-accent",
    },
    {
      day: "FRI",
      type: "Strength",
      icon: <Dumbbell size={24} className="text-primary" />,
      exercises: ["Squats", "Overhead Press", "Rows", "Accessories"],
      intensity: 85,
      color: "bg-primary/80",
    },
    {
      day: "SAT",
      type: "Cardio",
      icon: <Heart size={24} className="text-accent-foreground" />,
      exercises: ["Trail Running", "Swimming", "Cycling"],
      intensity: 65,
      color: "bg-accent",
    },
    {
      day: "SUN",
      type: "Recovery",
      icon: <Timer size={24} className="text-accent-foreground" />,
      exercises: ["Yoga", "Foam Rolling", "Light Walking"],
      intensity: 90,
      color: "bg-accent",
    },
  ];

  return (
    <div className="relative bg-card/40 backdrop-blur-sm rounded-xl shadow-xl border border-primary/30">
      <div className="px-6 py-4 bg-gradient-to-r from-primary/90 rounded-t-xl to-primary/80 border-b border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <h3 className="text-white font-semibold">Weekly Plan</h3>
          </div>

          <div className="flex items-center gap-2">
            <BarChart size={20} />
            <span className=" text-sm">85% Optimal</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {workoutWeek.map((workoutDay, index) => (
            <div
              key={workoutDay.day}
              className={`relative cursor-pointer transition-all duration-300 ${
                hoveredDay === index
                  ? "scale-110 z-30"
                  : hoveredDay !== null
                  ? "scale-95 opacity-60"
                  : ""
              }`}
              onMouseEnter={() => setHoveredDay(index)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className="rounded-lg overflow-hidden shadow-md">
                <div className={`${workoutDay.color} px-2 py-2 text-center`}>
                  <div className="text-white font-bold text-sm">
                    {workoutDay.day}
                  </div>
                </div>
                <div className="bg-card/80 px-2 py-3 flex flex-col items-center">
                  <div className="mb-1">{workoutDay.icon}</div>
                  <div className="text-white text-xs font-medium">
                    {workoutDay.type}
                  </div>

                  {/* Intensity bar */}
                  <div className="w-full mt-2 bg-background/50 rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full ${
                        workoutDay.type === "Strength"
                          ? "bg-primary"
                          : workoutDay.type === "Cardio"
                          ? "bg-accent"
                          : "bg-secondary"
                      }`}
                      style={{ width: `${workoutDay.intensity}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Expanded workout details */}
              {hoveredDay === index && (
                <div
                  className="fixed transform -translate-x-1/2 mt-2 w-48 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-primary/30 p-3 z-50"
                  style={{
                    left: "50%",
                    top: "100%",
                  }}
                >
                  <h4 className="text-white font-semibold mb-2">
                    {workoutDay.type}
                  </h4>
                  <ul className="space-y-1">
                    {workoutDay.exercises.map((exercise, i) => (
                      <li
                        key={i}
                        className="text-muted-foreground text-xs flex items-center"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2"></span>
                        {exercise}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 bg-gradient-to-r rounded-b-xl from-primary/50 to-primary/60 border-t border-primary/20">
        <div className="flex justify-between items-center">
          <span className="text-xs">Personalized for your goals</span>
          <span className=" text-xs font-semibold">AI Optimized</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanVisualization;
