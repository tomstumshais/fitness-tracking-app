import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppBootstrap } from "../../app/AppBootstrap.tsx";
import { createAppStore } from "../../app/store.ts";
import { resetDatabaseForTests } from "../../data/database.ts";
import { DayPage } from "./DayPage.tsx";

function renderDay() {
  return render(
    <Provider store={createAppStore()}>
      <AppBootstrap>
        <MemoryRouter initialEntries={["/day/2026-07-18"]}>
          <Routes>
            <Route path="day/:date" element={<DayPage />} />
          </Routes>
        </MemoryRouter>
      </AppBootstrap>
    </Provider>,
  );
}

describe("daily fitness events", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(() => {
    vi.restoreAllMocks();
    return resetDatabaseForTests();
  });

  it("adds, persists, edits and deletes a completed run", async () => {
    const user = userEvent.setup();
    const view = renderDay();
    await user.click(screen.getByRole("button", { name: "+ Add event" }));
    expect(screen.getByRole("button", { name: /Resistance/ })).toBeDisabled();
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
    expect(screen.getByText("6:00 /km")).toBeInTheDocument();

    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("No activity logged")).toBeInTheDocument();
  });
});
