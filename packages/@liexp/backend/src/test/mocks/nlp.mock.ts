import { vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import {
  type Document,
  type Model,
  type Sentences,
  type WinkMethods,
} from "wink-nlp";

const sentences = mock<Sentences>({}, { deep: true });
const doc = mock<Document>(
  {
    sentences: vi.fn(() => sentences),
  },
  { deep: true },
);
const winkMethods = mock<WinkMethods>(
  {
    readDoc: vi.fn(() => doc),
  },
  { deep: true },
);

type NLPMock = ((model: Model) => MockProxy<WinkMethods>) & {
  winkMethods: MockProxy<WinkMethods>;
  doc: MockProxy<Document>;
  sentences: MockProxy<Sentences>;
};

const NLPMock: NLPMock = Object.assign(
  vi.fn(() => winkMethods),
  {
    winkMethods,
    doc,
    sentences,
  },
);

export default NLPMock;
