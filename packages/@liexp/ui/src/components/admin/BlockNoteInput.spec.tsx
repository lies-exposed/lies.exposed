import { toParagraph } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Form, RecordContextProvider, TestMemoryRouter } from "react-admin";
import { describe, expect, it, vi } from "vitest";
import BlockNoteInput from "./BlockNoteInput.js";

vi.mock("../Common/BlockNote/index.js", () => ({
  BNEditor: ({ content }: { content: unknown }) => (
    <div data-testid="bn-editor">{JSON.stringify(content)}</div>
  ),
}));

const renderInput = (body: unknown): void => {
  const record = { id: "record-id", body };

  render(
    <TestMemoryRouter>
      <RecordContextProvider value={record}>
        <Form record={record}>
          <BlockNoteInput source="body" />
        </Form>
      </RecordContextProvider>
    </TestMemoryRouter>,
  );
};

describe("BlockNoteInput", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty array", []],
  ])("renders an empty editor when the value is %s", async (_, value) => {
    renderInput(value);

    const editor = await screen.findByTestId("bn-editor");
    expect(editor.textContent).toBe("[]");
  });

  it("passes an existing document to the editor", async () => {
    const document = [toParagraph("hello")];

    renderInput(document);

    const editor = await screen.findByTestId("bn-editor");
    expect(editor.textContent).toBe(JSON.stringify(document));
  });

  it("renders nothing for a value that is not a document", () => {
    renderInput({ rows: [] });

    expect(screen.queryByTestId("bn-editor")).not.toBeInTheDocument();
  });
});
