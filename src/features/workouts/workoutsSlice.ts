import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import {
  completeWorkoutDraft,
  createWorkoutDraft,
  deleteWorkoutDraft,
  listWorkoutDrafts,
  saveWorkoutDraft,
} from "../../data/workoutRepository.ts";
import type { ResistanceWorkoutDraft } from "../../domain/fitness.ts";
import { eventUpserted } from "../events/eventsSlice.ts";

const workoutsAdapter = createEntityAdapter<ResistanceWorkoutDraft>({
  sortComparer: (left, right) => left.createdAt.localeCompare(right.createdAt),
});

export const loadWorkoutDrafts = createAsyncThunk(
  "workouts/load",
  listWorkoutDrafts,
);
export const startWorkout = createAsyncThunk(
  "workouts/start",
  ({ date, name }: { date: string; name: string }) =>
    createWorkoutDraft(date, name),
);
export const persistWorkout = createAsyncThunk(
  "workouts/persist",
  saveWorkoutDraft,
);
export const discardWorkout = createAsyncThunk(
  "workouts/discard",
  deleteWorkoutDraft,
);
export const finishWorkout = createAsyncThunk(
  "workouts/finish",
  async (id: string, { dispatch }) => {
    const result = await completeWorkoutDraft(id);
    dispatch(eventUpserted(result.event));
    return result.draftId;
  },
);

const workoutsSlice = createSlice({
  name: "workouts",
  initialState: workoutsAdapter.getInitialState({
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  }),
  reducers: {
    draftUpdated: workoutsAdapter.upsertOne,
  },
  extraReducers(builder) {
    builder
      .addCase(loadWorkoutDrafts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadWorkoutDrafts.fulfilled, (state, action) => {
        workoutsAdapter.setAll(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(loadWorkoutDrafts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Could not load workout drafts";
      })
      .addCase(startWorkout.fulfilled, workoutsAdapter.addOne)
      .addCase(persistWorkout.fulfilled, workoutsAdapter.upsertOne)
      .addCase(discardWorkout.fulfilled, workoutsAdapter.removeOne)
      .addCase(finishWorkout.fulfilled, workoutsAdapter.removeOne);
  },
});

export const { draftUpdated } = workoutsSlice.actions;
type StateWithWorkouts = { workouts: ReturnType<typeof workoutsSlice.reducer> };
const selectors = workoutsAdapter.getSelectors<StateWithWorkouts>((state) =>
  state.workouts
);
export const selectAllWorkoutDrafts = selectors.selectAll;
export const selectWorkoutById = selectors.selectById;
export const selectWorkoutsStatus = (state: StateWithWorkouts) =>
  state.workouts.status;
export default workoutsSlice.reducer;
