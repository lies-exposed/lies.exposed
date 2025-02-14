import { EventsConfig } from "../queries/config/index.js";

export const testConfig = {
  dirs: {
    cwd: "",
    config: { nlp: "" },
    temp: { root: "", queue: "", stats: "", nlp: "", media: "" },
  },
  media: {
    thumbnailHeight: 0,
    thumbnailWidth: 0,
  },
  events: EventsConfig,
};
