import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppBootstrap } from "../../app/AppBootstrap.tsx";
import { createAppStore } from "../../app/store.ts";
import { resetDatabaseForTests } from "../../data/database.ts";
import { DayPage } from "./DayPage.tsx";
import { WorkoutPage } from "../workouts/WorkoutPage.tsx";

function renderDay() {
  return render(
    <Provider store={createAppStore()}>
      <AppBootstrap>
        <MemoryRouter initialEntries={["/day/2026-07-18"]}>
          <Routes>
            <Route path="day/:date" element={<DayPage />} />
            <Route path="workout/:draftId" element={<WorkoutPage />} />
          </Routes>
        </MemoryRouter>
      </AppBootstrap>
    </Provider>,
  );
}

describe("daily fitness events", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(async () => {
    cleanup();
    vi.restoreAllMocks();
    await resetDatabaseForTests();
  });

  it("adds, persists, edits and deletes a completed run", async () => {
    const user = userEvent.setup();
    const view = renderDay();
    await user.click(screen.getByRole("button", { name: "+ Add event" }));
    expect(screen.getByRole("button", { name: /Resistance/ })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: /Running/ }));
    await user.type(
      screen.getByRole("spinbutton", { name: "Duration (minutes)" }),
      "32",
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "Distance (km)" }),
      "5",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Notes (optional)" }),
      "Evening run",
    );
    await user.click(screen.getByRole("button", { name: "Save event" }));
    await waitFor(
      () => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      { timeout: 5_000 },
    );

    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { name: "Running" }))
      .toBeInTheDocument();
    expect(within(card).getByText("6:24 /km")).toBeInTheDocument();
    view.unmount();

    renderDay();
    const persistedCard = await screen.findByRole("article");
    expect(within(persistedCard).getByText("Evening run")).toBeInTheDocument();
    await user.click(
      within(persistedCard).getByRole("button", { name: "Edit" }),
    );
    const duration = screen.getByRole("spinbutton", {
      name: "Duration (minutes)",
    });
    await user.clear(duration);
    await user.type(duration, "30");
    await user.click(screen.getByRole("button", { name: "Save event" }));
    await waitFor(
      () => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      { timeout: 5_000 },
    );
    expect(screen.getByText("6:00 /km")).toBeInTheDocument();

    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("No activity logged")).toBeInTheDocument();
  });

  it("offers the requested cardio activities and prefills the selection", async () => {
    const user = userEvent.setup();
    renderDay();
    await user.click(screen.getByRole("button", { name: "+ Add event" }));

    expect(screen.getByRole("button", { name: /Running/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Walking/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Indoor cycling/ }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Outdoor cycling/ }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Swimming/ }))
      .toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Physiotherapy/ }));

    expect(screen.getByRole("heading", { name: "Log Physiotherapy" }))
      .toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Activity type" }))
      .toHaveValue("Physiotherapy");
    await user.type(
      screen.getByRole("spinbutton", { name: "Duration (minutes)" }),
      "40",
    );
    await user.click(screen.getByRole("button", { name: "Save event" }));

    const card = await screen.findByRole("article");
    expect(within(card).getByRole("heading", { name: "Physiotherapy" }))
      .toBeInTheDocument();
    expect(card).toHaveTextContent("activity");
    expect(card).not.toHaveTextContent("cardio");
  });

  it("logs and completes a resistance workout set by set", async () => {
    const user = userEvent.setup();
    renderDay();
    await user.click(screen.getByRole("button", { name: "+ Add event" }));
    await user.click(screen.getByRole("button", { name: /Resistance/ }));

    const workoutName = screen.getByRole("textbox", { name: "Workout name" });
    await user.clear(workoutName);
    await user.type(workoutName, "Lower body");
    await user.click(screen.getByRole("button", { name: "Start workout" }));
    expect(await screen.findByRole("heading", { name: "Lower body", level: 1 }))
      .toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "＋ Add first exercise" }),
    );
    await user.type(
      screen.getByRole("searchbox", { name: "Search workout exercises" }),
      "Romanian",
    );
    await user.click(
      screen.getByRole("button", { name: /Dumbbell Romanian Deadlift/ }),
    );
    await user.click(screen.getByRole("button", { name: "＋ Add set" }));
    await user.click(screen.getByRole("button", { name: "＋ Add set" }));
    await user.click(screen.getByRole("button", { name: "Remove sets" }));
    expect(screen.getByText("Remove")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done removing" }))
      .toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Done removing" }),
    );
    expect(screen.getByRole("button", { name: "＋ Add set" }))
      .toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove sets" }));
    await user.click(screen.getByRole("button", { name: "Remove set 3" }));
    expect(screen.getByRole("button", { name: "Remove set 2" }))
      .toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove set 2" }));
    expect(screen.queryByRole("button", { name: "Remove set 2" })).toBeNull();
    expect(screen.getByRole("button", { name: "＋ Add set" }))
      .toBeInTheDocument();
    await user.type(
      screen.getByRole("spinbutton", { name: "Set 1 kg per dumbbell" }),
      "22.5",
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "Set 1 repetitions" }),
      "8",
    );
    await user.click(screen.getByRole("button", { name: "Mark set 1 done" }));
    await user.click(screen.getByRole("button", { name: "Finish workout" }));

    const card = await screen.findByRole("article");
    expect(within(card).getByRole("heading", { name: "Lower body" }))
      .toBeInTheDocument();
    expect(card).toHaveTextContent("1 exercise");
    expect(card).toHaveTextContent("1 set");

    await user.click(within(card).getByRole("button", { name: "Edit" }));
    await user.click(
      await screen.findByRole("button", { name: "Edit workout name" }),
    );
    const nameInput = screen.getByRole("textbox", { name: "Workout name" });
    await user.clear(nameInput);
    await user.type(nameInput, "Leg day");
    await user.click(screen.getByRole("button", { name: "Save name" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    const renamedCard = await screen.findByRole("article");
    expect(within(renamedCard).getByRole("heading", { name: "Leg day" }))
      .toBeInTheDocument();
    await user.click(
      within(renamedCard).getByRole("button", { name: "Save as template" }),
    );
    expect(screen.getByRole("heading", { name: "Save as template" }))
      .toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save template" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "+ Add event" }));
    await user.click(screen.getByRole("button", { name: /Resistance/ }));
    await user.click(screen.getByRole("button", { name: /Leg day.*Start/ }));
    expect(
      await screen.findByRole("heading", {
        name: "Dumbbell Romanian Deadlift",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Set 1 kg per dumbbell" }))
      .toHaveValue(null);
    expect(screen.getByText("22.5 × 8")).toBeInTheDocument();
  });
});
