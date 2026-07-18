import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getInstallState,
  promptInstall,
  subscribeInstallState,
} from "../../pwa/installPromptStore.ts";

function detectIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function usePwaInstall() {
  const installState = useSyncExternalStore(
    subscribeInstallState,
    getInstallState,
    getInstallState,
  );
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    let active = true;
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(() => {
        if (active) setOfflineReady(true);
      }).catch(() => undefined);
    }

    return () => {
      active = false;
    };
  }, []);

  return {
    ...installState,
    install: promptInstall,
    isIos: detectIos(),
    offlineReady,
  };
}
