import fc from "fast-check";
import * as Actor from "./arbitrary/Actor.arbitrary.js";
import * as Area from "./arbitrary/Area.arbitrary.js";
import * as Group from "./arbitrary/Group.arbitrary.js";
import * as Link from "./arbitrary/Link.arbitrary.js";
import * as Media from "./arbitrary/Media.arbitrary.js";
import * as Nation from "./arbitrary/Nation.arbitrary.js";
import * as Story from "./arbitrary/Story.arbitrary.js";
import * as UUID from "./arbitrary/common/UUID.arbitrary.js";
import * as Event from "./arbitrary/events/index.arbitrary.js";

const Arbs = {
  UUID,
  Actor,
  Area,
  Group,
  Link,
  Media,
  Nation,
  Story,
  Event,
};

export { fc, Actor, Area, Group, Link, Media, Event, Nation, Story, Arbs };
