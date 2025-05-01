/**
 * RepoMD - A client for interacting with the repo.md API
 * Handles blog posts and media assets
 */

import { 
  handleCloudflareRequest as handleMediaRequest,
  proxyToAssetServer
} from "./mediaProxy";

// Debug flag for detailed logging
const DEBUG = true;

export class RepoMD {
  /**
   * Create a new RepoMD instance
   * @param {Object} options - Configuration options
   * @param {string} options.org - Organization name (e.g., 'iplanwebsites')
   * @param {string} options.project - Project ID
   * @param {string} options.ref - Reference ID (commit hash or branch)
   * @param {boolean} options.debug - Enable debug logging
   */
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

    // Create the posts API URL based on the constructor params
    this.postsApiUrl = `https://r2.repo.md/${org}/${project}/${ref}/posts.json`;

    if (this.debug) {
      console.log(`[RepoMD] Initialized with:
        - org: ${org}
        - project: ${project}
        - ref: ${ref}
        - posts API: ${this.postsApiUrl}`);
    }
  }

  /**
   * Get R2 URL for a media asset
   * @param {string} path - Media path
   * @returns {string} Full R2 URL
   */
  getR2Url(path) {
    const url = `https://r2.repo.md/${this.org}/${this.project}/${this.ref}/_media/${path}`;

    if (this.debug) {
      console.log(`[RepoMD] Generated R2 URL: ${url}`);
    }

    return url;
  }

  /**
   * Fetch all blog posts
   * @returns {Promise<Array>} Array of blog posts
   */
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

  /**
   * Get a single blog post by ID
   * @param {string} id - The post ID
   * @returns {Promise<Object|null>} The post object or null if not found
   */
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

  /**
   * Get a single blog post by slug
   * @param {string} slug - The post slug
   * @returns {Promise<Object|null>} The post object or null if not found
   */
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

  /**
   * Sort posts by date (newest first)
   * @param {Array} posts - Array of blog posts
   * @returns {Array} Sorted array of blog posts
   */
  sortPostsByDate(posts) {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get recent posts
   * @param {number} count - Number of recent posts to fetch
   * @returns {Promise<Array>} Array of recent posts
   */
  async getRecentPosts(count = 3) {
    const posts = await this.getAllPosts();
    return this.sortPostsByDate(posts).slice(0, count);
  }

  /**
   * Main handler for Cloudflare requests
   * Delegates media request handling to the mediaProxy module
   * @param {Request} request - Cloudflare request object
   * @returns {Promise<Response|null>} Response for media requests, null for others
   */
  async handleCloudflareRequest(request) {
    if (this.debug) {
      console.log(`[RepoMD] Handling Cloudflare request: ${request.url}`);
    }

    // Pass the request to the media proxy handler along with the getR2Url function
    // Bind the getR2Url function to this instance so it has access to the correct 'this'
    return await handleMediaRequest(request, this.getR2Url.bind(this));
  }

  /**
   * Proxy a media request to the asset server
   * This is a convenience method that delegates to the mediaProxy module
   * @param {Request} request - Cloudflare request object
   * @returns {Promise<Response>} Cloudflare response
   */
  async proxyToAssetServer(request) {
    return await proxyToAssetServer(request, this.getR2Url.bind(this));
  }
}

// Create a default export for easier imports
export default RepoMD;
