import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog Posts" },
    { name: "description", content: "Browse our latest blog posts" },
  ];
};

type Post = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

export const loader: LoaderFunction = async () => {
  try {
    const response = await fetch("https://r2.repo.md/iplanwebsites/680e97604a0559a192640d2c/68128c49e236a2b8ef65b526/content/posts.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    const posts = await response.json();
    return json({ posts });
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
      
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  <Link 
                    to={`/blog/${post.id}`}
                    className="text-blue-700 hover:underline dark:text-blue-500"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500 mb-4">{new Date(post.date).toLocaleDateString()}</p>
                <p className="text-gray-700 dark:text-gray-300">{post.excerpt}</p>
                <div className="mt-4">
                  <Link 
                    to={`/blog/${post.id}`}
                    className="text-blue-700 hover:underline dark:text-blue-500"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}