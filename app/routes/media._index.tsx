import { json } from "@remix-run/cloudflare";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import repo from "../../repo/client";
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
    const mediaItems = await repo.getMediaItems();
    return json({ mediaItems });
  } catch (error) {
    console.error("Error loading media items:", error);
    return json({ mediaItems: [] });
  }
};

// Define TypeScript interface for media items
interface MediaItem {
  id: string;
  path: string;
  name: string;
  size: number;
  type: string;
  thumbnailUrl: string;
  imageUrl: string;
}

export default function MediaPage() {
  const { mediaItems } = useLoaderData<{ mediaItems: MediaItem[] }>();
  
  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Media Library</h1>
      
      {mediaItems.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No media items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaItems.map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white truncate" title={item.name}>
                  {item.name}
                </h3>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                  <span>{item.type.split('/')[1]?.toUpperCase()}</span>
                  <span>{formatFileSize(item.size)}</span>
                </div>
                <a 
                  href={item.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 text-blue-700 hover:underline dark:text-blue-500 text-sm inline-block"
                >
                  View Original
                </a>
              </div>
            </div>
          ))}
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