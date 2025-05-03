/**
 * Dev Server Proxy Configurations for Vue, Vite, and React
 *
 * This file contains proxy configurations to handle media paths in development environments.
 * These configurations help map requests from /_repo/medias to your blog engine URL.
 */

// Configuration constants
export const MEDIA_PATH = "/_repo/medias";
export const R2_URL = "https://static.repo.md";

// Common proxy configuration
export const CommonProxy = {
  [MEDIA_PATH]: {
    target: R2_URL,
    changeOrigin: true,
  },
};

// ----------------------------------------
// Vue.js Configuration
// ----------------------------------------

// Vue proxy configuration
export const VueDevProxy = {
  [MEDIA_PATH]: {
    target: R2_URL,
    changeOrigin: true,
  },
};

// Vue devServer configuration object
export const VueDevServer = {
  devServer: {
    proxy: VueDevProxy,
  },
};

// Vue full configuration
// Usage: In vue.config.js
export const VueConfig = {
  devServer: {
    proxy: {
      [MEDIA_PATH]: {
        target: R2_URL,
        changeOrigin: true,
      },
    },
  },
};

// ----------------------------------------
// Vite Configuration
// ----------------------------------------

// Vite proxy configuration
export const ViteDevProxy = {
  [MEDIA_PATH]: {
    target: R2_URL,
    changeOrigin: true,
  },
};

// Vite full configuration
// Usage: In vite.config.js
export const ViteConfig = {
  server: {
    proxy: ViteDevProxy,
  },
};

// ----------------------------------------
// React Configuration
// ----------------------------------------

// React proxy configuration
export const ReactDevProxy = {
  target: R2_URL,
  changeOrigin: true,
};

// React setupProxy example
// Usage: This is not directly importable, but shows how to use the configuration
// Place this in src/setupProxy.js
export const setupProxyExample = `
const { createProxyMiddleware } = require('http-proxy-middleware');
const { MEDIA_PATH, R2_URL } = require('./dev-server-configs');

module.exports = function(app) {
  app.use(
    MEDIA_PATH,
    createProxyMiddleware({
      target: R2_URL,
      changeOrigin: true,
    })
  );
};
`;

// React package.json simple proxy
// For basic cases, this can be added to package.json
export const reactPackageJsonProxy = {
  proxy: R2_URL,
};

// ----------------------------------------
// Usage Examples
// ----------------------------------------

/**
 * Vue.js Example:
 *
 * // vue.config.js
 * const { VueDevServer } = require('./dev-server-configs');
 *
 * module.exports = {
 *   ...VueDevServer,
 *   // other Vue configuration options
 * };
 */

/**
 * Vite Example:
 *
 * // vite.config.js
 * import { defineConfig } from 'vite';
 * import { ViteConfig } from './dev-server-configs';
 *
 * export default defineConfig({
 *   ...ViteConfig,
 *   // other Vite configuration options
 * });
 */

/**
 * React Example:
 *
 * // src/setupProxy.js
 * const { createProxyMiddleware } = require('http-proxy-middleware');
 * const { ReactDevProxy, MEDIA_PATH } = require('./dev-server-configs');
 *
 * module.exports = function(app) {
 *   app.use(MEDIA_PATH, createProxyMiddleware(ReactDevProxy));
 * };
 */
