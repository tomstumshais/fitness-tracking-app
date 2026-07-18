import { configureStore } from "@reduxjs/toolkit";
import exercisesReducer from "../features/exercises/exercisesSlice.ts";

export const createAppStore = () =>
  configureStore({
    reducer: { exercises: exercisesReducer },
  });

export const store = createAppStore();
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
