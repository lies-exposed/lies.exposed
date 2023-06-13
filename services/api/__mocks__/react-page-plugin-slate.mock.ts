const pluginFactories = { createComponentPlugin: vi.fn() };

export { pluginFactories };

const def: any = {
  plugins: {
    headings: {
      h1: vi.fn(),
      h2: vi.fn(),
      h3: vi.fn(),
      h4: vi.fn(),
      h5: vi.fn(),
      h6: vi.fn(),
    },
    paragraphs: { paragraph: vi.fn() },
    lists: {
      ul: vi.fn(),
      li: vi.fn(),
    },
  },
};
const slate = vi.fn().mockImplementation((fn) => ({
  ...fn(def),
  createData: vi.fn((fn) => fn(def)),
}));

export default slate;
