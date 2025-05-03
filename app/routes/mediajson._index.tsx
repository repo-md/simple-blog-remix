import { json } from "@remix-run/cloudflare";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import repo from "../../repo";
import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import ErrorBoundaryComponent from "~/components/ErrorBoundary";

export const meta: MetaFunction = () => {
  return [
    { title: "Media Data" },
    { name: "description", content: "View media data from our repository" },
  ];
};

export const loader: LoaderFunction = async () => {
  try {
    // First get the raw data to see its structure
    const mediaData = await repo.getAllMedia();
    console.log("Raw media data in loader:", JSON.stringify(mediaData, null, 2));
    
    // Then get the processed items
    const mediaItems = await repo.getMediaItems();
    console.log("Processed media items in loader:", JSON.stringify(mediaItems, null, 2));
    
    // Return both for debugging
    return json({ 
      mediaItems,
      rawMediaData: mediaData 
    });
  } catch (error) {
    console.error("Error loading media items:", error);
    return json({ 
      mediaItems: [],
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// Define TypeScript interface for media items
interface MediaItem {
  id?: string;
  path?: string;
  name?: string;
  size?: number;
  type?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
}

export default function MediaPage() {
  const data = useLoaderData<any>();
  console.log('Media page data:', data);
  
  // Simple display to debug the data
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Media Data</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Raw Data Structure</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
      
      {data.error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-6">
          <h3 className="font-bold">Error</h3>
          <p>{data.error}</p>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryComponent 
      status={error.status}
      statusText={error.statusText}
      message="We're having trouble loading the media library. Please try again later."
    />;
  }
  
  return <ErrorBoundaryComponent 
    message="There was an error loading the media library. Please try again later."
  />;
}