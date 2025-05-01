/**
 * Instance of the RepoMD client to be used throughout the application.
 * This ensures we're using a single consistent client with the same configuration.
 */

import RepoMD from "./RepoMD";

// Create and export a singleton instance of the RepoMD client
const repo = new RepoMD({
  org: "iplanwebsites",
  project: "680e97604a0559a192640d2c",
  ref: "68135ef83eb888fca85d2645",
  debug: true
});

export default repo;