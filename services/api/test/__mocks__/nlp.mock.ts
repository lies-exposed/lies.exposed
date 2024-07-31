import { mock, type MockProxy } from "vitest-mock-extended";
import { type Document, type Sentences, type WinkMethods } from "wink-nlp";

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

const NLPMock = vi.fn(() => winkMethods);

(NLPMock as any).winkMethods = winkMethods;
(NLPMock as any).doc = doc;
(NLPMock as any).sentences = sentences;

interface NLPMock {
  (): MockProxy<WinkMethods>;
  winkMethods: MockProxy<WinkMethods>;
  doc: MockProxy<Document>;
  sentences: MockProxy<Sentences>;
}

export default NLPMock;
