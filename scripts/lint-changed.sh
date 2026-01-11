#!/bin/bash
# Lint only files that have changed compared to a base branch (default: main)
#
# Usage:
#   ./scripts/lint-changed.sh           # lint changes vs main
#   ./scripts/lint-changed.sh develop   # lint changes vs develop
#   ./scripts/lint-changed.sh --staged  # lint only staged files
#   ./scripts/lint-changed.sh --fix     # lint and auto-fix changes vs main
#   ./scripts/lint-changed.sh develop --fix  # lint and auto-fix changes vs develop

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

BASE_BRANCH="main"
STAGED_ONLY=false
FIX_FLAG=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --staged)
      STAGED_ONLY=true
      shift
      ;;
    --fix)
      FIX_FLAG="--fix"
      shift
      ;;
    *)
      BASE_BRANCH="$1"
      shift
      ;;
  esac
done

cd "$ROOT_DIR"

# Get the list of changed files
if [ "$STAGED_ONLY" = true ]; then
  echo "Checking staged files..."
  CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)
else
  echo "Checking files changed compared to $BASE_BRANCH..."
  # Include both committed changes and uncommitted changes
  CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH"...HEAD --diff-filter=ACMR 2>/dev/null || git diff --name-only "$BASE_BRANCH" --diff-filter=ACMR)
  # Also include unstaged changes
  UNSTAGED=$(git diff --name-only --diff-filter=ACMR)
  if [ -n "$UNSTAGED" ]; then
    CHANGED_FILES=$(echo -e "$CHANGED_FILES\n$UNSTAGED" | sort -u)
  fi
fi

# Filter for lintable files (ts, tsx, js, jsx) and exclude .d.ts and node_modules
LINT_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' | grep -v '\.d\.ts$' | grep -v 'node_modules' || true)

# Remove files that no longer exist (deleted files)
EXISTING_FILES=""
for file in $LINT_FILES; do
  if [ -f "$file" ]; then
    EXISTING_FILES="$EXISTING_FILES $file"
  fi
done

EXISTING_FILES=$(echo "$EXISTING_FILES" | xargs)

if [ -z "$EXISTING_FILES" ]; then
  echo "No lintable files changed."
  exit 0
fi

# Count files
FILE_COUNT=$(echo "$EXISTING_FILES" | wc -w | xargs)
echo "Found $FILE_COUNT file(s) to lint:"
echo "$EXISTING_FILES" | tr ' ' '\n' | head -20
if [ "$FILE_COUNT" -gt 20 ]; then
  echo "... and $((FILE_COUNT - 20)) more"
fi
echo ""

# Group files by package/service directory (first two path components for packages/@liexp/*, first component for services/*)
declare -A PACKAGE_FILES

for file in $EXISTING_FILES; do
  # Determine the package directory based on path structure
  if [[ "$file" == packages/@liexp/* ]]; then
    # For packages/@liexp/foo/..., the package dir is packages/@liexp/foo
    PACKAGE_DIR=$(echo "$file" | cut -d'/' -f1-3)
  elif [[ "$file" == services/* ]]; then
    # For services/foo/..., the package dir is services/foo
    PACKAGE_DIR=$(echo "$file" | cut -d'/' -f1-2)
  else
    # Root level files - skip for now as there's no root eslint config
    echo "Skipping root-level file: $file"
    continue
  fi

  # Check if this package has an eslint config
  if [ -f "$PACKAGE_DIR/eslint.config.js" ] || [ -f "$PACKAGE_DIR/eslint.config.mjs" ]; then
    # Convert file path to be relative to package directory
    REL_FILE="${file#$PACKAGE_DIR/}"
    PACKAGE_FILES["$PACKAGE_DIR"]+=" $REL_FILE"
  else
    echo "Warning: No eslint config found for $PACKAGE_DIR, skipping $file"
  fi
done

# Track overall exit status
EXIT_STATUS=0

# Run eslint for each package
for PACKAGE_DIR in "${!PACKAGE_FILES[@]}"; do
  FILES="${PACKAGE_FILES[$PACKAGE_DIR]}"
  if [ -n "$FILES" ]; then
    echo ""
    echo "=== Linting $PACKAGE_DIR ==="
    FILES_TRIMMED=$(echo "$FILES" | xargs)

    # Run eslint from the package directory
    # shellcheck disable=SC2086
    if ! (cd "$PACKAGE_DIR" && pnpm eslint $FIX_FLAG $FILES_TRIMMED); then
      EXIT_STATUS=1
    fi
  fi
done

if [ $EXIT_STATUS -eq 0 ]; then
  echo ""
  echo "All files linted successfully!"
fi

exit $EXIT_STATUS
