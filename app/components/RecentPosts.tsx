import { Link } from "@remix-run/react";
import type { Post } from "~/types/blog";

interface RecentPostsProps {
  posts: Post[];
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Recent Blog Posts</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  <Link 
                    to={`/blog/${post.id}`}
                    className="text-blue-700 hover:underline dark:text-blue-500"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500 mb-3">{new Date(post.date).toLocaleDateString()}</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{post.excerpt}</p>
                <Link 
                  to={`/blog/${post.id}`}
                  className="text-sm text-blue-700 hover:underline dark:text-blue-500"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            to="/blog"
            className="inline-block px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
}