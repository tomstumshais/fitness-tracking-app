import type { Equipment, ResistanceSet } from "../../../domain/fitness.ts";
import {
  equipmentSetLabel,
  requiresWeight,
} from "../../../domain/equipment.ts";
import { formatPreviousSet } from "../resistanceProgress.ts";

interface Props {
  canRemove: boolean;
  equipment: Equipment;
  index: number;
  onChange: (set: ResistanceSet) => void;
  onRemove: () => void;
  previous?: ResistanceSet;
  set: ResistanceSet;
}

export function ResistanceSetRow(props: Props) {
  const updateNumber = (field: "weightKg" | "repetitions", value: string) => {
    const parsed = value === "" ? null : Number(value);
    props.onChange({
      ...props.set,
      [field]: field === "repetitions" ? parsed ?? 0 : parsed,
      completed: false,
    });
  };
  return (
    <div className={`set-row${props.set.completed ? " completed" : ""}`}>
      {props.canRemove
        ? (
          <button
            aria-label={`Remove set ${props.index + 1}`}
            className="remove-set-button"
            onClick={props.onRemove}
            title={`Remove set ${props.index + 1}`}
            type="button"
          >
            <span>{props.index + 1}</span>
            <span aria-hidden="true">×</span>
          </button>
        )
        : <span className="set-number">{props.index + 1}</span>}
      <span className="previous-set">
        {formatPreviousSet(props.previous, props.equipment)}
      </span>
      {!requiresWeight(props.equipment)
        ? (
          <span className="bodyweight-value">
            {equipmentSetLabel(props.equipment)}
          </span>
        )
        : (
          <input
            aria-label={`Set ${props.index + 1} kg per dumbbell`}
            inputMode="decimal"
            min="0.5"
            onChange={(event) => updateNumber("weightKg", event.target.value)}
            step="0.5"
            type="number"
            value={props.set.weightKg ?? ""}
          />
        )}
      <input
        aria-label={`Set ${props.index + 1} repetitions`}
        inputMode="numeric"
        min="1"
        onChange={(event) => updateNumber("repetitions", event.target.value)}
        type="number"
        value={props.set.repetitions || ""}
      />
      <button
        aria-label={`Mark set ${props.index + 1} ${
          props.set.completed ? "not done" : "done"
        }`}
        className="set-done"
        onClick={() =>
          props.onChange({ ...props.set, completed: !props.set.completed })}
        type="button"
      >
        {props.set.completed ? "✓" : "○"}
      </button>
    </div>
  );
}
