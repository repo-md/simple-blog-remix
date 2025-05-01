// Proxy service for media assets

// Enable debug mode (set to true to see detailed logs)
const DEBUG = true;
//  "https://r2.repo.md/iplanwebsites/680e97604a0559a192640d2c/68129c0ae236a2b8ef65b52e/content/_media/0063e8bdfdd379a2fa762b160639ea600c6420dcce7aa7943ae3073a135e7dec-md.jpeg"

const R2_BASE_URL =
  "https://r2.repo.md/iplanwebsites/680e97604a0559a192640d2c/68129c0ae236a2b8ef65b52e/content/_media/"; // + // 0063e8bdfdd379a2fa762b160639ea600c6420dcce7aa7943ae3073a135e7dec-md.jpeg

// https://r2.repo.md/iplanwebsites/680e97604a0559a192640d2c/68135d183eb888fca85d2644/posts.json
import { getR2Url } from "./api.js";

// Determines if a request is for a media asset
export function isMediaRequest(request) {
  console.log("PROXY DEBUG - isMediaRequest was called", request.url);
  const url = new URL(request.url);
  console.log("PROXY DEBUG - URL parsed:", url.pathname);

  // Check if the URL starts with /_medias/ or /_media/
  const isMedia =
    url.pathname.startsWith("/_medias/") || url.pathname.startsWith("/_media/");
  console.log("PROXY DEBUG - Is media request:", isMedia);

  // Always log this regardless of DEBUG flag
  console.log(
    `[PROXY] Checking media request: ${url.pathname}, result: ${isMedia}`
  );

  return isMedia;
}

// Builds the R2 resource URL from the request path
function reconstructR2Url(request) {
  const url = new URL(request.url);

  // The URL structure has this format:
  // https://r2.repo.md/iplanwebsites/680e97604a0559a192640d2c/68129c0ae236a2b8ef65b52e/content/_media/0063e8bdfdd379a2fa762b160639ea600c6420dcce7aa7943ae3073a135e7dec-md.jpeg
  //
  // Our request will look like:
  // /_medias/[media-id] or /_media/[media-id]

  // Extract the media ID from the pathname (remove the leading /_medias/ or /_media/)
  const mediaPath = url.pathname.replace(/^\/_media(s)?\//, "");

  // Create the full R2 URL using the R2_BASE_URL constant
  const r2Url = getR2Url(mediaPath); //`${R2_BASE_URL}${mediaPath}`;

  if (DEBUG) {
    console.log(`[PROXY] Original path: ${url.pathname}`);
    console.log(`[PROXY] Media path: ${mediaPath}`);
    console.log(`[PROXY] R2 URL: ${r2Url}`);
  }

  return r2Url;
}

// Proxies the request to the R2 asset server
export async function proxyToAssetServer(request) {
  if (DEBUG) console.log(`[PROXY] Proxying request: ${request.url}`);

  const r2Url = reconstructR2Url(request);

  const assetRequest = new Request(r2Url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
  });

  if (DEBUG) console.log(`[PROXY] Created asset request to: ${r2Url}`);

  try {
    if (DEBUG) console.log(`[PROXY] Fetching from asset server...`);

    const response = await fetch(assetRequest);

    if (DEBUG) {
      console.log(`[PROXY] Asset server response status: ${response.status}`);
      console.log(
        `[PROXY] Asset server response headers:`,
        Object.fromEntries(response.headers)
      );
    }

    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });

    if (DEBUG)
      console.log(
        `[PROXY] Returning proxied response with status: ${newResponse.status}`
      );

    return newResponse;
  } catch (error) {
    console.error(`[PROXY] Error proxying to asset server:`, error);

    if (DEBUG) {
      console.log(`[PROXY] Error details:`);
      console.log(error.stack || error.message || error);
    }

    return new Response("Asset not found", { status: 404 });
  }
}
