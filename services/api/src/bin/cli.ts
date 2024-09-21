import { loadENV } from "@liexp/core/lib/env/utils.js";
import D from "debug";
import { assignDefaultAreaFeaturedImage } from "./assign-default-area-featured-image.js";
import { cleanSpaceMedia } from "./clean-space-media.js";
import { cleanTGMessages } from "./clean-tg-messages.js";
import { type CommandFlow } from "./command.type.js";
import { createFromWikipedia } from "./create-from-wikipedia.js";
import { createStats } from "./create-stats.js";
import { extractActorAndGroupAvatar } from "./extract-actor-and-group-avatar.js";
import { extractEntitiesFromURL } from "./extract-entities-from-url.js";
import { extractEvents } from "./extract-events.js";
import { importFromKMZ } from "./import-from-kmz.js";
import { parseTGMessage } from "./parse-tg-message.js";
import { setDefaultGroupUsernames } from "./set-default-group-usernames.js";
import { sharePostMessage } from "./share-post-message.js";
import { startContext, stopContext } from "./start-ctx.js";
import { updateEventPayloadURLRefs } from "./update-event-payload-url-refs.js";
import { upsertNLPEntities } from "./upsert-nlp-entities.js";
import { upsertTGPinnedMessage } from "./upsert-tg-pinned-message.js";

const commands: Record<string, CommandFlow> = {
  "assign-default-area-featured-image": assignDefaultAreaFeaturedImage,
  "clean-space-media": cleanSpaceMedia,
  "clean-tg-messages": cleanTGMessages,
  "create-from-wikipedia": createFromWikipedia,
  "create-stats": createStats,
  "extract-entities-from-url": extractEntitiesFromURL,
  "extract-actor-and-group-avatar": extractActorAndGroupAvatar,
  "extract-events": extractEvents,
  "import-from-kmz": importFromKMZ,
  "parse-tg-message": parseTGMessage,
  "set-default-group-usernames": setDefaultGroupUsernames,
  "share-post-message": sharePostMessage,
  "update-event-payload-url-refs": updateEventPayloadURLRefs,
  "upsert-nlp-entities": upsertNLPEntities,
  "upsert-tg-pinned-message": upsertTGPinnedMessage,
};

const run = async ([command, ...args]: string[]): Promise<void> => {
  if (!command || commands[command] === undefined) {
    // eslint-disable-next-line no-console
    console.error(
      `No valid command provided: ${command}\nAvailable commands: ${Object.keys(commands).join(", ")}`,
    );
    process.exit(1);
  }

  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  ctx.logger.info.log("Running command %s with args: %O", command, args);
  try {
    await commands[command](ctx, args);
  } catch (e) {
    ctx.logger.error.log("Error running command %s: %O", command, e);
  } finally {
    await stopContext(ctx);
  }
};

void run(process.argv.splice(2));
