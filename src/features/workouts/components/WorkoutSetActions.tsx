interface Props {
  onAdd: () => void;
  onDoneRemoving: () => void;
  onStartRemoving: () => void;
  removing: boolean;
  setCount: number;
}

export function WorkoutSetActions(props: Props) {
  if (props.removing) {
    return (
      <div className="set-actions removing">
        <button
          className="secondary-button"
          onClick={props.onDoneRemoving}
          type="button"
        >
          ✓ Done removing
        </button>
      </div>
    );
  }
  return (
    <div className="set-actions">
      <button className="add-set-button" onClick={props.onAdd} type="button">
        ＋ Add set
      </button>
      {props.setCount > 1 && (
        <button
          className="remove-sets-button"
          onClick={props.onStartRemoving}
          type="button"
        >
          − Remove sets
        </button>
      )}
    </div>
  );
}
