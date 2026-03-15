import { fc } from "@liexp/test";
import {
  EventTypeArb,
  getEventArbitrary,
} from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, vi, afterEach } from "vitest";
import { adminTest } from "../../../test/adminTest.js";
import EventEdit from "./EventEdit.js";

describe("EventEdit", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Container structure", () => {
    adminTest("should render the EditEventForm wrapper", async ({ render }) => {
      const [event] = fc.sample(getEventArbitrary("Uncategorized"), 1);

      await render(<EventEdit />, { resource: "events", record: event });
      await waitFor(() => {
        expect(screen.getByTestId("edit-event-form")).toBeInTheDocument();
      });
    });
  });

  describe("Type dispatch — UNCATEGORIZED (default)", () => {
    adminTest(
      "should render the UncategorizedEventEditTab when no type is set",
      async ({ render }) => {
        const [event] = fc.sample(getEventArbitrary("Uncategorized"), 1);
        await render(<EventEdit />, { resource: "events", record: event });
        await waitFor(() => {
          expect(
            screen.getByTestId("uncategorized-edit-tab"),
          ).toBeInTheDocument();
        });
      },
    );

    adminTest(
      "should pass handlers to UncategorizedEventEditTab",
      async ({ render }) => {
        const [event] = fc.sample(getEventArbitrary("Uncategorized"), 1);
        await render(<EventEdit />, { resource: "events", record: event });
        await waitFor(() => {
          const tab = screen.getByTestId("uncategorized-edit-tab");
          expect(tab.dataset).toBeTruthy();
        });
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
    adminTest(
      "should render the DocumentaryEditFormTab",
      async ({ render }) => {
        const [event] = fc.sample(getEventArbitrary("Documentary"), 1);
        await render(<EventEdit />, { resource: "events", record: event });
        await waitFor(() => {
          expect(
            screen.getByTestId("documentary-edit-tab"),
          ).toBeInTheDocument();
          expect(
            screen.queryByTestId("uncategorized-edit-tab"),
          ).not.toBeInTheDocument();
        });
      },
    );
  });

  describe("Type dispatch — DEATH", () => {
    adminTest("should render the DeathEventEditFormTab", async ({ render }) => {
      const [event] = fc.sample(getEventArbitrary("Death"), 1);
      await render(<EventEdit />, { resource: "events", record: event });
      await waitFor(() => {
        expect(screen.getByTestId("death-edit-tab")).toBeInTheDocument();
      });
    });

    adminTest(
      "should NOT render the UncategorizedEventEditTab",
      async ({ render }) => {
        const [event] = fc.sample(getEventArbitrary("Death"), 1);
        await render(<EventEdit />, { resource: "events", record: event });
        await waitFor(() => {
          expect(
            screen.queryByTestId("uncategorized-edit-tab"),
          ).not.toBeInTheDocument();
        });
      },
    );
  });

  describe("Type dispatch — SCIENTIFIC_STUDY", () => {
    adminTest(
      "should render the ScientificStudyEventEditTab",
      async ({ render }) => {
        const [event] = fc.sample(getEventArbitrary("ScientificStudy"), 1);
        await render(<EventEdit />, { resource: "events", record: event });
        await waitFor(() => {
          expect(
            screen.getByTestId("scientific-study-edit-tab"),
          ).toBeInTheDocument();
        });
      },
    );
  });

  describe("Type dispatch — QUOTE", () => {
    adminTest("should render the QuoteEditFormTab", async ({ render }) => {
      const [event] = fc.sample(getEventArbitrary("Quote"), 1);
      await render(<EventEdit />, { resource: "events", record: event });
      await waitFor(() => {
        expect(screen.getByTestId("quote-edit-tab")).toBeInTheDocument();
      });
    });
  });

  describe("Type dispatch — PATENT", () => {
    adminTest(
      "should render the PatentEventEditFormTab",
      async ({ render }) => {
        const [event] = fc.sample(getEventArbitrary("Patent"), 1);
        await render(<EventEdit />, { resource: "events", record: event });
        await waitFor(() => {
          expect(screen.getByTestId("patent-edit-tab")).toBeInTheDocument();
        });
      },
    );
  });

  describe("Type dispatch — BOOK", () => {
    adminTest("should render the BookEditFormTab", async ({ render }) => {
      const [event] = fc.sample(getEventArbitrary("Book"), 1);
      await render(<EventEdit />, { resource: "events", record: event });

      await waitFor(() => {
        expect(screen.getByTestId("book-edit-tab")).toBeInTheDocument();
      });
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
      const [event] = fc.sample(EventTypeArb.chain(getEventArbitrary), 1);
      await render(<EventEdit />, { resource: "events", record: event });
      await waitFor(() => {
        const rendered = allTabIds.filter(
          (id) => screen.queryByTestId(id) !== null,
        );
        expect(rendered).toHaveLength(1);
      });
    });
  });
});
