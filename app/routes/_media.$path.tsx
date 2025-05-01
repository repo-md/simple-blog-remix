// Route for media asset proxy
import { LoaderFunction } from "@remix-run/cloudflare";
import { proxyToAssetServer } from "../../proxyService";

// This route handles media asset requests and proxies them to R2
// The $path parameter captures the media ID to be fetched from R2
export const loader: LoaderFunction = async ({ params, request }) => {
  console.log("+-+---++ _media ROUTE HANDLER CALLED", params);
  
  // Forward to the proxy service to handle the request
  return proxyToAssetServer(request);
};

// No component needed for API endpoint
export default function MediaRoute() {
  return null;
}