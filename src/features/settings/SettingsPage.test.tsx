import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppBootstrap } from "../../app/AppBootstrap.tsx";
import { createAppStore } from "../../app/store.ts";
import { createFitnessBackup } from "../../data/backupRepository.ts";
import { resetDatabaseForTests } from "../../data/database.ts";
import {
  createFitnessEvent,
  listFitnessEvents,
} from "../../data/eventRepository.ts";
import { SettingsPage } from "./SettingsPage.tsx";

describe("backup settings", () => {
  beforeEach(resetDatabaseForTests);
  afterEach(resetDatabaseForTests);

  it("previews and restores a selected JSON backup", async () => {
    const backedUpEvent = await createFitnessEvent({
      type: "running",
      date: "2026-07-18",
      durationMinutes: 28,
      distanceKm: 5,
    });
    const backup = await createFitnessBackup();
    await createFitnessEvent({
      type: "walking",
      date: "2026-07-19",
      durationMinutes: 30,
      distanceKm: 2,
    });

    const user = userEvent.setup();
    render(
      <Provider store={createAppStore()}>
        <AppBootstrap>
          <SettingsPage />
        </AppBootstrap>
      </Provider>,
    );
    const file = new File([JSON.stringify(backup)], "fitness-backup.json", {
      type: "application/json",
    });

    await user.upload(screen.getByLabelText("Choose backup file"), file);
    expect(await screen.findByRole("dialog", { name: "Restore this backup?" }))
      .toBeInTheDocument();
    expect(screen.getByText("Completed events").nextElementSibling)
      .toHaveTextContent("1");

    await user.click(screen.getByRole("button", {
      name: "Replace and restore",
    }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Backup restored successfully.",
    );
    expect(await listFitnessEvents()).toEqual([backedUpEvent]);
  });
});
