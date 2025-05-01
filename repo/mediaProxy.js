/**
 * Media proxy service for handling media asset requests
 */

const MEDIA_URL_PREFIX = "/_repo/medias/";
const DEBUG = true;

// Unified handler for Cloudflare requests
export async function handleCloudflareRequest(request, getR2MediaUrl) {
  if (DEBUG) {
    console.log(`[MediaProxy] Handling request: ${request.url}`);
  }

  // Check if request is for a media asset
  const url = new URL(request.url);
  const isMedia = url.pathname.startsWith(MEDIA_URL_PREFIX);

  if (DEBUG) {
    console.log(`[MediaProxy] URL path: ${url.pathname}, isMedia: ${isMedia}`);
  }

  if (!isMedia) {
    return null; // Not a media request, let other handlers process it
  }

  if (DEBUG) {
    console.log(`[MediaProxy] Detected media request, proxying to asset server`);
  }

  // Get the media path and R2 URL
  const mediaPath = url.pathname.replace(MEDIA_URL_PREFIX, "");
  if (DEBUG) {
    console.log(`[MediaProxy] Extracted media path: ${mediaPath} from ${url.pathname}`);
  }

  const r2Url = getR2MediaUrl(mediaPath);
  if (DEBUG) {
    console.log(`[MediaProxy] Proxying to R2 URL: ${r2Url}`);
  }

  // Create and send the asset request
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

    // Return the response with caching
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error(`[MediaProxy] Error proxying to asset server:`, error);
    return new Response("Asset not found", { status: 404 });
  }
}

