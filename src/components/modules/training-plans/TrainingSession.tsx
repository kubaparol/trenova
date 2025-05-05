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
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  FastForward,
  Loader2,
  LogOut,
  Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number; // Percentage (0-100)
  strokeWidth?: number;
  size?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  strokeWidth = 4,
  size = 60, // Adjust size as needed
  className,
  ...props
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      {...props}
    >
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor" // Use text color for theme compatibility
        strokeWidth={strokeWidth}
        fill="transparent"
        className="text-muted" // Background track color
      />
      {/* Progress Arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor" // Use text color for theme compatibility
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} // Start from the top
        className="text-info transition-[stroke-dashoffset] duration-300 ease-linear" // Progress color and transition
        strokeLinecap="round" // Optional: Makes the ends rounded
      />
    </svg>
  );
};
// END NEW

type SessionState = "loading" | "exercising" | "resting" | "finished";

interface TrainingSessionProps {
  id: string;
  exercises: Exercise[];
  dayName: string;
  onCompleteSession: (durationSeconds: number) => Promise<void>;
}

export function TrainingSession(props: TrainingSessionProps) {
  const { id, exercises: initialExercises, dayName, onCompleteSession } = props;

  const router = useRouter();

  const [autoAnimate] = useAutoAnimate();

  // State management
  const [orderedExercises, setOrderedExercises] = useState<Exercise[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [completedMask, setCompletedMask] = useState<boolean[]>([]);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(0);
  const [initialRestTime, setInitialRestTime] = useState<number>(0);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [isSkippingRest, setIsSkippingRest] = useState(false);

  // References
  const sessionStartTime = useRef<number>(Date.now());
  const sessionTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const restTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const activeExerciseRef = useRef<HTMLDivElement>(null);
  const restTimeRef = useRef(restTimeRemaining);

  // Initialize the session
  useEffect(() => {
    // Initialize ordered exercises and completion mask based on props
    setOrderedExercises([...initialExercises]);
    setCompletedMask(new Array(initialExercises.length).fill(false));

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
  }, [initialExercises]);

  // Update restTimeRef whenever restTimeRemaining changes
  useEffect(() => {
    restTimeRef.current = restTimeRemaining;
  }, [restTimeRemaining]);

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

    const currentExercise = orderedExercises[activeExerciseIndex];
    const totalSets = currentExercise.sets || 1;
    const isLastExercise = activeExerciseIndex === orderedExercises.length - 1;
    const isLastSetOfExercise = currentSet === totalSets;

    if (isLastSetOfExercise) {
      // Mark current exercise as complete in the progress tracker
      const updatedCompletedMask = [...completedMask];
      updatedCompletedMask[activeExerciseIndex] = true;
      setCompletedMask(updatedCompletedMask);

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
      router.push(ProjectUrls.trainingPlan(id));
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
    if (orderedExercises.length === 0) return 0;
    const completedCount = completedMask.filter(Boolean).length;
    return (completedCount / orderedExercises.length) * 100;
  };

  // Render exercise status indicator
  const renderExerciseStatus = (index: number) => {
    if (completedMask[index]) {
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
    // Prevent skipping if not resting, already skipping, or no timer running
    if (
      sessionState !== "resting" ||
      isSkippingRest ||
      !restTimerInterval.current
    ) {
      return;
    }

    setIsSkippingRest(true);

    // Clear the normal (1-second) interval
    clearInterval(restTimerInterval.current);
    restTimerInterval.current = null;

    const skipAnimationDuration = 500; // ms
    const updatesPerInterval = 20; // How many updates per second (smoothness)
    const intervalTime = 1000 / updatesPerInterval; // ms between updates
    const startTime = Date.now();
    const initialSkipTime = restTimeRef.current; // Get the time remaining when clicked

    // Start the fast interval for animation
    restTimerInterval.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / skipAnimationDuration, 1);
      const newTime = Math.max(0, Math.round(initialSkipTime * (1 - progress)));

      setRestTimeRemaining(newTime);

      // Animation finished
      if (progress >= 1) {
        clearInterval(restTimerInterval.current!);
        restTimerInterval.current = null;
        setIsSkippingRest(false);
        setSessionState("exercising");
        setCurrentSet((prevSet) => prevSet + 1); // Move to the next set
        // No need to reset restTimeRemaining here, it's already 0
        // No need to reset initialRestTime, it's set in startRestPeriod
      }
    }, intervalTime);
  };

  // --- START NEW: Exercise Reordering Logic ---
  const moveExercise = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Basic validation (should be covered by button disabled state, but good practice)
    if (
      targetIndex < 0 ||
      targetIndex >= orderedExercises.length ||
      index === activeExerciseIndex ||
      targetIndex === activeExerciseIndex ||
      completedMask[index] ||
      completedMask[targetIndex]
    ) {
      return;
    }

    const newOrder = [...orderedExercises];
    const newCompletedMask = [...completedMask];

    // Swap exercises
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    // Swap corresponding completion status
    [newCompletedMask[index], newCompletedMask[targetIndex]] = [
      newCompletedMask[targetIndex],
      newCompletedMask[index],
    ];

    setOrderedExercises(newOrder);
    setCompletedMask(newCompletedMask);

    // Note: activeExerciseIndex doesn't need adjustment here because
    // we prevent moving the active exercise or swapping with it.
  };
  // --- END NEW: Exercise Reordering Logic ---

  return (
    <>
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
          {completedMask.filter(Boolean).length} of {orderedExercises.length}{" "}
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
            ? "max-h-[250px] opacity-100 mb-6"
            : "max-h-0 opacity-0"
        }`}
      >
        <Card className="border-info/50 py-0">
          <div className="p-4">
            {/* Rest Timer Content - Updated */}
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <div className="flex items-center gap-2 text-info-foreground">
                <Timer className="h-5 w-5" />
                <h3 className="font-medium">Rest Time</h3>
              </div>

              <div className="relative">
                <CircularProgress
                  value={restProgressPercentage}
                  size={80}
                  strokeWidth={6}
                />
                <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-info-foreground">
                  {restTimeRemaining}s
                </span>
              </div>

              <p className="text-sm text-info-foreground text-center">
                Rest before next set of:{" "}
                {orderedExercises[activeExerciseIndex]?.name || ""}
              </p>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleSkipRest}
                variant="secondary"
                size="sm"
                disabled={isSkippingRest}
              >
                <FastForward className="mr-2 h-4 w-4" />
                {isSkippingRest ? "Skipping..." : "Skip Rest"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Exercise list */}
      <ScrollArea className="mb-6 px-1">
        <div ref={autoAnimate} className="space-y-3">
          {orderedExercises.map((exercise, index) => {
            const isActive = index === activeExerciseIndex;
            const isCompleted = completedMask[index];
            const isClickable = isActive && sessionState === "exercising";

            // Determine if move buttons should be enabled
            const canMove = !isActive && !isCompleted;
            const canMoveUp =
              canMove &&
              index > 0 &&
              !completedMask[index - 1] && // Cannot swap with completed
              activeExerciseIndex !== index - 1; // Cannot swap with active
            const canMoveDown =
              canMove &&
              index < orderedExercises.length - 1 &&
              !completedMask[index + 1] && // Cannot swap with completed
              activeExerciseIndex !== index + 1; // Cannot swap with active

            return (
              <div
                key={exercise.name}
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
                  {canMove && (
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveExercise(index, "up")}
                        disabled={!canMoveUp}
                        className="h-7 w-7"
                        aria-label={`Move ${exercise.name} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveExercise(index, "down")}
                        disabled={!canMoveDown}
                        className="h-7 w-7"
                        aria-label={`Move ${exercise.name} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
                      Current Set: {currentSet} / {exercise.sets || 1}
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
              Continue Training
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLeave}
              disabled={isCompletingSession}
            >
              Leave Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
