import { mkdirSync } from "fs";
import path from "path";
import type * as cors from "cors";
import { type ENV } from "#io/ENV.js";
import { EventsConfig } from "#queries/config/index.js";

export interface AppConfig {
  cors: cors.CorsOptions;
  dirs: {
    cwd: string;
    temp: {
      root: string;
      nlp: string;
      media: string;
      queue: string;
      stats: string;
    };
  };
  media: {
    thumbnailWidth: number;
    thumbnailHeight: number;
  };
  events: EventsConfig;
}

export const Config = (env: ENV, cwd: string): AppConfig => {
  const tempRoot = path.resolve(cwd, "temp");

  const tempFolders = {
    root: tempRoot,
    media: path.resolve(tempRoot, "media"),
    nlp: path.resolve(tempRoot, "nlp"),
    queue: path.resolve(tempRoot, "queue"),
    stats: path.resolve(tempRoot, "stats"),
  };

  Object.values(tempFolders).forEach((folder) => {
    mkdirSync(folder, { recursive: true });
  });

  return {
    cors: {
      origin: env.NODE_ENV === "production" ? true : "*",
    },
    events: EventsConfig,
    media: {
      thumbnailWidth: 400,
      thumbnailHeight: 300,
    },
    dirs: {
      cwd,
      temp: tempFolders,
    },
  };
};
