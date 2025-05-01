/**
 * Blog post data API functions
 */

const POSTS_API_URL =
  "https://r2.repo.md/iplanwebsites/680e97604a0559a192640d2c/68135d183eb888fca85d2644/posts.json";

export function getR2Url(
  path,
  org = "iplanwebsites",
  project = "680e97604a0559a192640d2c",
  rev = "68135d183eb888fca85d2644"
) {
  return `https://r2.repo.md/${org}/${project}/${rev}/_media/${path}`;
}

/**
 * Fetch all blog posts
 * @returns {Promise<Array>} Array of blog posts
 */
export async function getAllPosts() {
  try {
    const response = await fetch(POSTS_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    const j = await response.json();
    // console.log(j, 432423);
    return j;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

/**
 * Get a single blog post by ID
 * @param {string} id - The post ID
 * @returns {Promise<Object|null>} The post object or null if not found
 */
export async function getPostById(id) {
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
 * @param {string} slug - The post slug/ID
 * @returns {Promise<Object|null>} The post object or null if not found
 */
export async function getPostBySlug(slug) {
  console.log("getPostBySlug", slug);
  try {
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug) || null;
  } catch (error) {
    console.error(`Error fetching post with ID ${slug}:`, error);
    return null;
  }
}

/**
 * Sort posts by date (newest first)
 * @param {Array} posts - Array of blog posts
 * @returns {Array} Sorted array of blog posts
 */
export function sortPostsByDate(posts) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get recent posts
 * @param {number} count - Number of recent posts to fetch
 * @returns {Promise<Array>} Array of recent posts
 */
export async function getRecentPosts(count = 3) {
  const posts = await getAllPosts();
  return sortPostsByDate(posts).slice(0, count);
}
