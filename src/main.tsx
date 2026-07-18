import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { AppBootstrap } from "./app/AppBootstrap.tsx";
import { router } from "./app/router.tsx";
import { store } from "./app/store.ts";
import { startInstallPromptCapture } from "./pwa/installPromptStore.ts";
import { registerServiceWorker } from "./pwa/registerServiceWorker.ts";
import "./index.css";

startInstallPromptCapture();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppBootstrap>
        <RouterProvider router={router} />
      </AppBootstrap>
    </Provider>
  </StrictMode>,
);

if (import.meta.env.PROD) {
  globalThis.addEventListener("load", () => {
    void registerServiceWorker().catch((error: unknown) => {
      console.warn("Offline setup could not be completed", error);
    });
  }, { once: true });
}
