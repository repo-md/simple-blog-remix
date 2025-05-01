/**
 * Media proxy service for handling media asset requests
 * This is a standalone module that's imported by RepoMD
 */

// Media URL prefix for detecting media requests
const MEDIA_URL_PREFIX = "/_repo/medias/";

// Debug flag for detailed logging
const DEBUG = true;

/**
 * Determines if a request is for a media asset
 * @param {Request} request - Cloudflare request object
 * @returns {boolean} True if the request is for a media asset
 */
export function isMediaRequest(request) {
  if (DEBUG) {
    console.log("[MediaProxy] Checking if media request:", request.url);
  }
  
  const url = new URL(request.url);
  const isMedia = url.pathname.startsWith(MEDIA_URL_PREFIX);
  
  if (DEBUG) {
    console.log(`[MediaProxy] URL path: ${url.pathname}, isMedia: ${isMedia}`);
  }
  
  return isMedia;
}

/**
 * Extracts media path from the URL
 * @param {Request} request - Cloudflare request object
 * @returns {string} Media path
 */
export function getMediaPathFromRequest(request) {
  const url = new URL(request.url);
  const mediaPath = url.pathname.replace(MEDIA_URL_PREFIX, "");
  
  if (DEBUG) {
    console.log(`[MediaProxy] Extracted media path: ${mediaPath} from ${url.pathname}`);
  }
  
  return mediaPath;
}

/**
 * Proxies a media request to the R2 asset server
 * @param {Request} request - Cloudflare request object
 * @param {Function} getR2Url - Function to generate R2 URL, provided by RepoMD
 * @returns {Promise<Response>} Cloudflare response object
 */
export async function proxyToAssetServer(request, getR2Url) {
  if (DEBUG) {
    console.log(`[MediaProxy] Proxying media request: ${request.url}`);
  }
  
  // Get the media path from the request URL
  const mediaPath = getMediaPathFromRequest(request);
  
  // Generate the R2 URL for the media asset using the provided function
  const r2Url = getR2Url(mediaPath);
  
  if (DEBUG) {
    console.log(`[MediaProxy] Proxying to R2 URL: ${r2Url}`);
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
    
    if (DEBUG) {
      console.log(`[MediaProxy] R2 response status: ${response.status}`);
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
    console.error(`[MediaProxy] Error proxying to asset server:`, error);
    return new Response("Asset not found", { status: 404 });
  }
}

/**
 * Main handler for Cloudflare requests
 * Handles media requests and returns null for non-media requests
 * @param {Request} request - Cloudflare request object
 * @param {Function} getR2Url - Function to generate R2 URL, provided by RepoMD
 * @returns {Promise<Response|null>} Response for media requests, null for others
 */
export async function handleCloudflareRequest(request, getR2Url) {
  if (DEBUG) {
    console.log(`[MediaProxy] Handling request: ${request.url}`);
  }
  
  // Check if the request is for a media asset
  if (isMediaRequest(request)) {
    if (DEBUG) {
      console.log(`[MediaProxy] Detected media request, proxying to asset server`);
    }
    return await proxyToAssetServer(request, getR2Url);
  }
  
  // If not a media request, return null to let the server handle it
  return null;
}