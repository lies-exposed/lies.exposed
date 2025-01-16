import path from "path";
import { type BEConfig } from "@liexp/backend/lib/context/config.context.js";
import { EventsConfig } from "@liexp/backend/lib/queries/config/index.js";
import type * as cors from "cors";
import { type ENV } from "#io/ENV.js";

export interface AppConfig extends BEConfig {
  cors: cors.CorsOptions;
}

export const Config = (env: ENV, cwd: string): AppConfig => {
  const tempRoot = path.resolve(cwd, "temp");

  const configFolders = {
    nlp: path.resolve(cwd, "config", "nlp"),
  };

  const tempFolders = {
    root: tempRoot,
    media: path.resolve(tempRoot, "media"),
    nlp: path.resolve(tempRoot, "nlp"),
    queue: path.resolve(tempRoot, "queue"),
    stats: path.resolve(tempRoot, "stats"),
  };

  return {
    cors: {
      origin: env.NODE_ENV === "production" ? true : "*",
    },
    events: EventsConfig,
    media: {
      thumbnailWidth: 300,
      thumbnailHeight: 200,
    },
    dirs: {
      cwd,
      config: configFolders,
      temp: tempFolders,
    },
  };
};
