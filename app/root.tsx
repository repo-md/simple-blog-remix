import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-800 dark:text-white">Repo.md Blog</a>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/" className="text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-500">Home</a>
              </li>
              <li>
                <a href="/blog" className="text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-500">Blog</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Repo.md Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
