import createCache from "@emotion/cache";
import { type EmotionCache } from "@emotion/utils";

export default function createEmotionCache(): EmotionCache {
  return createCache({ key: "css", prepend: true });
}
