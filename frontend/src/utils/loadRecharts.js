/**
 * Dynamically load Recharts from the local dependency when available and fall back to a CDN build.
 * This allows the dashboard to keep working in environments where the package install may be blocked.
 * @returns {Promise<import('recharts')>}
 */
export async function loadRecharts() {
  try {
    return await import(/* @vite-ignore */ "recharts");
  } catch {
    return await import("https://esm.sh/recharts@2.12.7");
  }
}
