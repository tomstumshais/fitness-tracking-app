import { useEffect, useState } from "react";
import type {
  ResistanceExerciseEntry,
  ResistanceSet,
} from "../../../domain/fitness.ts";
import { requiresWeight } from "../../../domain/equipment.ts";
import { ResistanceSetRow } from "./ResistanceSetRow.tsx";
import { WorkoutSetActions } from "./WorkoutSetActions.tsx";

interface Props {
  entry: ResistanceExerciseEntry;
  onChangeSets: (sets: ResistanceSet[]) => void;
  previous?: ResistanceExerciseEntry;
}

export function WorkoutSetTable({ entry, onChangeSets, previous }: Props) {
  const [removing, setRemoving] = useState(false);
  const changeSet = (index: number, set: ResistanceSet) =>
    onChangeSets(
      entry.sets.map((current, itemIndex) =>
        itemIndex === index ? set : current
      ),
    );
  const addSet = () => {
    const last = entry.sets.at(-1);
    onChangeSets([...entry.sets, {
      id: crypto.randomUUID(),
      weightKg: last?.weightKg ?? null,
      repetitions: last?.repetitions ?? 0,
      completed: false,
    }]);
  };
  const removeSet = (id: string) => {
    const remaining = entry.sets.filter((set) => set.id !== id);
    onChangeSets(remaining);
    if (remaining.length === 1) setRemoving(false);
  };

  useEffect(() => {
    if (!removing) return;
    const exitOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && setRemoving(false);
    document.addEventListener("keydown", exitOnEscape);
    return () => document.removeEventListener("keydown", exitOnEscape);
  }, [removing]);

  return (
    <>
      <div
        aria-label={`${entry.exerciseName} sets`}
        className={`set-table${removing ? " removing" : ""}`}
        role="table"
      >
        <div className="set-header" role="row">
          <span>Set</span>
          <span>Previous</span>
          <span>{requiresWeight(entry.equipment) ? "kg" : "Load"}</span>
          <span>Reps</span>
          <span>{removing ? "Remove" : "Done"}</span>
        </div>
        {entry.sets.map((set, index) => (
          <ResistanceSetRow
            equipment={entry.equipment}
            index={index}
            key={set.id}
            onChange={(updated) => changeSet(index, updated)}
            onRemove={() => removeSet(set.id)}
            previous={previous?.sets[index]}
            removing={removing}
            set={set}
          />
        ))}
      </div>
      {requiresWeight(entry.equipment) && (
        <p className="weight-note">kg is the weight of each dumbbell</p>
      )}
      <WorkoutSetActions
        onAdd={addSet}
        onDoneRemoving={() => setRemoving(false)}
        onStartRemoving={() => setRemoving(true)}
        removing={removing}
        setCount={entry.sets.length}
      />
    </>
  );
}
