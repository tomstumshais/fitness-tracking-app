import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PwaPanel } from "./PwaPanel.tsx";

describe("PWA settings panel", () => {
  it("shows Safari home-screen instructions on iPhone", () => {
    render(
      <PwaPanel
        canInstall={false}
        installed={false}
        isIos
        offlineReady
        onInstall={vi.fn()}
      />,
    );

    expect(screen.getByText("Install on iPhone")).toBeInTheDocument();
    expect(screen.getByText("Tap More, then Share (or tap the Share button)."))
      .toBeInTheDocument();
    expect(screen.getByText("Choose “Add to Home Screen”."))
      .toBeInTheDocument();
    expect(screen.getByText("Turn on “Open as Web App”, then tap Add."))
      .toBeInTheDocument();
  });
});
