import type { ResistanceExerciseEntry } from "../../../domain/fitness.ts";
import { getProgressSummary } from "../resistanceProgress.ts";

interface Props {
  exercise: ResistanceExerciseEntry;
  previous?: ResistanceExerciseEntry;
}

export function ResistanceProgressStatus({ exercise, previous }: Props) {
  const progress = getProgressSummary(exercise, previous);
  return (
    <div
      aria-label={`${exercise.exerciseName} progress`}
      className="resistance-progress-status"
    >
      <span className={`progress-label ${progress.tone}`}>
        {progress.label}
      </span>
      <span className="resistance-progress-detail">· {progress.detail}</span>
    </div>
  );
}
