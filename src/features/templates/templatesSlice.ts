import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import {
  createTemplateFromEvent,
  deleteWorkoutTemplate,
  listWorkoutTemplates,
  renameWorkoutTemplate,
} from "../../data/templateRepository.ts";
import type { WorkoutTemplate } from "../../domain/fitness.ts";

const templatesAdapter = createEntityAdapter<WorkoutTemplate>({
  sortComparer: (left, right) => left.name.localeCompare(right.name),
});

export const loadTemplates = createAsyncThunk(
  "templates/load",
  listWorkoutTemplates,
);
export const saveWorkoutAsTemplate = createAsyncThunk(
  "templates/createFromEvent",
  ({ eventId, name }: { eventId: string; name: string }) =>
    createTemplateFromEvent(eventId, name),
);
export const renameTemplate = createAsyncThunk(
  "templates/rename",
  ({ id, name }: { id: string; name: string }) =>
    renameWorkoutTemplate(id, name),
);
export const removeTemplate = createAsyncThunk(
  "templates/delete",
  deleteWorkoutTemplate,
);

const templatesSlice = createSlice({
  name: "templates",
  initialState: templatesAdapter.getInitialState({
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
  }),
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loadTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadTemplates.fulfilled, (state, action) => {
        templatesAdapter.setAll(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(loadTemplates.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(saveWorkoutAsTemplate.fulfilled, templatesAdapter.addOne)
      .addCase(renameTemplate.fulfilled, templatesAdapter.upsertOne)
      .addCase(removeTemplate.fulfilled, templatesAdapter.removeOne);
  },
});

type StateWithTemplates = {
  templates: ReturnType<typeof templatesSlice.reducer>;
};
const selectors = templatesAdapter.getSelectors<StateWithTemplates>((state) =>
  state.templates
);
export const selectAllTemplates = selectors.selectAll;
export const selectTemplatesStatus = (state: StateWithTemplates) =>
  state.templates.status;
export default templatesSlice.reducer;
