import { json } from "@remix-run/cloudflare";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import repo from "../../repo";
import type { Post } from "~/types/blog";
import ErrorBoundaryComponent from "~/components/ErrorBoundary";
import BlogList from "~/components/BlogList";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog Posts" },
    { name: "description", content: "Browse our latest blog posts" },
  ];
};

export const loader: LoaderFunction = async () => {
  try {
    const posts = await repo.getAllPosts();
    const sortedPosts = repo.sortPostsByDate(posts);
    return json({ posts: sortedPosts });
  } catch (error) {
    console.error("Error loading posts:", error);
    return json({ posts: [] });
  }
};

export default function BlogIndex() {
  const { posts } = useLoaderData<{ posts: Post[] }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <BlogList posts={posts} />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return <ErrorBoundaryComponent 
      status={error.status}
      statusText={error.statusText}
      message="We're having trouble loading the blog posts. Please try again later."
    />;
  }
  
  return <ErrorBoundaryComponent 
    message="There was an error loading the blog posts. Please try again later."
  />;
}