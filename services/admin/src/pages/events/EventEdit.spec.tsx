import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import * as ReactAdminMock from "@liexp/ui/lib/components/admin/react-admin.js";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import EventEdit from "./EventEdit.js";

// ---------------------------------------------------------------------------
// Mock react-admin's FormDataConsumer (controlled per test)
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/components/admin/react-admin.js", async () => {
  const actual = await vi.importActual<typeof ReactAdminMock>(
    "@liexp/ui/lib/components/admin/react-admin.js",
  );

  return {
    ...actual,
    FormDataConsumer: vi.fn(
      ({
        children,
      }: {
        children: (args: {
          formData: Record<string, unknown>;
          scopedFormData?: unknown;
        }) => React.ReactNode;
      }) => <>{children({ formData: {} })}</>,
    ),
  };
});

// ---------------------------------------------------------------------------
// Mock EditEventForm — exposes a render-prop children call
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/components/admin/events/EditEventForm.js", () => ({
  EditEventForm: ({
    children,
  }: {
    children: (
      suggestions: unknown[],
      handlers: Record<string, unknown>,
    ) => React.ReactNode;
  }) => (
    <div data-testid="edit-event-form">
      {children(["suggestion-1"], { onSuggest: vi.fn() })}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock per-type tab stubs
// ---------------------------------------------------------------------------
vi.mock(
  "@liexp/ui/lib/components/admin/events/tabs/BookEditFormTab.js",
  () => ({
    BookEditFormTab: () => <div data-testid="book-edit-tab" />,
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/events/tabs/DeathEventEditFormTab.js",
  () => ({
    DeathEventEditFormTab: () => <div data-testid="death-edit-tab" />,
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/events/tabs/DocumentaryEditFormTab.js",
  () => ({
    DocumentaryEditFormTab: () => <div data-testid="documentary-edit-tab" />,
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/events/tabs/PatentEventEditTab.js",
  () => ({
    PatentEventEditFormTab: () => <div data-testid="patent-edit-tab" />,
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/events/tabs/QuoteEditFormTab.js",
  () => ({
    QuoteEditFormTab: () => <div data-testid="quote-edit-tab" />,
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/events/tabs/ScientificStudyEventEditTab.js",
  () => ({
    ScientificStudyEventEditTab: () => (
      <div data-testid="scientific-study-edit-tab" />
    ),
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/events/tabs/UncategorizedEventEditTab.js",
  () => ({
    UncategorizedEventEditTab: ({
      suggestions,
      handlers,
    }: {
      suggestions: unknown[];
      handlers: Record<string, unknown>;
    }) => (
      <div
        data-testid="uncategorized-edit-tab"
        data-suggestions={JSON.stringify(suggestions)}
        data-has-handlers={String(!!handlers)}
      />
    ),
  }),
);

vi.mock("@liexp/ui/lib/components/admin/events/titles/EventTitle.js", () => ({
  EventTitle: () => <span data-testid="event-title" />,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EventEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no type → UNCATEGORIZED branch
    vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
      ({
        children,
      }: {
        children: (args: {
          formData: Record<string, unknown>;
          scopedFormData?: unknown;
        }) => React.ReactNode;
      }) => <>{children({ formData: {} })}</>,
    );
  });

  describe("Container structure", () => {
    it("should render the EditEventForm wrapper", () => {
      render(<EventEdit />);
      expect(screen.getByTestId("edit-event-form")).toBeInTheDocument();
    });
  });

  describe("Type dispatch — UNCATEGORIZED (default)", () => {
    it("should render the UncategorizedEventEditTab when no type is set", () => {
      render(<EventEdit />);
      expect(screen.getByTestId("uncategorized-edit-tab")).toBeInTheDocument();
    });

    it("should pass suggestions to UncategorizedEventEditTab", () => {
      render(<EventEdit />);
      const tab = screen.getByTestId("uncategorized-edit-tab");
      expect(tab.dataset.suggestions).toBe(JSON.stringify(["suggestion-1"]));
    });

    it("should pass handlers to UncategorizedEventEditTab", () => {
      render(<EventEdit />);
      const tab = screen.getByTestId("uncategorized-edit-tab");
      expect(tab.dataset.hasHandlers).toBe("true");
    });

    it("should NOT render any other type tab", () => {
      render(<EventEdit />);
      expect(
        screen.queryByTestId("documentary-edit-tab"),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("death-edit-tab")).not.toBeInTheDocument();
    });
  });

  describe("Type dispatch — DOCUMENTARY", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({
          children,
        }: {
          children: (args: {
            formData: Record<string, unknown>;
            scopedFormData?: unknown;
          }) => React.ReactNode;
        }) => <>{children({ formData: { type: EVENT_TYPES.DOCUMENTARY } })}</>,
      );
    });

    it("should render the DocumentaryEditFormTab", () => {
      render(<EventEdit />);
      expect(screen.getByTestId("documentary-edit-tab")).toBeInTheDocument();
    });

    it("should NOT render the UncategorizedEventEditTab", () => {
      render(<EventEdit />);
      expect(
        screen.queryByTestId("uncategorized-edit-tab"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Type dispatch — DEATH", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({
          children,
        }: {
          children: (args: {
            formData: Record<string, unknown>;
            scopedFormData?: unknown;
          }) => React.ReactNode;
        }) => <>{children({ formData: { type: EVENT_TYPES.DEATH } })}</>,
      );
    });

    it("should render the DeathEventEditFormTab", () => {
      render(<EventEdit />);
      expect(screen.getByTestId("death-edit-tab")).toBeInTheDocument();
    });

    it("should NOT render the UncategorizedEventEditTab", () => {
      render(<EventEdit />);
      expect(
        screen.queryByTestId("uncategorized-edit-tab"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Type dispatch — SCIENTIFIC_STUDY", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({
          children,
        }: {
          children: (args: {
            formData: Record<string, unknown>;
            scopedFormData?: unknown;
          }) => React.ReactNode;
        }) => (
          <>{children({ formData: { type: EVENT_TYPES.SCIENTIFIC_STUDY } })}</>
        ),
      );
    });

    it("should render the ScientificStudyEventEditTab", () => {
      render(<EventEdit />);
      expect(
        screen.getByTestId("scientific-study-edit-tab"),
      ).toBeInTheDocument();
    });
  });

  describe("Type dispatch — QUOTE", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({
          children,
        }: {
          children: (args: {
            formData: Record<string, unknown>;
            scopedFormData?: unknown;
          }) => React.ReactNode;
        }) => <>{children({ formData: { type: EVENT_TYPES.QUOTE } })}</>,
      );
    });

    it("should render the QuoteEditFormTab", () => {
      render(<EventEdit />);
      expect(screen.getByTestId("quote-edit-tab")).toBeInTheDocument();
    });
  });

  describe("Type dispatch — PATENT", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({
          children,
        }: {
          children: (args: {
            formData: Record<string, unknown>;
            scopedFormData?: unknown;
          }) => React.ReactNode;
        }) => <>{children({ formData: { type: EVENT_TYPES.PATENT } })}</>,
      );
    });

    it("should render the PatentEventEditFormTab", () => {
      render(<EventEdit />);
      expect(screen.getByTestId("patent-edit-tab")).toBeInTheDocument();
    });
  });

  describe("Type dispatch — BOOK", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({
          children,
        }: {
          children: (args: {
            formData: Record<string, unknown>;
            scopedFormData?: unknown;
          }) => React.ReactNode;
        }) => <>{children({ formData: { type: EVENT_TYPES.BOOK } })}</>,
      );
    });

    it("should render the BookEditFormTab", () => {
      render(<EventEdit />);
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

    it("renders exactly one type tab", () => {
      render(<EventEdit />);
      const rendered = allTabIds.filter(
        (id) => screen.queryByTestId(id) !== null,
      );
      expect(rendered).toHaveLength(1);
    });
  });
});
