// Route for media asset proxy
import { LoaderFunction } from "@remix-run/cloudflare";
import { proxyToAssetServer } from "../../repo/proxyService";

// This route handles media asset requests and proxies them to R2
// The $path parameter captures all segments: owner/repo/branch/content/_media/filename
export const loader: LoaderFunction = async ({ params, request }) => {
  console.log("+-+---++ _medias ROUTE HANDLER CALLED", params);
  
  // The params.path should contain the full path after /_medias/
  // Example: iplanwebsites/680e97604a0559a192640d2c/68129c0ae236a2b8ef65b52e/content/_media/0063e8bdfdd379a2fa762b160639ea600c6420dcce7aa7943ae3073a135e7dec-md.jpeg
  
  // Forward to the proxy service to handle the request
  return proxyToAssetServer(request);
};

// No component needed for API endpoint
export default function MediaRoute() {
  return null;
}