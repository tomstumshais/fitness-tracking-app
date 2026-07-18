import { afterEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./registerServiceWorker.ts";

const originalServiceWorker = Object.getOwnPropertyDescriptor(
  navigator,
  "serviceWorker",
);

afterEach(() => {
  if (originalServiceWorker) {
    Object.defineProperty(navigator, "serviceWorker", originalServiceWorker);
  } else {
    delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
  }
});

describe("service worker registration", () => {
  it("uses the GitHub Pages base path as its scope", async () => {
    const registration = {} as ServiceWorkerRegistration;
    const register = vi.fn().mockResolvedValue(registration);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register },
    });

    await expect(registerServiceWorker("/fitness-tracking-app/"))
      .resolves.toBe(registration);
    expect(register).toHaveBeenCalledWith(
      "/fitness-tracking-app/sw.js",
      { scope: "/fitness-tracking-app/", updateViaCache: "none" },
    );
  });
});
