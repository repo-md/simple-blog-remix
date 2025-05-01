import QuickLRU from "quick-lru";

// Global cache instance that persists across requests
const lru = new QuickLRU({
  maxSize: 1000, ///tweak depending on worker
  maxAge: 60000 * 60, // 1h
});

// Helper function to fetch JSON with error handling
export async function fetchJson(url, opts = {}, debug = false) {
  // Deconstruct options with sensible defaults
  const {
    errorMessage = "Error fetching data",
    defaultValue = null,
    useCache = true,
  } = opts;

  try {
    if (debug) {
      console.log(`[RepoMD] Fetching JSON from: ${url}`);
    }

    // Check cache first if provided
    if (useCache && lru && lru.has(url)) {
      const cachedData = lru.get(url);
      if (debug) {
        console.log(`[RepoMD] Cache hit for: ${url}`);
      }
      return cachedData;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${errorMessage}: ${response.statusText}`);
    }

    const data = await response.json();

    // Store in cache if provided
    if (useCache && lru) {
      lru.set(url, data);
      if (debug) {
        console.log(
          `[RepoMD] Cached data for: ${url} (cache size: ${lru.size})`
        );
      }
    }

    return data;
  } catch (error) {
    if (debug) {
      console.error(`[RepoMD] ${errorMessage}:`, error);
    }
    return defaultValue;
  }
}
