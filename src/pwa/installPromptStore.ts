interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallState {
  canInstall: boolean;
  installed: boolean;
}

let promptEvent: InstallPromptEvent | null = null;
let captureStarted = false;
let state: InstallState = { canInstall: false, installed: false };
const listeners = new Set<() => void>();

function emit(next: InstallState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function detectStandalone() {
  const standaloneNavigator = navigator as Navigator & {
    standalone?: boolean;
  };
  return standaloneNavigator.standalone === true ||
    (typeof globalThis.matchMedia === "function" &&
      globalThis.matchMedia("(display-mode: standalone)").matches);
}

export function startInstallPromptCapture() {
  if (captureStarted) return;
  captureStarted = true;
  state = { ...state, installed: detectStandalone() };

  globalThis.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    promptEvent = event as InstallPromptEvent;
    emit({ ...state, canInstall: true });
  });
  globalThis.addEventListener("appinstalled", () => {
    promptEvent = null;
    emit({ canInstall: false, installed: true });
  });
}

export function subscribeInstallState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallState() {
  return state;
}

export async function promptInstall() {
  if (!promptEvent) return;
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  promptEvent = null;
  emit({
    canInstall: false,
    installed: state.installed || choice.outcome === "accepted",
  });
}
