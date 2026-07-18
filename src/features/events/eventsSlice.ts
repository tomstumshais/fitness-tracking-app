import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import {
  createFitnessEvent,
  deleteFitnessEvent as removeFitnessEvent,
  listFitnessEvents,
  updateFitnessEvent,
} from "../../data/eventRepository.ts";
import type {
  EditableFitnessEventInput,
  FitnessEvent,
} from "../../domain/fitness.ts";

const eventsAdapter = createEntityAdapter<FitnessEvent>({
  sortComparer: (left, right) =>
    left.date.localeCompare(right.date) ||
    left.createdAt.localeCompare(right.createdAt),
});

export const loadEvents = createAsyncThunk("events/load", listFitnessEvents);

export const saveEvent = createAsyncThunk(
  "events/save",
  ({ id, input }: { id?: string; input: EditableFitnessEventInput }) =>
    id ? updateFitnessEvent(id, input) : createFitnessEvent(input),
);

export const deleteEvent = createAsyncThunk(
  "events/delete",
  removeFitnessEvent,
);

const eventsSlice = createSlice({
  name: "events",
  initialState: eventsAdapter.getInitialState({
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  }),
  reducers: {
    eventUpserted: eventsAdapter.upsertOne,
  },
  extraReducers(builder) {
    builder
      .addCase(loadEvents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        eventsAdapter.setAll(state, action.payload);
        state.status = "succeeded";
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Could not load fitness events";
      })
      .addCase(saveEvent.fulfilled, eventsAdapter.upsertOne)
      .addCase(deleteEvent.fulfilled, eventsAdapter.removeOne);
  },
});

export const { eventUpserted } = eventsSlice.actions;

type StateWithEvents = { events: ReturnType<typeof eventsSlice.reducer> };
const selectors = eventsAdapter.getSelectors<StateWithEvents>((state) =>
  state.events
);

export const selectAllEvents = selectors.selectAll;
export const selectEventsStatus = (state: StateWithEvents) =>
  state.events.status;
export const selectEventsError = (state: StateWithEvents) => state.events.error;
export default eventsSlice.reducer;
