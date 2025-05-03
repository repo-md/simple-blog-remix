import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import repo from "../../repo";
import type { Post } from "~/types/blog";
import ErrorBoundaryComponent from "~/components/ErrorBoundary";

export const loader: LoaderFunction = async ({ params }) => {
  const { postId } = params;
  
  try {
    const post = await repo.getPostBySlug(postId);
    console.log("Post loaded:", post);
    
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
    { title: data.post.frontmatter.title },
    { name: "description", content: data.post.plain },
  ];
};

export default function BlogPost() {
  const { post } = useLoaderData<{ post: Post }>();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{post.frontmatter.title}</h1>
          <div className="text-sm text-gray-500">
            From: <code>{post.originalFilePath}</code>
          </div>
        </header>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
        
        {post.toc.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Table of Contents</h2>
            <ul className="list-disc list-inside">
              {post.toc.map((item, index) => (
                <li key={index}>
                  {/* Render TOC items based on their actual structure */}
                  {JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link 
          prefetch="viewport" 
            to="/blog" 
            className="text-blue-700 hover:underline dark:text-blue-500"
          >
            ← Back to all posts
          </Link>
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