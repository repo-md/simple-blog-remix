import { Link } from "@remix-run/react";
import type { Post } from "~/types/blog";
import BlogList from "./BlogList";

interface RecentPostsProps {
  posts: Post[];
  max?: number;
}

export default function RecentPosts({ posts, max = 3 }: RecentPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Recent Blog Posts</h2>
        
        <BlogList posts={posts} max={max} />
        
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