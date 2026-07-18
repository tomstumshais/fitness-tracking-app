import type {
  EditableFitnessEvent,
  FitnessEvent,
  ResistanceEvent,
} from "../../../domain/fitness.ts";

interface Props {
  event: FitnessEvent;
  onDelete: (event: FitnessEvent) => void;
  onDuplicate: (event: ResistanceEvent) => void;
  onEdit: (event: EditableFitnessEvent) => void;
  onEditResistance: (event: ResistanceEvent) => void;
  onSaveTemplate: (event: ResistanceEvent) => void;
}

export function EventActions(props: Props) {
  const event = props.event;
  const specificActions = event.type === "resistance"
    ? (
      <>
        <button onClick={() => props.onEditResistance(event)} type="button">
          Edit
        </button>
        <button onClick={() => props.onDuplicate(event)} type="button">
          Duplicate
        </button>
        <button onClick={() => props.onSaveTemplate(event)} type="button">
          Save as template
        </button>
      </>
    )
    : (
      <button onClick={() => props.onEdit(event)} type="button">
        Edit
      </button>
    );
  return (
    <div className="event-actions">
      {specificActions}
      <button
        className="danger-text"
        onClick={() => props.onDelete(event)}
        type="button"
      >
        Delete
      </button>
    </div>
  );
}
