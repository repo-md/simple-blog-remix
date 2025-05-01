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
    this.postsApiUrl = `https://r2.repo.md/${org}/${project}/${ref}/posts.json`;

    if (this.debug) {
      console.log(`[RepoMD] Initialized with:
        - org: ${org}
        - project: ${project}
        - ref: ${ref}
        - posts API: ${this.postsApiUrl}`);
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

  // Get URL for the SQLite database
  getSqliteURL() {
    return this.getR2Url("/content.sqlite");
  }

  // Legacy support for older code
  getR2MediaUrl(path) {
    return this.getR2Url(`/_media/${path}`);
  }

  // Fetch all blog posts
  async getAllPosts() {
    try {
      if (this.debug) {
        console.log(`[RepoMD] Fetching posts from: ${this.postsApiUrl}`);
      }

      const response = await fetch(this.postsApiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const posts = await response.json();
      return posts;
    } catch (error) {
      console.error("[RepoMD] Error fetching blog posts:", error);
      return [];
    }
  }

  // Get a single blog post by ID
  async getPostById(id) {
    try {
      if (this.debug) {
        console.log(`[RepoMD] Fetching post with ID: ${id}`);
      }

      const posts = await this.getAllPosts();
      return posts.find((post) => post.id === id) || null;
    } catch (error) {
      console.error(`[RepoMD] Error fetching post with ID ${id}:`, error);
      return null;
    }
  }

  // Get a single blog post by slug
  async getPostBySlug(slug) {
    try {
      if (this.debug) {
        console.log(`[RepoMD] Fetching post with slug: ${slug}`);
      }

      const posts = await this.getAllPosts();
      return posts.find((post) => post.slug === slug) || null;
    } catch (error) {
      console.error(`[RepoMD] Error fetching post with slug ${slug}:`, error);
      return null;
    }
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
