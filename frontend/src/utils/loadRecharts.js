const CDN_URL = "https://esm.sh/recharts@2.12.7";

let rechartsPromise = null;

/**
 * Dynamically load Recharts, optionally honoring a user-provided module path via env var.
 * Falls back to the CDN build when the local package is not available.
 * @returns {Promise<import('recharts')>}
 */
export async function loadRecharts() {
  if (rechartsPromise) return rechartsPromise;

  rechartsPromise = (async () => {
    const overridePath = import.meta.env?.VITE_RECHARTS_PATH;

    if (overridePath) {
      try {
        return await import(/* @vite-ignore */ overridePath);
      } catch (error) {
        console.warn("Failed to load Recharts from override path", error);
      }
    }

    return import(/* @vite-ignore */ CDN_URL);
  })();

  return rechartsPromise;
}
