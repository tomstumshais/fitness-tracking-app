export type Equipment = "dumbbell" | "bodyweight";
export type ExerciseSource = "predefined" | "custom";
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "glutes"
  | "core"
  | "full-body";

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  muscleGroup: MuscleGroup;
  source: ExerciseSource;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomExerciseInput {
  name: string;
  equipment: Equipment;
  muscleGroup: MuscleGroup;
}

export type FitnessEventType = "cardio" | "running" | "walking" | "resistance";

interface BaseFitnessEvent {
  id: string;
  date: string;
  type: FitnessEventType;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistanceEvent extends BaseFitnessEvent {
  type: "running" | "walking";
  durationMinutes: number;
  distanceKm: number;
}

export interface CardioEvent extends BaseFitnessEvent {
  type: "cardio";
  name: string;
  durationMinutes: number;
  intensity: CardioIntensity;
}

export type CardioIntensity = "low" | "moderate" | "high";

export interface DistanceEventInput {
  type: "running" | "walking";
  date: string;
  durationMinutes: number;
  distanceKm: number;
  notes?: string;
}

export interface CardioEventInput {
  type: "cardio";
  date: string;
  name: string;
  durationMinutes: number;
  intensity: CardioIntensity;
  notes?: string;
}

export type EditableFitnessEvent = CardioEvent | DistanceEvent;
export type EditableFitnessEventInput = CardioEventInput | DistanceEventInput;

export interface ResistanceSet {
  id: string;
  weightKg: number | null;
  repetitions: number;
  completed: boolean;
}

export interface ResistanceExerciseEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  equipment: Equipment;
  sets: ResistanceSet[];
}

export interface ResistanceEvent extends BaseFitnessEvent {
  type: "resistance";
  name: string;
  exercises: ResistanceExerciseEntry[];
}

export type FitnessEvent = CardioEvent | DistanceEvent | ResistanceEvent;

export interface ResistanceWorkoutDraft {
  id: string;
  date: string;
  name: string;
  exercises: ResistanceExerciseEntry[];
  sourceEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  equipment: Equipment;
  setCount: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: WorkoutTemplateExercise[];
  createdAt: string;
  updatedAt: string;
}
