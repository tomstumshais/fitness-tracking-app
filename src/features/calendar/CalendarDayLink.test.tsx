import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { CalendarDayLink } from "./CalendarDayLink.tsx";

describe("CalendarDayLink", () => {
  afterEach(cleanup);

  it("groups repeated activity types into count markers", () => {
    const { container } = render(
      <MemoryRouter>
        <CalendarDayLink
          day={new Date(2026, 6, 12)}
          eventTypes={["walking", "walking", "resistance"]}
          month={new Date(2026, 6, 1)}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toHaveAccessibleName(
      "Sunday, 12 July 2026, 2 walking activities and 1 resistance workout",
    );
    expect(container.querySelector(".event-marker.walking.counted"))
      .toHaveTextContent("2");
    expect(container.querySelector(".event-marker.resistance"))
      .toBeEmptyDOMElement();
  });

  it("caps larger activity counts at three plus", () => {
    const { container } = render(
      <MemoryRouter>
        <CalendarDayLink
          day={new Date(2026, 6, 13)}
          eventTypes={["running", "running", "running", "running"]}
          month={new Date(2026, 6, 1)}
        />
      </MemoryRouter>,
    );

    expect(container.querySelector(".event-marker.running.counted"))
      .toHaveTextContent("3+");
    expect(screen.getByRole("link", {
      name: "Monday, 13 July 2026, 4 running activities",
    })).toBeInTheDocument();
  });
});
