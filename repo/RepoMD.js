/**
 * RepoMD - A client for interacting with the repo.md API with quick-lru cache
 */

import { handleCloudflareRequest as handleMediaRequest } from "./mediaProxy";
import QuickLRU from "quick-lru";

const DEBUG = true;

// Global cache instance that persists across requests
const lru = new QuickLRU({
  maxSize: 1000, ///tweak depending on worker
  maxAge: 60000 * 60, // 1h
});

export class RepoMD {
  constructor({
    org = "iplanwebsites",
    project = "680e97604a0559a192640d2c",
    ref = "68135ef83eb888fca85d2645",
    secret = null,
    debug = false,
    //maxCacheSize = 50,
    //cacheTTL = 300000, // 5 minutes
  } = {}) {
    this.org = org;
    this.project = project;
    this.ref = ref;
    this.debug = debug;
    this.secret = secret;

    // Resize cache if different settings are provided
    //if (maxCacheSize !== lru.maxSize) {
    //    lru.resize(maxCacheSize);
    //  }

    if (this.debug) {
      console.log(`[RepoMD] Initialized with:
        - org: ${org}
        - project: ${project}
        - ref: ${ref} 
        `);
    }
  }

  // Get basic URL with given domain and path
  getR2Url(path = "") {
    const domain = "r2.repo.md";
    const url = `https://${domain}/${this.org}/${this.project}/${this.ref}${path}`;
    if (this.debug) {
      console.log(`[RepoMD] Generated URL: ${url}`);
    }
    return url;
  }

  // Helper function to fetch JSON with error handling and caching
  async fetchJson(url, opts = {}) {
    // Deconstruct options with sensible defaults
    const {
      errorMessage = "Error fetching data",
      defaultValue = null,
      useCache = true,
    } = opts;

    try {
      if (this.debug) {
        console.log(`[RepoMD] Fetching JSON from: ${url}`);
      }

      // Check cache first
      if (useCache && lru.has(url)) {
        const cachedData = lru.get(url);
        if (this.debug) {
          console.log(`[RepoMD] Cache hit for: ${url}`);
        }
        return cachedData;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${errorMessage}: ${response.statusText}`);
      }

      const data = await response.json();

      // Store in cache with custom TTL if needed
      if (useCache) {
        lru.set(url, data);
        if (this.debug) {
          console.log(
            `[RepoMD] Cached data for: ${url} (cache size: ${lru.size})`
          );
        }
      }

      return data;
    } catch (error) {
      if (this.debug) {
        console.error(`[RepoMD] ${errorMessage}:`, error);
      }
      return defaultValue;
    }
  }

  // Get URL for the SQLite database
  getSqliteURL() {
    return this.getR2Url("/content.sqlite");
  }

  // Legacy support for older code
  getR2MediaUrl(path) {
    return this.getR2Url(`/_media/${path}`);
  }

  // Fetch a JSON file from R2 storage
  async fetchR2Json(path, opts = {}) {
    const url = this.getR2Url(path);
    return await this.fetchJson(url, opts);
  }

  // Fetch all blog posts
  async getAllPosts(useCache = true) {
    return await this.fetchR2Json("/posts.json", {
      defaultValue: [],
      useCache,
    });
  }

  // Get a single blog post by ID
  async getPostById(id) {
    if (this.debug) {
      console.log(`[RepoMD] Fetching post with ID: ${id}`);
    }

    const posts = await this.getAllPosts();
    return posts?.find((post) => post.id === id) || null;
  }

  // Get a single blog post by slug
  async getPostBySlug(slug) {
    if (this.debug) {
      console.log(`[RepoMD] Fetching post with slug: ${slug}`);
    }

    const posts = await this.getAllPosts();
    return posts?.find((post) => post.slug === slug) || null;
  }

  // Sort posts by date (newest first)
  sortPostsByDate(posts) {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Get recent posts
  async getRecentPosts(count = 3) {
    const posts = await this.getAllPosts();
    return this.sortPostsByDate(posts).slice(0, count);
  }

  // Cache management methods
  clearCache() {
    lru.clear();
    if (this.debug) {
      console.log(`[RepoMD] Cache cleared`);
    }
  }

  getCacheStats() {
    return {
      size: lru.size,
      maxSize: lru.maxSize,
      // quick-lru doesn't expose maxAge after creation
      maxAge: this.cacheTTL,
      entries: Array.from(lru.keys()),
    };
  }

  // Get cache entries for debugging
  getCacheEntries() {
    return {
      ascending: Array.from(lru.entriesAscending()),
      descending: Array.from(lru.entriesDescending()),
    };
  }

  // Check if a specific URL is cached
  isCached(path) {
    const url = this.getR2Url(path);
    return lru.has(url);
  }

  // Peek at cache value without updating recency
  peekCache(path) {
    const url = this.getR2Url(path);
    return lru.peek(url);
  }

  // Handle Cloudflare requests
  async handleCloudflareRequest(request) {
    if (this.debug) {
      console.log(`[RepoMD] Handling Cloudflare request: ${request.url}`);
    }
    return await handleMediaRequest(request, this.getR2MediaUrl.bind(this));
  }
}

export default RepoMD;
