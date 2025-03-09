export type PromptFn<Vars = undefined> = Vars extends undefined
  ? () => string
  : (args: { vars: Vars }) => string;
