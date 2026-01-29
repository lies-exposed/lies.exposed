import { createTestSetup } from "@liexp/backend/lib/test/setup/testSetup.js";
import { vi } from "vitest";
import { type ServerContext } from "../src/context/context.type.js";
import { type AppTest, initAppTest, loadAppContext } from "./AppTest.js";

// API-specific mocks - must be at top level for vitest hoisting
vi.mock("page-metadata-parser");
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@aws-sdk/lib-storage");
vi.mock("node-telegram-bot-api");

// Create test setup with API-specific configuration
createTestSetup<ServerContext, AppTest>(loadAppContext, initAppTest);
