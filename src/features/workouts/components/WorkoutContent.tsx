import { EmptyState } from "../../../components/ui/EmptyState.tsx";
import type {
  FitnessEvent,
  ResistanceSet,
  ResistanceWorkoutDraft,
} from "../../../domain/fitness.ts";
import { WorkoutExerciseList } from "./WorkoutExerciseList.tsx";

interface Props {
  draft: ResistanceWorkoutDraft;
  events: FitnessEvent[];
  onAdd: () => void;
  onChangeSets: (entryId: string, sets: ResistanceSet[]) => void;
  onRemove: (entryId: string) => void;
}

export function WorkoutContent(props: Props) {
  if (props.draft.exercises.length > 0) {
    return (
      <WorkoutExerciseList
        draft={props.draft}
        events={props.events}
        onAdd={props.onAdd}
        onChangeSets={props.onChangeSets}
        onRemove={props.onRemove}
      />
    );
  }
  return (
    <EmptyState
      action={
        <button className="primary-button" onClick={props.onAdd} type="button">
          ＋ Add first exercise
        </button>
      }
      description="Choose from your dumbbell, band and bodyweight exercise library."
      icon="🏋️"
      title="Build your workout"
    />
  );
}
