import { mocks } from "@liexp/backend/lib/test/mocks.js";
import { createTestSetup } from "@liexp/backend/lib/test/setup/testSetup.js";
import { vi } from "vitest";
import { type WorkerContext } from "../src/context/context.js";
import { type WorkerTest, initAppTest, loadAppContext } from "./WorkerTest.js";

// Worker-specific mocks - must be at top level for vitest hoisting
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mocks.axios),
  },
}));
vi.mock("page-metadata-parser");
vi.mock("puppeteer-core", () => ({ KnownDevices: {} }));
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@aws-sdk/lib-storage");
vi.mock("node-telegram-bot-api");

// Create test setup with Worker-specific configuration
createTestSetup<WorkerContext, WorkerTest>(loadAppContext, initAppTest);
