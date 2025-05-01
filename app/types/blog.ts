/**
 * Blog post data structures
 */

/**
 * Table of contents item
 */
export interface TocItem {
  // Structure will depend on your actual TOC data
  // This is a placeholder until we know the exact structure
  [key: string]: any;
}

/**
 * Front matter for blog posts
 */
export interface Frontmatter {
  /**
   * Post title
   */
  title: string;
  
  /**
   * Whether the post is public
   */
  public: boolean;
  
  /**
   * Any other front matter properties
   */
  [key: string]: any;
}

/**
 * Represents a blog post
 */
export interface Post {
  /**
   * File name of the post
   */
  fileName: string;
  
  /**
   * Slug for the post URL
   */
  slug: string;
  
  /**
   * Front matter metadata
   */
  frontmatter: Frontmatter;
  
  /**
   * First paragraph text
   */
  firstParagraphText: string;
  
  /**
   * Plain text content
   */
  plain: string;
  
  /**
   * HTML content
   */
  html: string;
  
  /**
   * Table of contents
   */
  toc: TocItem[];
  
  /**
   * Original file path
   */
  originalFilePath: string;
}