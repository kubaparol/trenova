"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectUrls } from "@/constants";
import { Exercise } from "@/types";
import { formatDuration } from "@/utils";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DoorOpen,
  FastForward,
  Loader2,
  LogOut,
  Play,
  Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type SessionState = "loading" | "exercising" | "resting" | "finished";

interface TrainingSessionProps {
  id: string;
  exercises: Exercise[];
  dayName: string;
  onCompleteSession: (durationSeconds: number) => Promise<void>;
}

export function TrainingSession(props: TrainingSessionProps) {
  const { id, exercises, dayName, onCompleteSession } = props;

  const router = useRouter();

  // State management
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<boolean[]>([]);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(0);
  const [initialRestTime, setInitialRestTime] = useState<number>(0);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [currentSet, setCurrentSet] = useState<number>(1);

  // References
  const sessionStartTime = useRef<number>(Date.now());
  const sessionTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const restTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const activeExerciseRef = useRef<HTMLDivElement>(null);

  // Initialize the session
  useEffect(() => {
    // Initialize completed exercises array with all false
    setCompletedExercises(new Array(exercises.length).fill(false));

    // Start session timer
    sessionStartTime.current = Date.now();
    sessionTimerInterval.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - sessionStartTime.current) / 1000
      );
      setSessionDuration(elapsedSeconds);
    }, 1000);

    // Set initial state to exercising
    setSessionState("exercising");

    // Clean up on unmount
    return () => {
      if (sessionTimerInterval.current)
        clearInterval(sessionTimerInterval.current);
      if (restTimerInterval.current) clearInterval(restTimerInterval.current);
    };
  }, [exercises]);

  // Scroll to active exercise when it changes
  useEffect(() => {
    if (activeExerciseRef.current) {
      activeExerciseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeExerciseIndex]);

  // Handle exercise completion
  const handleCompleteSet = () => {
    if (sessionState !== "exercising") return;

    const currentExercise = exercises[activeExerciseIndex];
    const totalSets = currentExercise.sets;
    const isLastExercise = activeExerciseIndex === exercises.length - 1;
    const isLastSetOfExercise = currentSet === totalSets;

    if (isLastSetOfExercise) {
      // Mark current exercise as complete in the progress tracker
      const updatedCompletedExercises = [...completedExercises];
      updatedCompletedExercises[activeExerciseIndex] = true;
      setCompletedExercises(updatedCompletedExercises);

      // Check if this is the last exercise of the session
      if (isLastExercise) {
        handleCompleteSession();
      } else {
        // Move to the first set of the next exercise, no rest
        setActiveExerciseIndex(activeExerciseIndex + 1);
        setCurrentSet(1); // Reset set counter for new exercise
        setSessionState("exercising"); // Ensure state is exercising
      }
    } else {
      // Not the last set, start rest period if applicable
      const restTime = currentExercise.rest_time_seconds;
      if (restTime > 0) {
        startRestPeriod(restTime);
      } else {
        // No rest needed, move to the next set immediately
        setCurrentSet(currentSet + 1);
      }
    }
  };

  // Start rest period (between sets)
  const startRestPeriod = (seconds: number) => {
    setSessionState("resting");
    setRestTimeRemaining(seconds);
    setInitialRestTime(seconds);

    restTimerInterval.current = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          // Rest period finished
          clearInterval(restTimerInterval.current!);
          setSessionState("exercising");
          setCurrentSet((prevSet) => prevSet + 1); // Move to the next set
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle session completion
  const handleCompleteSession = async () => {
    setIsCompletingSession(true);

    // Stop all timers
    if (sessionTimerInterval.current)
      clearInterval(sessionTimerInterval.current);
    if (restTimerInterval.current) clearInterval(restTimerInterval.current);

    // Set state to finished
    setSessionState("finished");

    try {
      await onCompleteSession(sessionDuration);

      // Show success message
      toast.success("Training session completed!", {
        description: `Total duration: ${formatDuration(sessionDuration)}`,
      });

      router.push(ProjectUrls.trainingPlan(id));
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete session. Please try again.");
    } finally {
      setIsCompletingSession(false);
    }
  };

  // Handle leave confirmation
  const handleLeaveClick = () => {
    if (sessionState === "finished") {
      router.push(ProjectUrls.trainingPlans);
      return;
    }

    setIsLeaveDialogOpen(true);
  };

  const handleConfirmLeave = () => {
    setIsLeaveDialogOpen(false);
    router.push(ProjectUrls.trainingPlan(id));
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const completedCount = completedExercises.filter(Boolean).length;
    return (completedCount / exercises.length) * 100;
  };

  // Render exercise status indicator
  const renderExerciseStatus = (index: number) => {
    if (completedExercises[index]) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (index === activeExerciseIndex) {
      return (
        <div className="h-5 w-5 rounded-full bg-primary animate-pulse"></div>
      );
    }
    return (
      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
    );
  };

  // Render rest timer progress bar
  const restProgressPercentage =
    initialRestTime > 0
      ? ((initialRestTime - restTimeRemaining) / initialRestTime) * 100
      : 0;

  const handleSkipRest = () => {
    if (sessionState !== "resting") return;

    // Clear the rest timer
    if (restTimerInterval.current) {
      clearInterval(restTimerInterval.current);
      restTimerInterval.current = null; // Clear the ref
    }

    // Move to the next set immediately
    setSessionState("exercising");
    setCurrentSet(currentSet + 1); // Go to next set
    setRestTimeRemaining(0); // Reset rest time
    setInitialRestTime(0); // Reset initial rest time
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">{dayName}</h1>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg">
              {formatDuration(sessionDuration)}
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-muted rounded-full h-2.5 mb-2">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="text-sm text-muted-foreground text-right">
          {completedExercises.filter(Boolean).length} of {exercises.length}{" "}
          completed
        </div>
      </div>

      {/* Warning alert */}
      <Alert variant="info" className="mb-6">
        <AlertTriangle className="size-4" />
        <AlertTitle>
          Leaving this page before completing all exercises will result in
          losing your progress for this session.
        </AlertTitle>
      </Alert>

      {/* Rest timer - always in DOM but animated */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          sessionState === "resting"
            ? "max-h-[200px] opacity-100 mb-6"
            : "max-h-0 opacity-0"
        }`}
      >
        <Card className="border-info/50 py-0">
          <div className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-info" />
                  <h3 className="font-medium text-info-foreground">
                    Rest Time
                  </h3>
                </div>

                <span className="font-mono text-lg text-info-foreground">
                  {restTimeRemaining}s
                </span>
              </div>

              <Progress value={restProgressPercentage} />

              <p className="text-sm text-info-foreground mt-2">
                Rest before next set of:{" "}
                {exercises[activeExerciseIndex]?.name || ""}
              </p>
            </div>

            <div className="mt-3 flex justify-end">
              <Button onClick={handleSkipRest} variant="secondary" size="sm">
                <FastForward className="mr-2 h-4 w-4" />
                Skip Rest
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Exercise list */}
      <ScrollArea className="mb-6 px-1">
        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            const isActive = index === activeExerciseIndex;
            const isCompleted = completedExercises[index];
            const isClickable = isActive && sessionState === "exercising";

            return (
              <div
                key={index}
                ref={isActive ? activeExerciseRef : null}
                className={`p-4 rounded-lg border transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-md"
                    : isCompleted
                    ? "border-success/30 bg-success/10"
                    : "border bg-card"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {renderExerciseStatus(index)}
                  <h3 className="font-medium">{exercise.name}</h3>
                </div>

                <div className="flex flex-wrap gap-2 ml-8 text-sm">
                  <span className="px-2 py-1 bg-muted rounded-full">
                    {exercise.sets} sets
                  </span>
                  {exercise.repetitions && (
                    <span className="px-2 py-1 bg-muted rounded-full">
                      {exercise.repetitions} reps
                    </span>
                  )}
                  {exercise.duration_seconds && (
                    <span className="px-2 py-1 bg-muted rounded-full">
                      {exercise.duration_seconds}s duration
                    </span>
                  )}
                  <span className="px-2 py-1 bg-muted rounded-full">
                    {exercise.rest_time_seconds}s rest (per set)
                  </span>
                </div>

                {isClickable && (
                  <div className="mt-4 ml-8 space-y-2">
                    <p className="text-sm font-medium text-primary">
                      Current Set: {currentSet} / {exercise.sets}
                    </p>
                    <Button
                      onClick={handleCompleteSet}
                      variant="default"
                      disabled={isCompletingSession}
                    >
                      Complete Set {currentSet}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Action buttons */}
      <div className="flex justify-between">
        {sessionState !== "finished" && (
          <Button
            variant="outline"
            onClick={handleLeaveClick}
            disabled={isCompletingSession}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Leave Session
          </Button>
        )}

        {sessionState === "finished" && (
          <Button
            onClick={() => router.push(ProjectUrls.trainingPlan(id))}
            variant="default"
            className="ml-auto"
            disabled={isCompletingSession}
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving session...
          </Button>
        )}
      </div>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Training Session?</DialogTitle>
            <DialogDescription>
              Leaving now will lose all your session progress. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsLeaveDialogOpen(false)}
              disabled={isCompletingSession}
            >
              <Play className="mr-2 h-4 w-4" />
              Continue Training
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLeave}
              disabled={isCompletingSession}
            >
              <DoorOpen className="mr-2 h-4 w-4" />
              Leave Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
