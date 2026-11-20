import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";
import { type IGProvider } from "../../providers/ig/ig.provider.js";

export const igProviderMock: DeepMockProxy<IGProvider> = mockDeep<IGProvider>();
