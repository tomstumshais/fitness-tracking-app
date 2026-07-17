import { configureStore, createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: { storageReady: false },
  reducers: {
    storageLoaded(state) {
      state.storageReady = true;
    },
  },
});

export const { storageLoaded } = appSlice.actions;

export const createAppStore = () =>
  configureStore({
    reducer: { app: appSlice.reducer },
  });

export const store = createAppStore();
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
