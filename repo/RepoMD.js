/**
 * RepoMD - A client for interacting with the repo.md API with quick-lru cache
 */

import { handleCloudflareRequest as handleMediaRequest } from "./mediaProxy";
import * as frameworkSnippets from "./frameworkSnipets";

import { fetchJson } from "./utils";

const DEBUG = true;

export class RepoMD {
  constructor({
    org = "iplanwebsites",
    orgSlug = "iplanwebsites",
    orgId = null,
    project = "tbd",
    projectId = "680e97604a0559a192640d2c",
    projectSlug = "undefined-project-slug",
    rev = "latest", // Default to "latest"
    secret = null,
    debug = false,
    //maxCacheSize = 50,
    //cacheTTL = 300000, // 5 minutes
  } = {}) {
    this.org = org;
    this.project = project;
    this.projectId = projectId;
    this.projectSlug = projectSlug;
    this.orgSlug = orgSlug;
    this.orgId = orgId;
    this.rev = rev;
    this.debug = debug;
    this.secret = secret;
    this.activeRev = null; // Store resolved latest revision ID

    // Resize cache if different settings are provided
    //if (maxCacheSize !== lru.maxSize) {
    //    lru.resize(maxCacheSize);
    //  }

    if (this.debug) {
      console.log(`[RepoMD] Initialized with:
        - org: ${org}
        - project: ${project}
        - rev: ${rev} 
        `);
    }
  }

  // Get basic URL with given domain and path
  getR2Url(path = "") {
    const domain = "r2.repo.md";
    const resolvedRev = this.rev === "latest" ? this.activeRev : this.rev;
    const url = `https://${domain}/${this.orgSlug}/${this.projectId}/${resolvedRev}${path}`;
    if (this.debug) {
      console.log(`[RepoMD] Generated URL: ${url}`);
    }
    return url;
  }

  // Get base API URL for backend calls

  async fetchPublicApi(path = "/") {
    const domain = "api.repo.md";
    const url = `https://${domain}/v1/${path}`;

    return await this.fetchJson(url, {
      errorMessage: "Error fetching pubic API route: " + path,
      useCache: true, // fetchJson already handles caching
    });
  }

  // Fetch project configuration including latest release information
  async fetchProjectDetails() {
    const path = `/orgs/${this.orgSlug}/projects/slug/${this.projectSlug}`;
    // EX: http://localhost:5599/v1/orgs/iplanwebsites/projects/slug/port1g
    const project = await this.fetchPublicApi(path);
    return project;
  }
  // Get the latest revision ID
  async getActiveProjectRev() {
    const { activeRev, id } = await this.fetchProjectDetails();

    return activeRev;
  }

  // Ensure latest revision is resolved before making R2 calls
  async ensureLatestRev() {
    if (this.rev === "latest" && !this.activeRev) {
      const latestId = await this.getActiveProjectRev();
      if (!latestId) {
        throw new Error("Could not determine latest revision ID");
      }
      this.activeRev = latestId;
      if (this.debug) {
        console.log(
          `[RepoMD] Resolved 'latest' to revision: ${this.activeRev}`
        );
      }
    }
  }

  // Helper function to fetch JSON with error handling and caching
  async fetchJson(url, opts = {}) {
    return await fetchJson(url, opts, this.debug);
  }

  // Get URL for the SQLite database
  async getSqliteURL() {
    await this.ensureLatestRev();
    return this.getR2Url("/content.sqlite");
  }

  // Legacy support for older code
  async getR2MediaUrl(path) {
    await this.ensureLatestRev();
    const url = this.getR2Url(`/_media/${path}`);
    return url; // Ensure we return the resolved string, not a Promise
  }

  // Fetch a JSON file from R2 storage
  async fetchR2Json(path, opts = {}) {
    await this.ensureLatestRev();
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

  // Fetch media data
  async getAllMedia(useCache = true) {
    const mediaData = await this.fetchR2Json("/media-results.json", {
      defaultValue: {},
      useCache,
    });

    if (this.debug) {
      console.log(`[RepoMD] Fetched media data:`, mediaData);
    }

    return mediaData;
  }

  // Get all media items with formatted URLs
  async getMediaItems(useCache = true) {
    const mediaData = await this.getAllMedia(useCache);
    const items = [];

    if (this.debug) {
      console.log(
        "[RepoMD] Raw media data structure:",
        JSON.stringify(mediaData, null, 2)
      );
    }

    return mediaData.mediaData || [];
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

  // Get release information
  async getReleaseInfo() {
    const config = await this.fetchProjectDetails();
    return {
      current: config.latest_release,
      all: config.releases || [],
    };
  }

  // Handle Cloudflare requests
  async handleCloudflareRequest(request) {
    if (this.debug) {
      console.log(`[RepoMD] Handling Cloudflare request: ${request.url}`);
    }
    // Create a wrapper function that resolves the Promise from getR2MediaUrl
    const getResolvedR2MediaUrl = async (path) => {
      return await this.getR2MediaUrl(path);
    };
    return await handleMediaRequest(request, getResolvedR2MediaUrl);
  }
}

export default RepoMD;

// Export all framework snippets
export { ...frameworkSnippets };
