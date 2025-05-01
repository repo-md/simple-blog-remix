// Test route for media proxy
import { LoaderFunction } from "@remix-run/cloudflare";

// This is a test route to force Remix to handle _media URLs
export const loader: LoaderFunction = async ({ params, request }) => {
  console.log("+-+---++ _media ROUTE HANDLER CALLED", params);
  const path = params.path;
  
  // Return a simple text response for now
  return new Response(`Media route handler for: ${path}`, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

// No component needed for API endpoint
export default function MediaRoute() {
  return null;
}