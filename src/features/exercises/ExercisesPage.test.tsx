import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppBootstrap } from "../../app/AppBootstrap.tsx";
import { createAppStore } from "../../app/store.ts";
import { resetDatabaseForTests } from "../../data/database.ts";
import { ExercisesPage } from "./ExercisesPage.tsx";

describe("exercise library", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("searches predefined exercises and saves a custom exercise", async () => {
    const user = userEvent.setup();
    render(
      <Provider store={createAppStore()}>
        <AppBootstrap>
          <ExercisesPage />
        </AppBootstrap>
      </Provider>,
    );

    const search = await screen.findByRole("searchbox", {
      name: "Search exercises",
    });
    await user.type(search, "romanian");
    expect(await screen.findByText("Dumbbell Romanian Deadlift"))
      .toBeInTheDocument();
    expect(screen.queryByText("Push-Up")).not.toBeInTheDocument();

    await user.clear(search);
    await user.click(screen.getByRole("button", { name: "Barbell" }));
    expect(screen.getByText("EZ-Bar Biceps Curl")).toBeInTheDocument();
    expect(screen.getByText("EZ-Bar Reverse Curl")).toBeInTheDocument();
    expect(screen.getByText("2 exercises")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "+ Custom exercise" }));
    await user.type(
      screen.getByRole("textbox", { name: "Exercise name" }),
      "EZ-Bar Wide-Grip Curl",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Equipment" }),
      "barbell",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Muscle group" }),
      "arms",
    );
    await user.click(screen.getByRole("button", { name: "Save exercise" }));

    expect(await screen.findByText("EZ-Bar Wide-Grip Curl"))
      .toBeInTheDocument();
    expect(screen.getByText("3 exercises")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Custom" }));
    expect(screen.getByText("1 exercise")).toBeInTheDocument();
  });
});
