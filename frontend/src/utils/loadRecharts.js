let rechartsPromise;

/**
 * Dynamically load Recharts from a CDN or a custom path to avoid local install issues.
 * @returns {Promise<any>}
 */
export function loadRecharts() {
  if (rechartsPromise) return rechartsPromise;

  const src =
    import.meta?.env?.VITE_RECHARTS_PATH || "https://esm.sh/recharts@2.12.7?bundle";

  rechartsPromise = import(/* @vite-ignore */ src);
  return rechartsPromise;
}
