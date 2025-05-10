import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { afterAll, beforeAll } from "vitest";
import { type AppTest, initAppTest, loadAppContext } from "./AppTest.js";
import D from "debug";
import { ServerContext } from "../src/context/context.type.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { testDBManager } from "./globalSetup.js";

const logger = GetLogger("testSetup");

const g = global as any as { appContext: ServerContext; appTest?: AppTest };
let database;

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  if (!process.env.CI) {
    const testDBContainer = await testDBManager("liexp_test");

    database = await testDBContainer.waitForDatabase();
  } else {
    database = process.env.DB_DATABASE!;
  }

  if (!g.appContext) {
    logger.debug.log("loading app context");
    g.appContext = await loadAppContext(logger, database);
  }

  logger.debug.log("app context", !!g.appContext, database);

  g.appTest = await initAppTest(g.appContext, database!);
});

afterAll(async () => {
  if (!process.env.CI) {
    const testDBContainer = await testDBManager("liexp_test");

    await testDBContainer.releaseDatabaseAndClose(process.env.DB_DATABASE!);
  }

  if (g.appTest?.ctx.db) {
    await throwTE(g.appTest.ctx.db.close());
  }

  if (process.env.CI) {
    g.appContext = undefined as any;
  }

  g.appTest = undefined;
});
