#!/usr/bin/env node
/* eslint-disable no-console */

import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  EventSuggestionCreate,
  EventSuggestionEdit,
  EventSuggestionRead,
  MCPToolsAccess,
  type AuthPermission,
} from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import dotenv from "dotenv";
import { createServiceClientToken } from "../utils/serviceClientTokenGenerator.js";

// Load environment variables
dotenv.config();

const logger = GetLogger("generate-service-token");

// Available permissions mapping
const AVAILABLE_PERMISSIONS: Record<string, AuthPermission> = {
  "admin:read": AdminRead.literals[0],
  "admin:create": AdminCreate.literals[0],
  "admin:edit": AdminEdit.literals[0],
  "admin:delete": AdminDelete.literals[0],
  "event-suggestion:read": EventSuggestionRead.literals[0],
  "event-suggestion:create": EventSuggestionCreate.literals[0],
  "event-suggestion:edit": EventSuggestionEdit.literals[0],
  "mcp:tools": MCPToolsAccess.literals[0],
};

const showHelp = () => {
  console.log(`
Service Client Token Generator

Usage: pnpm tsx src/bin/generate-service-token.ts [options]

Options:
  --permission <permission>  Add permission to the token (can be used multiple times)
  --help                     Show this help message

Available permissions:
  admin:read                 Read access to admin resources
  admin:create               Create access to admin resources  
  admin:edit                 Edit access to admin resources
  admin:delete               Delete access to admin resources
  event-suggestion:read      Read access to event suggestions
  event-suggestion:create    Create access to event suggestions
  event-suggestion:edit      Edit access to event suggestions
  mcp:tools                  Access to MCP (Model Context Protocol) tools

Examples:
  # Generate token with MCP tools access only
  pnpm tsx src/bin/generate-service-token.ts --permission mcp:tools

  # Generate token with multiple permissions
  pnpm tsx src/bin/generate-service-token.ts --permission mcp:tools --permission admin:read

  # Generate token for agent service (recommended default)
  pnpm tsx src/bin/generate-service-token.ts --permission mcp:tools --permission admin:read

Environment Variables:
  JWT_SECRET                 Required. JWT signing secret from .env file
`);
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const permissions: AuthPermission[] = [];
  let showHelpFlag = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      showHelpFlag = true;
    } else if (arg === "--permission" || arg === "-p") {
      const permission = args[i + 1];
      if (!permission) {
        console.error("Error: --permission requires a value");
        process.exit(1);
      }

      if (!AVAILABLE_PERMISSIONS[permission]) {
        console.error(`Error: Unknown permission "${permission}"`);
        console.error(
          "Available permissions:",
          Object.keys(AVAILABLE_PERMISSIONS).join(", "),
        );
        process.exit(1);
      }

      permissions.push(AVAILABLE_PERMISSIONS[permission]);
      i++; // Skip next argument as it's the permission value
    } else {
      console.error(`Error: Unknown option "${arg}"`);
      showHelp();
      process.exit(1);
    }
  }

  return { permissions, showHelpFlag };
};

const generateServiceToken = () => {
  const { permissions, showHelpFlag } = parseArgs();

  if (showHelpFlag) {
    showHelp();
    return;
  }

  if (permissions.length === 0) {
    console.error("Error: At least one permission must be specified");
    console.error("Use --help to see available permissions");
    process.exit(1);
  }

  logger.info.log("Generating service client token...");

  // Simple JWT provider setup
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error.log("JWT_SECRET environment variable is required");
    process.exit(1);
  }

  const jwtProvider = GetJWTProvider({
    secret: jwtSecret,
    logger,
  });

  const ctx = { jwt: jwtProvider };

  logger.info.log("JWT provider initialized successfully");

  const result = createServiceClientToken("api", permissions)(ctx)();

  logger.info.log("Generated service client:");
  logger.info.log("ID:", result.serviceClient.id);
  logger.info.log("User ID:", result.serviceClient.userId);
  logger.info.log("Permissions:", result.serviceClient.permissions);
  logger.info.log("Token:", result.token);

  console.log("\n=== Service Client Token ===");
  console.log("ID:", result.serviceClient.id);
  console.log("User ID:", result.serviceClient.userId);
  console.log("Permissions:", result.serviceClient.permissions.join(", "));
  console.log("Token:", result.token);
  console.log("\n=== Environment Variable ===");
  console.log(`API_TOKEN=${result.token}`);
  console.log("\nAdd this to your service environment configuration.");

  process.exit(0);
};

Promise.resolve(generateServiceToken()).catch((error) => {
  logger.error.log("Failed to generate service token:", error);
  process.exit(1);
});
