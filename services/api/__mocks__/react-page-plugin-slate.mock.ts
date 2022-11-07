const pluginFactories = { createComponentPlugin: jest.fn() };

export { pluginFactories };

const def: any = {
  plugins: {
    headings: {
      h1: jest.fn(),
      h2: jest.fn(),
      h3: jest.fn(),
      h4: jest.fn(),
      h5: jest.fn(),
      h6: jest.fn(),
    },
    paragraphs: { paragraph: jest.fn() },
    lists: {
      ul: jest.fn(),
      li: jest.fn(),
    },
  },
};
const slate = jest.fn().mockImplementation((fn) => ({
  ...fn(def),
  createData: jest.fn((fn) => fn(def)),
}));

export default slate;
