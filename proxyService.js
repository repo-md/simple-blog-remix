/**
 * Proxy service for media assets
 */

/**
 * Checks if the request is for a media asset
 * @param {Request} request - The incoming request
 * @returns {boolean} - Whether the request is for a media asset
 */
function isMediaRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_media/');
}

/**
 * Reconstructs the R2 resource URL for the media asset
 * @param {Request} request - The incoming request
 * @returns {string} - The R2 resource URL
 */
function reconstructR2Url(request) {
  const url = new URL(request.url);
  // Remove the _media/ prefix from the path
  const assetPath = url.pathname.replace(/^\/_media\//, '');
  
  // Construct the R2 URL - this will need to be configured based on your actual R2 setup
  // This is a placeholder that you should replace with your actual R2 URL structure
  return `https://your-r2-bucket.your-region.r2.cloudflarestorage.com/${assetPath}`;
}

/**
 * Proxies the request to the R2 resource
 * @param {Request} request - The incoming request
 * @returns {Promise<Response>} - The response from the R2 resource
 */
async function proxyToAssetServer(request) {
  const r2Url = reconstructR2Url(request);
  
  // Create a new request to the R2 resource
  // Copy the original request but with the new URL
  const assetRequest = new Request(r2Url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
  });
  
  try {
    // Fetch the asset from R2
    const response = await fetch(assetRequest);
    
    // Create a new response with appropriate caching headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error proxying to asset server:', error);
    return new Response('Asset not found', { status: 404 });
  }
}

export { isMediaRequest, proxyToAssetServer };