import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { CustomExerciseInput, Exercise } from "../../domain/fitness.ts";
import {
  createCustomExercise,
  deleteCustomExercise as removeCustomExercise,
  listExercises,
  updateCustomExercise,
} from "../../data/exerciseRepository.ts";

const exercisesAdapter = createEntityAdapter<Exercise>({
  sortComparer: (left, right) => left.name.localeCompare(right.name),
});

export const loadExercises = createAsyncThunk("exercises/load", listExercises);

export const saveCustomExercise = createAsyncThunk(
  "exercises/saveCustom",
  ({ id, input }: { id?: string; input: CustomExerciseInput }) =>
    id ? updateCustomExercise(id, input) : createCustomExercise(input),
);

export const deleteCustomExercise = createAsyncThunk(
  "exercises/deleteCustom",
  removeCustomExercise,
);

const exercisesSlice = createSlice({
  name: "exercises",
  initialState: exercisesAdapter.getInitialState({
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  }),
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loadExercises.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadExercises.fulfilled, (state, action) => {
        exercisesAdapter.setAll(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(loadExercises.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Could not load exercises";
      })
      .addCase(saveCustomExercise.fulfilled, exercisesAdapter.upsertOne)
      .addCase(deleteCustomExercise.fulfilled, exercisesAdapter.removeOne);
  },
});

type StateWithExercises = {
  exercises: ReturnType<typeof exercisesSlice.reducer>;
};
const selectors = exercisesAdapter.getSelectors<StateWithExercises>((state) =>
  state.exercises
);

export const selectAllExercises = selectors.selectAll;
export const selectExercisesStatus = (state: StateWithExercises) =>
  state.exercises.status;
export const selectExercisesError = (state: StateWithExercises) =>
  state.exercises.error;
export default exercisesSlice.reducer;
