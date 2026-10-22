export function ExercisePageHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <>
      <div className="exercise-page-heading">
        <div>
          <p className="eyebrow">Exercise library</p>
          <h1>Your home exercises</h1>
        </div>
        <button className="primary-button" onClick={onAdd} type="button">
          + Custom exercise
        </button>
      </div>
      <p className="page-intro">
        Choose dumbbell, barbell, band and bodyweight exercises or add your own.
        Log kg per dumbbell or total barbell weight, including the bar. Band and
        bodyweight exercises use repetitions.
      </p>
    </>
  );
}
