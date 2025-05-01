// Route for media asset proxy
import { LoaderFunction } from "@remix-run/cloudflare";
import repo from "../../repo/client";

// This route handles media asset requests and proxies them to R2
// The $path parameter captures the media ID to be fetched from R2
export const loader: LoaderFunction = async ({ params, request }) => {
  console.log("+-+---++ _media ROUTE HANDLER CALLED", params);
  
  // Get the media path from the params
  const mediaPath = params.path;
  
  // Create a modified request for the repo client to handle
  // This ensures the path follows the expected format
  const url = new URL(request.url);
  url.pathname = `/_repo/medias/${mediaPath}`;
  const modifiedRequest = new Request(url.toString(), request);
  
  // Use the repo client to handle the Cloudflare request directly
  return await repo.handleCloudflareRequest(modifiedRequest);
};

// No component needed for API endpoint
export default function MediaRoute() {
  return null;
}