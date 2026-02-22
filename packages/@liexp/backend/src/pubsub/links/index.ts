import { SearchLinksPubSub } from "./searchLinks.pubSub.js";
import { TakeLinkScreenshotPubSub } from "./takeLinkScreenshot.pubSub.js";
import { UpdateEntitiesFromURLPubSub } from "./updateEntitiesFromURL.pubSub.js";

const LinkPubSub = {
  SearchLinks: SearchLinksPubSub,
  TakeLinkScreenshot: TakeLinkScreenshotPubSub,
  UpdateEntitiesFromURL: UpdateEntitiesFromURLPubSub,
};

export { LinkPubSub };
