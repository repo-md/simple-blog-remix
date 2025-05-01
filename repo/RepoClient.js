/**
 * RepoClient - A client for interacting with the repo.md API
 * Handles blog posts and media assets
 */

// Media URL prefix for detecting media requests
const MEDIA_URL_PREFIX = "/_repo/medias/";

// Debug flag for detailed logging
const DEBUG = true;

export class RepoClient {
  /**
   * Create a new RepoClient instance
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
    debug = false
  } = {}) {
    this.org = org;
    this.project = project;
    this.ref = ref;
    this.debug = debug;
    
    // Create the posts API URL based on the constructor params
    this.postsApiUrl = `https://r2.repo.md/${org}/${project}/${ref}/posts.json`;
    
    if (this.debug) {
      console.log(`[RepoClient] Initialized with:
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
      console.log(`[RepoClient] Generated R2 URL: ${url}`);
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
        console.log(`[RepoClient] Fetching posts from: ${this.postsApiUrl}`);
      }
      
      const response = await fetch(this.postsApiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const posts = await response.json();
      return posts;
    } catch (error) {
      console.error("[RepoClient] Error fetching blog posts:", error);
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
        console.log(`[RepoClient] Fetching post with ID: ${id}`);
      }
      
      const posts = await this.getAllPosts();
      return posts.find((post) => post.id === id) || null;
    } catch (error) {
      console.error(`[RepoClient] Error fetching post with ID ${id}:`, error);
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
        console.log(`[RepoClient] Fetching post with slug: ${slug}`);
      }
      
      const posts = await this.getAllPosts();
      return posts.find((post) => post.slug === slug) || null;
    } catch (error) {
      console.error(`[RepoClient] Error fetching post with slug ${slug}:`, error);
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
   * Determines if a request is for a media asset
   * @param {Request} request - Cloudflare request object
   * @returns {boolean} True if the request is for a media asset
   */
  isMediaRequest(request) {
    if (this.debug) {
      console.log("[RepoClient] Checking if media request:", request.url);
    }
    
    const url = new URL(request.url);
    const isMedia = url.pathname.startsWith(MEDIA_URL_PREFIX);
    
    if (this.debug) {
      console.log(`[RepoClient] URL path: ${url.pathname}, isMedia: ${isMedia}`);
    }
    
    return isMedia;
  }
  
  /**
   * Extracts media path from the URL
   * @param {Request} request - Cloudflare request object
   * @returns {string} Media path
   */
  getMediaPathFromRequest(request) {
    const url = new URL(request.url);
    const mediaPath = url.pathname.replace(MEDIA_URL_PREFIX, "");
    
    if (this.debug) {
      console.log(`[RepoClient] Extracted media path: ${mediaPath} from ${url.pathname}`);
    }
    
    return mediaPath;
  }
  
  /**
   * Proxies a media request to the R2 asset server
   * @param {Request} request - Cloudflare request object
   * @returns {Promise<Response>} Cloudflare response object
   */
  async proxyToAssetServer(request) {
    if (this.debug) {
      console.log(`[RepoClient] Proxying media request: ${request.url}`);
    }
    
    // Get the media path from the request URL
    const mediaPath = this.getMediaPathFromRequest(request);
    
    // Generate the R2 URL for the media asset
    const r2Url = this.getR2Url(mediaPath);
    
    if (this.debug) {
      console.log(`[RepoClient] Proxying to R2 URL: ${r2Url}`);
    }
    
    // Create a new request for the R2 asset
    const assetRequest = new Request(r2Url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: request.redirect,
    });
    
    try {
      // Fetch the asset from R2
      const response = await fetch(assetRequest);
      
      if (this.debug) {
        console.log(`[RepoClient] R2 response status: ${response.status}`);
      }
      
      // Create a new response with caching headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        },
      });
      
      return newResponse;
    } catch (error) {
      console.error(`[RepoClient] Error proxying to asset server:`, error);
      return new Response("Asset not found", { status: 404 });
    }
  }
  
  /**
   * Main handler for Cloudflare requests
   * Handles both media requests and normal requests
   * @param {Request} request - Cloudflare request object
   * @returns {Promise<Response>} Response to send back
   */
  async handleCloudflareRequest(request) {
    if (this.debug) {
      console.log(`[RepoClient] Handling request: ${request.url}`);
    }
    
    // Check if the request is for a media asset
    if (this.isMediaRequest(request)) {
      if (this.debug) {
        console.log(`[RepoClient] Detected media request, proxying to asset server`);
      }
      return await this.proxyToAssetServer(request);
    }
    
    // If not a media request, return null to let the server handle it
    return null;
  }
}

// Create a default export for easier imports
export default RepoClient;