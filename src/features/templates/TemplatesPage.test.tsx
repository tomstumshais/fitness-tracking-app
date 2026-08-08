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
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppBootstrap } from "../../app/AppBootstrap.tsx";
import { createAppStore } from "../../app/store.ts";
import { resetDatabaseForTests } from "../../data/database.ts";
import { WorkoutPage } from "../workouts/WorkoutPage.tsx";
import { TemplateEditorPage } from "./TemplateEditorPage.tsx";
import { TemplatesPage } from "./TemplatesPage.tsx";

function renderTemplates() {
  return render(
    <Provider store={createAppStore()}>
      <AppBootstrap>
        <MemoryRouter initialEntries={["/templates/new"]}>
          <Routes>
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="templates/new" element={<TemplateEditorPage />} />
            <Route
              path="templates/:templateId/edit"
              element={<TemplateEditorPage />}
            />
            <Route path="workout/:draftId" element={<WorkoutPage />} />
          </Routes>
        </MemoryRouter>
      </AppBootstrap>
    </Provider>,
  );
}

describe("workout templates", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(async () => {
    cleanup();
    await resetDatabaseForTests();
  });

  it("creates, edits and starts a template before training", async () => {
    const user = userEvent.setup();
    renderTemplates();
    await user.type(
      screen.getByRole("textbox", { name: "Template name" }),
      "Home upper",
    );
    await user.click(screen.getByRole("button", { name: "+ Add exercise" }));
    await user.type(
      screen.getByRole("searchbox", { name: "Search workout exercises" }),
      "Romanian",
    );
    await user.click(
      await screen.findByRole("button", {
        name: /Dumbbell Romanian Deadlift/,
      }),
    );
    await user.click(screen.getByRole("button", {
      name: "Increase sets for Dumbbell Romanian Deadlift",
    }));
    await user.click(screen.getByRole("button", { name: "+ Add exercise" }));
    await user.type(
      screen.getByRole("searchbox", { name: "Search workout exercises" }),
      "Push-Up",
    );
    await user.click(await screen.findByRole("button", { name: "Push-Up" }));
    await user.click(screen.getByRole("button", { name: "Move Push-Up up" }));
    await user.click(screen.getByRole("button", { name: "Save template" }));

    const card = await screen.findByRole("article");
    expect(within(card).getByRole("heading", { name: "Home upper" }))
      .toBeInTheDocument();
    const items = within(card).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Push-Up");
    expect(items[1]).toHaveTextContent("Dumbbell Romanian Deadlift");
    expect(card).toHaveTextContent("7 sets");

    await user.click(within(card).getByRole("button", { name: "Edit" }));
    const name = await screen.findByRole("textbox", { name: "Template name" });
    await user.clear(name);
    await user.type(name, "Edited upper");
    await user.click(screen.getByRole("button", { name: "Remove Push-Up" }));
    await user.click(screen.getByRole("button", {
      name: "Decrease sets for Dumbbell Romanian Deadlift",
    }));
    await user.click(screen.getByRole("button", { name: "Save template" }));

    const editedCard = await screen.findByRole("article");
    expect(within(editedCard).getByRole("heading", { name: "Edited upper" }))
      .toBeInTheDocument();
    expect(editedCard).toHaveTextContent("1 exercise · 3 sets");
    expect(editedCard).not.toHaveTextContent("Push-Up");
    await user.click(
      within(editedCard).getByRole("button", { name: "Start today" }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Edited upper",
        level: 1,
      }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("spinbutton", { name: /kg per dumbbell/ }))
        .toHaveLength(3)
    );
  });
});
