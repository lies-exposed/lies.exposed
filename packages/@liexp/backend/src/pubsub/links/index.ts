import { SearchLinksPubSub } from "./searchLinks.pubSub.js";
import { TakeLinkScreenshotPubSub } from "./takeLinkScreenshot.pubSub.js";

const LinkPubSub = {
  SearchLinks: SearchLinksPubSub,
  TakeLinkScreenshot: TakeLinkScreenshotPubSub,
};

export { LinkPubSub };
