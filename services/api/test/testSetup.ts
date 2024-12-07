import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { afterAll, beforeAll } from "vitest";
import { type AppTest, initAppTest, loadAppContext } from "./AppTest.js";
import { testDBContainer } from "./GetDockerContainer.js";
import D from "debug";

const logger = GetLogger("testSetup");

const g = global as any as { appContext: any; appTest?: AppTest };

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  if (!process.env.CI) {
    console.time("waitForDatabase");
    const database = await testDBContainer.waitForDatabase();
    console.timeEnd("waitForDatabase");

    process.env.DB_DATABASE = database;

    logger.info.log("running test with database", process.env.DB_DATABASE);
  }

  logger.debug.log("app context", !!g.appContext);

  if (!g.appContext) {
    logger.debug.log("loading app context");
    g.appContext = await loadAppContext(logger);
  }

  logger.debug.log("app context", !!g.appContext);

  g.appTest = await initAppTest(g.appContext, process.env.DB_DATABASE!);
});

afterAll(async () => {
  if (!process.env.CI) {
    await testDBContainer.markDatabaseAsUsed(process.env.DB_DATABASE!);
  }
  g.appTest = undefined;
  g.appContext = undefined;
});
