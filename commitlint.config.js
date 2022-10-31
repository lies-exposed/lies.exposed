module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-case": [2, "always", "lowerCase"],
    "scope-enum": [
      2,
      "always",
      [
        "workspace",
        "core",
        "shared",
        "test",
        "ui",
        "web",
        "admin",
        "api",
        "storybook",
      ],
    ],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "docs",
        "refactor",
        "chore",
        "revert",
        "ci",
        "style",
        "test",
        "release",
        "build",
      ],
    ],
  },
};
