import { configureStore } from "@reduxjs/toolkit";
import eventsReducer from "../features/events/eventsSlice.ts";
import exercisesReducer from "../features/exercises/exercisesSlice.ts";
import workoutsReducer from "../features/workouts/workoutsSlice.ts";

export const createAppStore = () =>
  configureStore({
    reducer: {
      events: eventsReducer,
      exercises: exercisesReducer,
      workouts: workoutsReducer,
    },
  });

export const store = createAppStore();
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
