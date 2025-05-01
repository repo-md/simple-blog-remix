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
    const mediaData = await repo.getAllMedia();
    return json({ mediaData });
  } catch (error) {
    console.error("Error loading media data:", error);
    return json({ mediaData: {} });
  }
};

export default function MediaPage() {
  const { mediaData } = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Media Data</h1>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
        {JSON.stringify(mediaData, null, 2)}
      </pre>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryComponent 
      status={error.status}
      statusText={error.statusText}
      message="We're having trouble loading the media data. Please try again later."
    />;
  }
  
  return <ErrorBoundaryComponent 
    message="There was an error loading the media data. Please try again later."
  />;
}