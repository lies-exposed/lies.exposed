import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";
import { type TGBotProvider } from "../../providers/tg/tg.provider.js";

export const tgProviderMock: DeepMockProxy<TGBotProvider> =
  mockDeep<TGBotProvider>();
