export async function registerServiceWorker(
  baseUrl = import.meta.env.BASE_URL,
) {
  if (!("serviceWorker" in navigator)) return undefined;
  return await navigator.serviceWorker.register(`${baseUrl}sw.js`, {
    scope: baseUrl,
    updateViaCache: "none",
  });
}
