import * as React from "react";

const BlockNoteInput = ({ source }: { source: string }) => (
  <div data-testid={`blocknote-${source}`} />
);

export default BlockNoteInput;
