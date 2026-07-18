import { describe, expect, it, vi } from "vitest";
import {
  getInstallState,
  promptInstall,
  startInstallPromptCapture,
} from "./installPromptStore.ts";

describe("install prompt store", () => {
  it("retains an early install prompt until the user requests it", async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(
      new Event("beforeinstallprompt", { cancelable: true }),
      {
        prompt,
        userChoice: Promise.resolve({ outcome: "accepted" as const }),
      },
    );
    startInstallPromptCapture();

    globalThis.dispatchEvent(event);
    expect(getInstallState().canInstall).toBe(true);

    await promptInstall();
    expect(prompt).toHaveBeenCalledOnce();
    expect(getInstallState()).toEqual({
      canInstall: false,
      installed: true,
    });
  });
});
