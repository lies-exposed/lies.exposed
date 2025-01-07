import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { afterAll, beforeAll } from "vitest";
import { type AppTest, initAppTest, loadAppContext } from "./AppTest.js";
import { testDBContainer } from "./GetDockerContainer.js";
import { upsertNLPEntities } from "@liexp/backend/lib/flows/admin/nlp/upsertEntities.flow.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { ServerContext } from '../src/context/context.type.js'
import path from 'path';

const logger = GetLogger("testSetup");

const g = global as any as { appContext: ServerContext; appTest?: AppTest };

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

  const configFile = path.resolve(g.appContext.config.dirs.config.nlp, "entities.json")

  console.log("configFile", configFile);
  await pipe(
    getOlderThanOr(
      configFile,
      10,
    )(upsertNLPEntities)(g.appContext),
    throwTE,
  );

  logger.debug.log("app context", !!g.appContext);

  g.appTest = await initAppTest(g.appContext, process.env.DB_DATABASE!);
});

afterAll(async () => {
  if (!process.env.CI) {
    await testDBContainer.markDatabaseAsUsed(process.env.DB_DATABASE!);
  }
  g.appContext.fs._fs.rmSync(path.resolve(g.appContext.config.dirs.config.nlp, "entities.json"));
  g.appTest = undefined;
  g.appContext = undefined as any;
});
