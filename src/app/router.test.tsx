import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { routes } from "./router.tsx";
import { createAppStore } from "./store.ts";

describe("application router", () => {
  it("opens a calendar month and links its days", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/calendar/2026-07"],
    });

    render(
      <Provider store={createAppStore()}>
        <RouterProvider router={router} />
      </Provider>,
    );

    expect(screen.getByRole("heading", { name: "July 2026" }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Friday, 17 July 2026" }))
      .toHaveAttribute(
        "href",
        "/day/2026-07-17",
      );
  });
});
