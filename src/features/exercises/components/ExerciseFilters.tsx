export type ExerciseFilter = "all" | "dumbbell" | "bodyweight" | "custom";

const filters: { value: ExerciseFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "dumbbell", label: "Dumbbells" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "custom", label: "Custom" },
];

interface ExerciseFiltersProps {
  filter: ExerciseFilter;
  onFilterChange: (filter: ExerciseFilter) => void;
  onSearchChange: (search: string) => void;
  search: string;
}

export function ExerciseFilters(props: ExerciseFiltersProps) {
  return (
    <div className="exercise-tools">
      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Search exercises</span>
        <input
          onChange={(event) => props.onSearchChange(event.target.value)}
          placeholder="Search exercises"
          type="search"
          value={props.search}
        />
      </label>
      <div className="filter-chips" aria-label="Filter exercises">
        {filters.map(({ value, label }) => (
          <button
            aria-pressed={props.filter === value}
            className={`filter-chip${props.filter === value ? " active" : ""}`}
            key={value}
            onClick={() => props.onFilterChange(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
