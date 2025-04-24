import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { afterAll, beforeAll } from "vitest";
import { type AppTest, initAppTest, loadAppContext } from "./AppTest.js";
import { testDBContainer } from "./GetDockerContainer.js";
import D from "debug";
import { ServerContext } from '../src/context/context.type.js'

const logger = GetLogger("testSetup");

const g = global as any as { appContext: ServerContext; appTest?: AppTest };

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  if (!process.env.CI) {
    console.time("waitForDatabase");
    const database = await testDBContainer.waitForDatabase();
    console.timeEnd("waitForDatabase");
    console.log('database in use', database);

    process.env.DB_DATABASE = database;

    logger.info.log("running test with database", process.env.DB_DATABASE);
  }

  logger.debug.log("app context", !!g.appContext);

  if (!g.appContext) {
    logger.debug.log("loading app context");
    g.appContext = await loadAppContext(logger);
  }

  logger.debug.log("app context", !!g.appContext);

  if (!process.env.CI) {
    g.appTest = await initAppTest(g.appContext, process.env.DB_DATABASE!);
  } else if (!g.appTest) {
    g.appTest = await initAppTest(g.appContext, process.env.DB_DATABASE!);
  }
});

afterAll(async () => {
  if (!process.env.CI) {
    console.log('cooling down database', process.env.DB_DATABASE);
    await g.appTest?.utils.e2eAfterAll();
    await testDBContainer.markDatabaseAsUsed(process.env.DB_DATABASE!);
    g.appContext = undefined as any;
    g.appTest = undefined;
  }
});
