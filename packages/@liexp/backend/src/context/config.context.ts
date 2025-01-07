import { type EventsConfig } from "../queries/config";

export interface BEConfig {
  dirs: {
    cwd: string;
    config: {
      nlp: string;
    };
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
export interface ConfigContext<C = BEConfig> {
  config: C;
}
