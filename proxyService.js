// Proxy service for media assets

// Enable debug mode (set to true to see detailed logs)
const DEBUG = true;

// Determines if a request is for a media asset
export function isMediaRequest(request) {
  console.log("PROXY DEBUG - isMediaRequest was called", request.url);
  const url = new URL(request.url);
  console.log("PROXY DEBUG - URL parsed:", url.pathname);
  const isMedia = url.pathname.startsWith("/_medias/");
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
  const assetPath = url.pathname.replace(/^\/_medias\//, "");
  const r2Url = `https://r2.repo.md/${assetPath}`;
  //

  if (DEBUG) {
    console.log(`[PROXY] Original path: ${url.pathname}`);
    console.log(`[PROXY] Asset path: ${assetPath}`);
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
        "Cache-Control": "public, max-age=0", // Cache for 1 year
        //  "Cache-Control": "public, max-age=31536000", // Cache for 1 year
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
