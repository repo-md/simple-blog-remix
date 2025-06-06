/**
 * Instance of the RepoMD client to be used throughout the application.
 * This ensures we're using a single consistent client with the same configuration.
 */

//import RepoMD from "./repo-old-local-copy/index.js";
// import RepoMD from "../repo-client/src/lib/index.js";
import { RepoMD } from "repo-md";
// Create and export a singleton instance of the RepoMD client
const repo = new RepoMD({
  orgSlug: "iplanwebsites",
  orgId: null,
  projectSlug: "port1g", //requires org to be defined.

  projectId: "680e97604a0559a192640d2c",

  // rev: "68135ef83eb888fca85d2645", //  default to latest release if none are passed.

  debug: true,

  //project: "680e97604a0559a192640d2c", //will be retired
  //org: "iplanwebsites",
});

export default repo;
