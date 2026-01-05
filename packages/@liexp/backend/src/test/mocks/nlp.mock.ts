import { vi } from "vitest";
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

interface NLPMock {
  (): MockProxy<WinkMethods>;
  winkMethods: MockProxy<WinkMethods>;
  doc: MockProxy<Document>;
  sentences: MockProxy<Sentences>;
}

const NLPMock = vi.fn(() => winkMethods) as unknown as NLPMock;

NLPMock.winkMethods = winkMethods;
NLPMock.doc = doc;
NLPMock.sentences = sentences;

export default NLPMock;
