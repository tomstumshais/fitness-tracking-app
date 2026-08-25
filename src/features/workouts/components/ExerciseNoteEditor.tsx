import { useId, useState } from "react";
import { EXERCISE_NOTE_MAX_LENGTH } from "../../../domain/fitness.ts";

interface Props {
  exerciseName: string;
  notes?: string;
  onChange: (notes: string) => void;
  previousNotes?: string;
}

export function ExerciseNoteEditor(props: Props) {
  const inputId = useId();
  const [editing, setEditing] = useState(false);
  return (
    <div className="exercise-notes">
      {props.previousNotes && (
        <div className="previous-exercise-note">
          <span>Previous note</span>
          <p>{props.previousNotes}</p>
        </div>
      )}
      {editing
        ? (
          <div className="exercise-note-editor">
            <label htmlFor={inputId}>
              Note for this workout
            </label>
            <textarea
              aria-label={`${props.exerciseName} note`}
              id={inputId}
              maxLength={EXERCISE_NOTE_MAX_LENGTH}
              onChange={(event) => props.onChange(event.target.value)}
              placeholder="Technique, discomfort, setup or a reminder for next time"
              rows={3}
              value={props.notes ?? ""}
            />
            <button
              className="exercise-note-done"
              onClick={() => setEditing(false)}
              type="button"
            >
              Done
            </button>
          </div>
        )
        : props.notes
        ? (
          <div className="current-exercise-note">
            <div>
              <span>Workout note</span>
              <p>{props.notes}</p>
            </div>
            <button onClick={() => setEditing(true)} type="button">
              Edit note
            </button>
          </div>
        )
        : (
          <button
            className="exercise-note-add"
            onClick={() => setEditing(true)}
            type="button"
          >
            Add note
          </button>
        )}
    </div>
  );
}
