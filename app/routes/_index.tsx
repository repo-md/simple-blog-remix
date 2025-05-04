import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import repo from "../../repo";
import RecentPosts from "~/components/RecentPosts";
import type { Post } from "~/types/blog";

export const meta: MetaFunction = () => {
  return [
    { title: "Remo.md Simple Blog theme " },
    { name: "description", content: "Welcome to our repo.md Blog!" },
  ];
};

export const loader: LoaderFunction = async () => {
  try {
    const recentPosts = await repo.getRecentPosts(3);
    return json({ posts: recentPosts });
  } catch (error) {
    console.error("Error loading recent posts:", error);
    return json({ posts: [] });
  }
};

export default function Index() {
  const { posts } = useLoaderData<{ posts: Post[] }>();

  return (
    <div>
      <div className="py-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            My Blog
          </h1>
        </div>
      </div>

      {posts.length > 0 && (
        <div className="py-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
              <div className="p-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Link 
                    prefetch="viewport" 
                    to={`/blog/${posts[0].slug}`}
                    className="text-blue-700 hover:underline dark:text-blue-500"
                  >
                    {posts[0].frontmatter.title || posts[0].frontmatter.name}
                  </Link>
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {posts[0].firstParagraphText || posts[0].plain}
                </p>
                <Link 
                  prefetch="viewport"  
                  to={`/blog/${posts[0].slug}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Read full article
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {posts.length > 1 && (
        <RecentPosts posts={posts.slice(1)} max={2} />
      )}
    </div>
  );
}
