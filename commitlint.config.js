export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-case": [2, "always", "lowerCase"],
    "scope-enum": [
      2,
      "always",
      [
        "workspace",
        "core",
        "io",
        "shared",
        "test",
        "backend",
        "ui",
        "web",
        "admin",
        "api",
        "worker",
        "ai-bot",
        "agent",
        "storybook",
        "localai",
        // used by Dependabot
        "deps",
        "deps-dev",
      ],
    ],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "chore",
        "refactor",
        "revert",
        "ci",
        "test",
        "release",
        // used by Dependabot
        "build",
      ],
    ],
  },
};
