import { execSync } from "child_process";

// Get version info from git at build time
export const getGitInfo = (): { version: string; commitHash: string } => {
  try {
    const commitHash = execSync("git rev-parse HEAD", {
      encoding: "utf-8",
    }).trim();
    // Try to get version from git describe, fallback to package.json version
    let version: string;
    try {
      version = execSync("git describe --tags --abbrev=0", {
        encoding: "utf-8",
      }).trim();
      // Remove 'lies.exposed@' prefix if present
      version = version.replace(/^lies\.exposed@/, "");
    } catch {
      // No tags, try to read from package.json
      try {
        const pkg = JSON.parse(
          execSync("cat package.json", { encoding: "utf-8" }),
        );
        version = pkg.version ?? "0.0.0";
      } catch {
        version = "0.0.0";
      }
    }
    return { version, commitHash };
  } catch {
    return { version: "0.0.0", commitHash: "unknown" };
  }
};
