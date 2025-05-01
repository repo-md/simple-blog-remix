/**
 * RepoMD - A client for interacting with the repo.md API
 */

import { handleCloudflareRequest as handleMediaRequest } from "./mediaProxy";

const DEBUG = true;

export class RepoMD {
  constructor({
    org = "iplanwebsites",
    project = "680e97604a0559a192640d2c",
    ref = "68135ef83eb888fca85d2645",
    debug = false,
  } = {}) {
    this.org = org;
    this.project = project;
    this.ref = ref;
    this.debug = debug;

    if (this.debug) {
      console.log(`[RepoMD] Initialized with:
        - org: ${org}
        - project: ${project}
        - ref: ${ref}`);
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

  // Helper function to fetch JSON with error handling
  async fetchJson(
    url,
    errorMessage = "Error fetching data",
    defaultValue = null
  ) {
    try {
      if (this.debug) {
        console.log(`[RepoMD] Fetching JSON from: ${url}`);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${errorMessage}: ${response.statusText}`);
      }

      return await response.json();
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
  async fetchR2Json(path, defaultValue = null) {
    const url = this.getR2Url(path);
    return await this.fetchJson(url, `Error fetching ${path}`, defaultValue);
  }

  // Fetch all blog posts
  async getAllPosts() {
    return await this.fetchR2Json("/posts.json", []);
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

  // Handle Cloudflare requests
  async handleCloudflareRequest(request) {
    if (this.debug) {
      console.log(`[RepoMD] Handling Cloudflare request: ${request.url}`);
    }
    return await handleMediaRequest(request, this.getR2MediaUrl.bind(this));
  }
}

export default RepoMD;
