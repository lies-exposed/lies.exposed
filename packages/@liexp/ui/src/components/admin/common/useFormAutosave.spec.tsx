import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { RecordContextProvider, ResourceContextProvider } from "react-admin";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it } from "vitest";
import {
  useFormAutosave,
  type UseFormAutosaveOptions,
} from "./useFormAutosave.js";

const KEY_NEW = "liexp:autosave:stories:new";
const KEY_ABC = "liexp:autosave:stories:abc";

const Inner: React.FC<{
  methods: ReturnType<typeof useForm<{ title: string }>>;
  opts?: UseFormAutosaveOptions;
}> = ({ methods, opts }) => {
  const { draft, restore, discard, lastSavedAt } = useFormAutosave(opts);
  return (
    <div>
      <input aria-label="title" {...methods.register("title")} />
      <span data-testid="draft">{draft ? "found" : "none"}</span>
      <span data-testid="last-saved">{lastSavedAt ?? "null"}</span>
      <button type="button" onClick={restore}>
        restore
      </button>
      <button type="button" onClick={discard}>
        discard
      </button>
    </div>
  );
};

const Harness: React.FC<{
  record?: Record<string, unknown>;
  opts?: UseFormAutosaveOptions;
}> = ({ record, opts }) => {
  const methods = useForm({
    defaultValues: { title: (record?.title as string) ?? "" },
  });
  return (
    <ResourceContextProvider value="stories">
      <RecordContextProvider value={record}>
        <FormProvider {...methods}>
          <Inner methods={methods} opts={opts} />
        </FormProvider>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
};

const readKey = (key: string): { savedAt: number; values: any } | null => {
  const raw = window.localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
};

describe("useFormAutosave", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists the form to localStorage after the user edits it", async () => {
    const user = userEvent.setup();
    render(<Harness opts={{ debounceMs: 10 }} />);

    await user.type(screen.getByLabelText("title"), "Draft title");

    await waitFor(() => {
      expect(readKey(KEY_NEW)?.values.title).toBe("Draft title");
    });
    expect(screen.getByTestId("last-saved").textContent).not.toBe("null");
  });

  it("does not write anything while the form stays pristine", async () => {
    render(<Harness opts={{ debounceMs: 10 }} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(window.localStorage.getItem(KEY_NEW)).toBeNull();
  });

  it("offers a recovery draft newer than the persisted record", async () => {
    window.localStorage.setItem(
      KEY_ABC,
      JSON.stringify({ savedAt: Date.now(), values: { title: "cached" } }),
    );
    const user = userEvent.setup();

    render(
      <Harness
        record={{
          id: "abc",
          title: "on server",
          updatedAt: new Date(Date.now() - 60_000).toISOString(),
        }}
      />,
    );

    expect(screen.getByTestId("draft").textContent).toBe("found");

    await user.click(screen.getByText("restore"));

    expect((screen.getByLabelText("title") as HTMLInputElement).value).toBe(
      "cached",
    );
    expect(screen.getByTestId("draft").textContent).toBe("none");
  });

  it("drops a stale draft older than the persisted record", () => {
    window.localStorage.setItem(
      KEY_ABC,
      JSON.stringify({
        savedAt: Date.now() - 120_000,
        values: { title: "old" },
      }),
    );

    render(
      <Harness
        record={{
          id: "abc",
          title: "on server",
          updatedAt: new Date().toISOString(),
        }}
      />,
    );

    expect(screen.getByTestId("draft").textContent).toBe("none");
    expect(window.localStorage.getItem(KEY_ABC)).toBeNull();
  });

  it("clears the cached draft on discard", async () => {
    window.localStorage.setItem(
      KEY_ABC,
      JSON.stringify({ savedAt: Date.now(), values: { title: "cached" } }),
    );
    const user = userEvent.setup();

    render(
      <Harness
        record={{
          id: "abc",
          updatedAt: new Date(Date.now() - 60_000).toISOString(),
        }}
      />,
    );

    await user.click(screen.getByText("discard"));

    expect(window.localStorage.getItem(KEY_ABC)).toBeNull();
    expect(screen.getByTestId("draft").textContent).toBe("none");
  });

  it("omits excluded paths from the cached snapshot", async () => {
    const user = userEvent.setup();
    render(<Harness opts={{ debounceMs: 10, excludePaths: ["title"] }} />);

    await user.type(screen.getByLabelText("title"), "secret");

    await waitFor(() => {
      expect(readKey(KEY_NEW)).not.toBeNull();
    });
    expect(readKey(KEY_NEW)?.values.title).toBeUndefined();
  });
});
