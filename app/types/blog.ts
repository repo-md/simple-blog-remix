/**
 * Blog post data structures
 */

/**
 * Represents a blog post
 */
export interface Post {
  /**
   * Unique identifier for the post
   */
  id: string;
  
  /**
   * Post title
   */
  title: string;
  
  /**
   * Publication date in ISO string format
   */
  date: string;
  
  /**
   * Short summary of the post
   */
  excerpt: string;
  
  /**
   * Full content of the post
   */
  content: string;
}