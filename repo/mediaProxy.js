/**
 * Media proxy service for handling media asset requests
 */

const MEDIA_URL_PREFIX = "/_repo/medias/";
const DEBUG = true;

// Check if a request is for a media asset
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

// Extract media path from the URL
export function getMediaPathFromRequest(request) {
  const url = new URL(request.url);
  const mediaPath = url.pathname.replace(MEDIA_URL_PREFIX, "");
  
  if (DEBUG) {
    console.log(`[MediaProxy] Extracted media path: ${mediaPath} from ${url.pathname}`);
  }
  
  return mediaPath;
}

// Proxy media request to the R2 asset server
export async function proxyToAssetServer(request, getR2Url) {
  if (DEBUG) {
    console.log(`[MediaProxy] Proxying media request: ${request.url}`);
  }
  
  const mediaPath = getMediaPathFromRequest(request);
  const r2Url = getR2Url(mediaPath);
  
  if (DEBUG) {
    console.log(`[MediaProxy] Proxying to R2 URL: ${r2Url}`);
  }
  
  const assetRequest = new Request(r2Url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
  });
  
  try {
    const response = await fetch(assetRequest);
    
    if (DEBUG) {
      console.log(`[MediaProxy] R2 response status: ${response.status}`);
    }
    
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

// Main handler for Cloudflare requests
export async function handleCloudflareRequest(request, getR2Url) {
  if (DEBUG) {
    console.log(`[MediaProxy] Handling request: ${request.url}`);
  }
  
  if (isMediaRequest(request)) {
    if (DEBUG) {
      console.log(`[MediaProxy] Detected media request, proxying to asset server`);
    }
    return await proxyToAssetServer(request, getR2Url);
  }
  
  return null;
}