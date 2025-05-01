// Route for media asset proxy
import { LoaderFunction } from "@remix-run/cloudflare";
import { proxyToAssetServer } from "../../proxyService";

// This route handles media asset requests and proxies them to R2
export const loader: LoaderFunction = async ({ params, request }) => {
  console.log("+-+---++ _medias ROUTE HANDLER CALLED", params);
  
  // Forward to the proxy service
  return proxyToAssetServer(request);
};

// No component needed for API endpoint
export default function MediaRoute() {
  return null;
}