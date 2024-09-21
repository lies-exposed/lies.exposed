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

export const Config = (env: ENV): AppConfig => {
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
      cwd: process.cwd(),
      temp: {
        root: path.resolve(process.cwd(), "temp"),
        media: path.resolve(process.cwd(), "temp/media"),
        nlp: path.resolve(process.cwd(), "temp/nlp"),
        queue: path.resolve(process.cwd(), "temp/queue"),
        stats: path.resolve(process.cwd(), "temp/stats"),
      },
    },
  };
};
