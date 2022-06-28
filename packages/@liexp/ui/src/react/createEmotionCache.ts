import createCache from '@emotion/cache';
import { EmotionCache } from '@emotion/utils'

export default function createEmotionCache(): EmotionCache {
  return createCache({ key: 'css' });
}