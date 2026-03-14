import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import * as ReactAdminMock from "@liexp/ui/lib/components/admin/react-admin.js";
import { screen } from "@testing-library/react";
import { describe, expect, vi, beforeEach } from "vitest";
import { adminTest } from "../../../test/adminTest.js";
import EventEdit from "./EventEdit.js";

/** Helper: re-configure the FormDataConsumer mock to inject specific formData. */
const mockFormDataConsumer = (formData: Record<string, unknown>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation((props: any) =>
    props.children({ formData }),
  );
};

describe("EventEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no type → UNCATEGORIZED branch
    mockFormDataConsumer({});
  });

  describe("Container structure", () => {
    adminTest("should render the EditEventForm wrapper", async ({ render }) => {
      await render(<EventEdit />);
      expect(screen.getByTestId("edit-event-form")).toBeInTheDocument();
    });
  });

  describe("Type dispatch — UNCATEGORIZED (default)", () => {
    adminTest(
      "should render the UncategorizedEventEditTab when no type is set",
      async ({ render }) => {
        await render(<EventEdit />);
        expect(
          screen.getByTestId("uncategorized-edit-tab"),
        ).toBeInTheDocument();
      },
    );

    adminTest(
      "should pass suggestions to UncategorizedEventEditTab",
      async ({ render }) => {
        await render(<EventEdit />);
        const tab = screen.getByTestId("uncategorized-edit-tab");
        expect(tab.dataset.suggestions).toBe(JSON.stringify(["suggestion-1"]));
      },
    );

    adminTest(
      "should pass handlers to UncategorizedEventEditTab",
      async ({ render }) => {
        await render(<EventEdit />);
        const tab = screen.getByTestId("uncategorized-edit-tab");
        expect(tab.dataset.hasHandlers).toBe("true");
      },
    );

    adminTest("should NOT render any other type tab", async ({ render }) => {
      await render(<EventEdit />);
      expect(
        screen.queryByTestId("documentary-edit-tab"),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("death-edit-tab")).not.toBeInTheDocument();
    });
  });

  describe("Type dispatch — DOCUMENTARY", () => {
    beforeEach(() => {
      mockFormDataConsumer({ type: EVENT_TYPES.DOCUMENTARY });
    });

    adminTest(
      "should render the DocumentaryEditFormTab",
      async ({ render }) => {
        await render(<EventEdit />);
        expect(screen.getByTestId("documentary-edit-tab")).toBeInTheDocument();
      },
    );

    adminTest(
      "should NOT render the UncategorizedEventEditTab",
      async ({ render }) => {
        await render(<EventEdit />);
        expect(
          screen.queryByTestId("uncategorized-edit-tab"),
        ).not.toBeInTheDocument();
      },
    );
  });

  describe("Type dispatch — DEATH", () => {
    beforeEach(() => {
      mockFormDataConsumer({ type: EVENT_TYPES.DEATH });
    });

    adminTest("should render the DeathEventEditFormTab", async ({ render }) => {
      await render(<EventEdit />);
      expect(screen.getByTestId("death-edit-tab")).toBeInTheDocument();
    });

    adminTest(
      "should NOT render the UncategorizedEventEditTab",
      async ({ render }) => {
        await render(<EventEdit />);
        expect(
          screen.queryByTestId("uncategorized-edit-tab"),
        ).not.toBeInTheDocument();
      },
    );
  });

  describe("Type dispatch — SCIENTIFIC_STUDY", () => {
    beforeEach(() => {
      mockFormDataConsumer({ type: EVENT_TYPES.SCIENTIFIC_STUDY });
    });

    adminTest(
      "should render the ScientificStudyEventEditTab",
      async ({ render }) => {
        await render(<EventEdit />);
        expect(
          screen.getByTestId("scientific-study-edit-tab"),
        ).toBeInTheDocument();
      },
    );
  });

  describe("Type dispatch — QUOTE", () => {
    beforeEach(() => {
      mockFormDataConsumer({ type: EVENT_TYPES.QUOTE });
    });

    adminTest("should render the QuoteEditFormTab", async ({ render }) => {
      await render(<EventEdit />);
      expect(screen.getByTestId("quote-edit-tab")).toBeInTheDocument();
    });
  });

  describe("Type dispatch — PATENT", () => {
    beforeEach(() => {
      mockFormDataConsumer({ type: EVENT_TYPES.PATENT });
    });

    adminTest(
      "should render the PatentEventEditFormTab",
      async ({ render }) => {
        await render(<EventEdit />);
        expect(screen.getByTestId("patent-edit-tab")).toBeInTheDocument();
      },
    );
  });

  describe("Type dispatch — BOOK", () => {
    beforeEach(() => {
      mockFormDataConsumer({ type: EVENT_TYPES.BOOK });
    });

    adminTest("should render the BookEditFormTab", async ({ render }) => {
      await render(<EventEdit />);
      expect(screen.getByTestId("book-edit-tab")).toBeInTheDocument();
    });
  });

  describe("Mutual exclusivity — only one tab renders at a time", () => {
    const allTabIds = [
      "documentary-edit-tab",
      "death-edit-tab",
      "scientific-study-edit-tab",
      "quote-edit-tab",
      "patent-edit-tab",
      "book-edit-tab",
      "uncategorized-edit-tab",
    ] as const;

    adminTest("renders exactly one type tab", async ({ render }) => {
      await render(<EventEdit />);
      const rendered = allTabIds.filter(
        (id) => screen.queryByTestId(id) !== null,
      );
      expect(rendered).toHaveLength(1);
    });
  });
});
