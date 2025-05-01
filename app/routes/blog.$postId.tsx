import { json } from "@remix-run/cloudflare";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import { getPostBySlug } from "~/lib/api";
import type { Post } from "~/types/blog";
import ErrorBoundaryComponent from "~/components/ErrorBoundary";

export const loader: LoaderFunction = async ({ params }) => {
  const { postId } = params;
  
  try {
    const post = await getPostBySlug(postId);
    
    if (!post) {
      throw new Response("Post not found", { status: 404 });
    }
    
    return json({ post });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("Error loading post:", error);
    throw new Response("Error loading post", { status: 500 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [
      { title: "Post not found" },
      { name: "description", content: "The requested post could not be found" },
    ];
  }
  
  return [
    { title: data.post.title },
    { name: "description", content: data.post.excerpt },
  ];
};

export default function BlogPost() {
  const { post } = useLoaderData<{ post: Post }>();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-gray-500">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </header>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <a 
            href="/blog" 
            className="text-blue-700 hover:underline dark:text-blue-500"
          >
            ← Back to all posts
          </a>
        </div>
      </article>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <ErrorBoundaryComponent 
        status={404}
        statusText="Post Not Found"
        message="Sorry, the blog post you're looking for doesn't exist."
      />;
    }
  }
  
  return <ErrorBoundaryComponent 
    message="There was an error loading this blog post. Please try again later."
  />;
}