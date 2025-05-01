/**
 * Blog post data API functions
 */
import type { Post } from "~/types/blog";

const POSTS_API_URL =
  "https://r2.repo.md/iplanwebsites/680e97604a0559a192640d2c/68128c49e236a2b8ef65b526/content/posts.json";

/**
 * Fetch all blog posts
 * @returns Promise<Post[]> Array of blog posts
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const response = await fetch(POSTS_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    const posts = await response.json();
    return posts as Post[];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

/**
 * Get a single blog post by ID
 * @param id - The post ID
 * @returns Promise<Post|null> The post object or null if not found
 */
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const posts = await getAllPosts();
    return posts.find((post) => post.id === id) || null;
  } catch (error) {
    console.error(`Error fetching post with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get a single blog post by slug
 * @param slug - The post slug/ID
 * @returns Promise<Post|null> The post object or null if not found
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug) || null;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Sort posts by date (newest first)
 * @param posts - Array of blog posts
 * @returns Post[] Sorted array of blog posts
 */
export function sortPostsByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get recent posts
 * @param count - Number of recent posts to fetch
 * @returns Promise<Post[]> Array of recent posts
 */
export async function getRecentPosts(count = 3): Promise<Post[]> {
  const posts = await getAllPosts();
  return sortPostsByDate(posts).slice(0, count);
}