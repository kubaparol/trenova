import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function formatTimeFromSeconds(totalSeconds: number): string {
  // Handle invalid input gracefully
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "0s";
  }

  const dur = dayjs.duration(totalSeconds, "seconds");
  const hours = dur.hours();
  const minutes = dur.minutes();
  const seconds = dur.seconds();

  if (hours > 0) {
    // Format as Hh MMm SSs if hours > 0
    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");
    return `${hours}h ${paddedMinutes}m ${paddedSeconds}s`;
  } else if (minutes > 0) {
    // Format as Mm SSs if minutes > 0 and hours = 0
    const paddedSeconds = String(seconds).padStart(2, "0");
    return `${minutes}m ${paddedSeconds}s`;
  } else {
    // Format as Ss if only seconds are present
    return `${seconds}s`;
  }
}
