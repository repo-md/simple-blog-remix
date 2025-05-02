import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import repo from "../../repo/client";
import RecentPosts from "~/components/RecentPosts";
import type { Post } from "~/types/blog";

export const meta: MetaFunction = () => {
  return [
    { title: "Remo.md Remix Blog template- Home" },
    { name: "description", content: "Welcome to our Remix Blog!" },
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
      <div className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to Remix Blog
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            A demo blog built with Remix, React, and Tailwind CSS
          </p>
        </div>
      </div>

      <div className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">About This Blog</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            This is a demo blog application that shows how to build a dynamic blog with Remix. 
            It uses a JSON file as a data source and demonstrates how to create dynamic routes for blog posts.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            The blog posts are fetched from an external API and displayed with proper formatting.
            This demonstrates how to use Remix's loader functions to fetch and display dynamic content.
          </p>
        </div>
      </div>

      <RecentPosts posts={posts} max={3} />
    </div>
  );
}
