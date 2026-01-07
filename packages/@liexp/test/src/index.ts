import fc from "fast-check";
import * as Media from "./arbitrary/Media.arbitrary.js";
import * as Nation from "./arbitrary/Nation.arbitrary.js";
import * as UUID from "./arbitrary/common/UUID.arbitrary.js";
import * as Event from "./arbitrary/events/index.arbitrary.js";

const Arbs = {
  UUID,
  Media,
  Nation,
  Event,
};

export { fc, Media, Event, Nation, Arbs };
