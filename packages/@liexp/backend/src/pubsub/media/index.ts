import { CreateMediaThumbnailPubSub } from "./createThumbnail.pubSub.js";
import { ExtractMediaExtraPubSub } from "./extractMediaExtra.pubSub.js";
import { GenerateThumbnailPubSub } from "./generateThumbnail.pubSub.js";
import { TransferMediaFromExternalProviderPubSub } from "./transferFromExternalProvider.pubSub.js";

const MediaPubSub = {
  TransferMediaFromExternalProviderPubSub,
  CreateMediaThumbnailPubSub,
  GenerateThumbnailPubSub,
  ExtractMediaExtraPubSub,
};

export { MediaPubSub };
