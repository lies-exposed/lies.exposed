import { ACTOR_ENTITY_NAME } from "@liexp/backend/lib/entities/Actor.entity.js";
import { AREA_ENTITY_NAME } from "@liexp/backend/lib/entities/Area.entity.js";
import { EVENT_ENTITY_NAME } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EVENT_SUGGESTION_ENTITY_NAME } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { GROUP_ENTITY_NAME } from "@liexp/backend/lib/entities/Group.entity.js";
import { GROUP_MEMBER_ENTITY_NAME } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { KEYWORD_ENTITY_NAME } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LINK_ENTITY_NAME } from "@liexp/backend/lib/entities/Link.entity.js";
import { MEDIA_ENTITY_NAME } from "@liexp/backend/lib/entities/Media.entity.js";
import { PAGE_ENTITY_NAME } from "@liexp/backend/lib/entities/Page.entity.js";
import { SOCIAL_POST_ENTITY_NAME } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { STORY_ENTITY_NAME } from "@liexp/backend/lib/entities/Story.entity.js";
import { USER_ENTITY_NAME } from "@liexp/backend/lib/entities/User.entity.js";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import * as dotenv from "dotenv";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as path from "path";
import { ENV } from "../src/io/ENV.js";
import { GetTestDBManager } from "./utils/TestDBManager.js";

const moduleLogger = logger.GetLogger("global-setup");

export const testDBManager = GetTestDBManager(logger.GetLogger("test-db-manager"), {
  dbContainerName: "db.liexp.dev",
  redis: { host: process.env.REDIS_HOST || "127.0.0.1" },
  truncateTables: [
    // TODO: to be removed
    "project_image",
    "project",
    // ---
    SOCIAL_POST_ENTITY_NAME,
    EVENT_SUGGESTION_ENTITY_NAME,
    EVENT_ENTITY_NAME,
    STORY_ENTITY_NAME,
    ACTOR_ENTITY_NAME,
    GROUP_ENTITY_NAME,
    GROUP_MEMBER_ENTITY_NAME,
    AREA_ENTITY_NAME,
    MEDIA_ENTITY_NAME,
    LINK_ENTITY_NAME,
    KEYWORD_ENTITY_NAME,
    PAGE_ENTITY_NAME,
    USER_ENTITY_NAME,
  ],
});


const DATABASE_TOTAL = 30;

export default async (): Promise<() => void> => {
  try {
    const dotenvConfigPath = path.resolve(
      process.env.DOTENV_CONFIG_PATH ?? path.join(__dirname, "../.env.test"),
    );

    dotenv.config({ path: dotenvConfigPath });

    D.enable(process.env.DEBUG!);

    moduleLogger.debug.log("Process env %O", process.env);

    loadENV(__dirname, dotenvConfigPath, true);

    if (!process.env.CI) {
      const testDBContainer = await testDBManager("liexp_test");

      await testDBContainer.lookup();

      await testDBContainer.addDatabases(DATABASE_TOTAL);
      await testDBContainer.startDBTruncator();
    }

    await pipe(
      process.env,
      Schema.decodeUnknownEither(ENV),
      TE.fromEither,
      throwTE,
    );

    return async () => {
      if (!process.env.CI) {
        const testDBContainer = await testDBManager("liexp_test");
        const stats = await testDBContainer.getRunStats();
        // eslint-disable-next-line no-console
        console.log(
          `Test ran on ${stats.used} databases over a total of ${DATABASE_TOTAL}`,
        );
        console.log(`Run stats:\n${JSON.stringify(stats, null, 2)}`);

        await testDBContainer.freeDatabases();

        await testDBContainer.close();
      }
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};
