export function ExercisePageHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <>
      <div className="exercise-page-heading">
        <div>
          <p className="eyebrow">Exercise library</p>
          <h1>Dumbbells, bands & bodyweight</h1>
        </div>
        <button className="primary-button" onClick={onAdd} type="button">
          + Custom exercise
        </button>
      </div>
      <p className="page-intro">
        Choose home-friendly exercises or add your own. Band and bodyweight
        exercises are tracked by repetitions; dumbbells use kilograms per
        dumbbell.
      </p>
    </>
  );
}
