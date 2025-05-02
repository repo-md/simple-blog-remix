import { Link } from "@remix-run/react";
import type { Post } from "~/types/blog";

interface BlogListProps {
  posts: Post[];
  max?: number;
}

export default function BlogList({ posts, max }: BlogListProps) {
  if (!posts || posts.length === 0) {
    return <p>No posts found.</p>;
  }

  // Limit the number of posts if max is provided
  const displayPosts = max ? posts.slice(0, max) : posts;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayPosts.map((post) => (
        <div key={post.slug} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              <Link 
                prefetch="viewport" 
                to={`/blog/${post.slug}`}
                className="text-blue-700 hover:underline dark:text-blue-500"
              >
                {post.frontmatter.title || post.frontmatter.name}
              </Link>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2 overflow-hidden">{post.firstParagraphText || post.plain}</p>
            <Link 
              prefetch="viewport"  
              to={`/blog/${post.slug}`}
              className="text-sm text-blue-700 hover:underline dark:text-blue-500"
            >
              Read more →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}