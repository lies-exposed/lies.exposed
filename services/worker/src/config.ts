import { mkdirSync } from "fs";
import path from "path";
import { type BEConfig } from "@liexp/backend/lib/context/config.context.js";
import { EventsConfig } from "@liexp/backend/lib/queries/config/index.js";

export type WorkerConfig = BEConfig;

export const Config = (cwd: string): WorkerConfig => {
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
    tg: path.resolve(tempRoot, "tg"),
  };

  Object.values(tempFolders).forEach((folder) => {
    mkdirSync(folder, { recursive: true });
  });

  return {
    media: {
      thumbnailWidth: 300,
      thumbnailHeight: 200,
    },
    dirs: {
      cwd,
      config: configFolders,
      temp: tempFolders,
    },
    events: EventsConfig,
  };
};
