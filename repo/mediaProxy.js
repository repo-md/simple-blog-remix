/**
 * Media proxy service for handling media asset requests
 */

const MEDIA_URL_PREFIX = "/_repo/medias/";
const DEBUG = true;

// Helper function to find probable MIME type from file path
function findProbableMimeType(path) {
  const ext = path.split(".").pop().toLowerCase();
  if (DEBUG) console.log("++++++ext from path:", ext, path);
  const mimeTypes = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    bmp: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",

    // Videos
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    oga: "audio/ogg",
    m4a: "audio/mp4",

    // Documents
    pdf: "application/pdf",
    json: "application/json",
    xml: "application/xml",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",

    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

// Helper function to create browser-friendly headers
function createBrowserFriendlyHeaders(originalHeaders, mediaPath) {
  const newHeaders = new Headers(originalHeaders);

  // Get content type from original headers or determine from file extension
  let contentType = originalHeaders.get("Content-Type");
  if (DEBUG)
    console.log("++++++Content-Type from original headers:", contentType);
  if (!contentType || contentType === "application/octet-stream") {
    contentType = findProbableMimeType(mediaPath);
  }

  // Set content type
  newHeaders.set("Content-Type", contentType);
  if (DEBUG)
    console.log(
      "++++-+-+-+-+++Content-Type from findProbableMimeType",
      contentType
    );

  // Remove or set Content-Disposition to inline for browser display
  newHeaders.delete("Content-Disposition");

  // For certain file types, you might want to force download
  // Uncomment if needed:
  // const forceDownloadTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  // const ext = mediaPath.split('.').pop().toLowerCase();
  // if (forceDownloadTypes.includes(ext)) {
  //   newHeaders.set('Content-Disposition', 'attachment');
  // }

  // Set cache control
  const cacheDuration = 333;
  newHeaders.set("Cache-Control", "public, max-age=" + cacheDuration);

  return newHeaders;
}

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
    console.log(
      `[MediaProxy] Detected media request, proxying to asset server`
    );
  }

  // Get the media path and R2 URL
  const mediaPath = url.pathname.replace(MEDIA_URL_PREFIX, "");
  if (DEBUG) {
    console.log(
      `[MediaProxy] Extracted media path: ${mediaPath} from ${url.pathname}`
    );
  }

  // Wait for the Promise to resolve
  const r2Url = await getR2MediaUrl(mediaPath);
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

    // Create browser-friendly headers
    const headers = createBrowserFriendlyHeaders(response.headers, mediaPath);

    // Return the response with browser-friendly headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  } catch (error) {
    console.error(`[MediaProxy] Error proxying to asset server:`, error);
    return new Response("Asset not found", { status: 404 });
  }
}
