import { Link, fc } from "@liexp/test/lib/index.js";
import { LinkEdit } from "@liexp/ui/lib/components/admin/links/LinkEdit.js";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, vi, expect } from "vitest";
import { adminTest } from "../../../test/adminTest.js";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const [baseRecord] = fc.sample(Link.LinkArb, 1);
// TEST_CREATOR_ID matches the identity returned by makeAuthProvider
const TEST_CREATOR_ID = "user-test-id";
// Force status to DRAFT so ApproveLinkButton always renders (status === "APPROVED"
// causes it to be hidden, and LinkArb may generate any status value).
const record = { ...baseRecord, creator: TEST_CREATOR_ID, status: "DRAFT" };
// otherRecord has a different creator — so SetMeAsAuthor button is enabled
const otherRecord = {
  ...baseRecord,
  creator: "other-user-id",
  status: "DRAFT",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LinkEdit", () => {
  describe("Loading state", () => {
    adminTest(
      "renders LoadingPage while permissions are loading",
      async ({ render, mocks }) => {
        // Use fake timers so Loading's 1-second delay fires immediately
        vi.useFakeTimers();

        // Make getPermissions never resolve so isLoadingPermissions stays true
        mocks.authProvider.getPermissions.mockReturnValue(
          new Promise(() => {}),
        );

        await render(<LinkEdit />);

        // Advance timers past the 1-second Loading threshold
        await vi.advanceTimersByTimeAsync(1100);

        expect(screen.getByRole("progressbar")).toBeInTheDocument();
        vi.useRealTimers();
      },
    );

    adminTest(
      "does not render LoadingPage once permissions resolve",
      async ({ render }) => {
        await render(<LinkEdit />);

        await waitFor(() => {
          expect(document.querySelector(".tabbed-form")).toBeInTheDocument();
        });
        expect(document.querySelector('[role="progressbar"]')).toBeNull();
      },
    );
  });

  describe("Tab structure", () => {
    adminTest(
      "renders General, Events, Event Suggestions and Social Posts tabs",
      async ({ render }) => {
        await render(<LinkEdit />);

        await waitFor(() => {
          expect(screen.getByText("General")).toBeInTheDocument();
          expect(screen.getByText("Events")).toBeInTheDocument();
          expect(screen.getByText("Event Suggestions")).toBeInTheDocument();
          expect(screen.getByText("Social Posts")).toBeInTheDocument();
        });
      },
    );
  });

  describe("General tab — core fields", () => {
    adminTest(
      "renders title, status, URL, publishDate and description inputs",
      async ({ render }) => {
        await render(<LinkEdit />);

        await waitFor(() => {
          // TextInput for title — may have multiple (event form adds payload.title)
          expect(screen.getAllByLabelText(/title/i).length).toBeGreaterThan(0);
          // SelectInput for status
          expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
          // URLMetadataInput renders a real TextInput labelled "Url"
          expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
          // DateInput for publishDate — use name attribute to disambiguate from
          // the OpenAI button whose aria-label also contains "publish date"
          expect(
            document.querySelector('input[name="publishDate"]'),
          ).toBeInTheDocument();
          // TextInput for description — use name attribute to disambiguate from
          // the OpenAI button whose aria-label also mentions "description"
          expect(
            document.querySelector('textarea[name="description"]'),
          ).toBeInTheDocument();
        });
      },
    );

    adminTest("renders the Approve button", async ({ render }) => {
      await render(<LinkEdit />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /approve/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Admin-only fields", () => {
    adminTest(
      "does NOT render creator input or SetMeAsAuthor for non-admin users",
      async ({ render }) => {
        await render(<LinkEdit />, { permissions: [] });

        await waitFor(() => {
          expect(screen.getByText("General")).toBeInTheDocument();
        });

        expect(
          screen.queryByRole("button", { name: "Set me as author" }),
        ).not.toBeInTheDocument();
      },
    );

    adminTest(
      "renders SetMeAsAuthor button for admin users",
      async ({ render }) => {
        // Use otherRecord so the button is enabled (creator ≠ identity)
        await render(<LinkEdit />, {
          record: otherRecord,
          permissions: ["admin:read"],
        });

        await waitFor(() => {
          expect(
            screen.getByRole("button", { name: "Set me as author" }),
          ).toBeInTheDocument();
        });
      },
    );

    adminTest(
      "renders DangerZoneField red-border container for admin users",
      async ({ render }) => {
        await render(<LinkEdit />, {
          record,
          permissions: ["admin:read"],
        });

        await waitFor(() => {
          // DangerZoneField renders a Box with border: 1px solid red
          const dangerBox = document.querySelector(
            '[style*="border: 1px solid red"]',
          );
          expect(dangerBox).toBeInTheDocument();
        });
      },
    );
  });

  describe("SetMeAsAuthor button behaviour", () => {
    adminTest(
      "button is enabled when current user is NOT the creator",
      async ({ render }) => {
        // otherRecord.creator = "other-user-id" ≠ TEST_CREATOR_ID
        await render(<LinkEdit />, {
          record: otherRecord,
          permissions: ["admin:read"],
        });

        await waitFor(() => {
          const btn = screen.getByRole("button", { name: "Set me as author" });
          expect(btn).not.toBeDisabled();
        });
      },
    );

    adminTest(
      "button is disabled when current user IS already the creator",
      async ({ render }) => {
        // record.creator = TEST_CREATOR_ID = getIdentity().id
        await render(<LinkEdit />, {
          record,
          permissions: ["admin:read"],
        });

        await waitFor(() => {
          const btn = screen.getByRole("button", { name: "Set me as author" });
          expect(btn).toBeDisabled();
        });
      },
    );
  });

  describe("Events tab content", () => {
    adminTest(
      "renders CreateEventFromURLQueue and CreateEventFromLink buttons",
      async ({ render }) => {
        await render(<LinkEdit />);

        // Wait for the TabbedForm to render
        await waitFor(() => {
          expect(
            screen.getByRole("tab", { name: /events/i }),
          ).toBeInTheDocument();
        });

        // The Events tab panel (tabpanel-1) is in the DOM but hidden via
        // aria-hidden + display:none because syncWithLocation is true and
        // MemoryRouter stays at pathname="/".
        // Query button text content directly to bypass aria-hidden restrictions.
        const eventsPanel = document.getElementById("tabpanel-1");
        expect(eventsPanel).toBeInTheDocument();

        // CreateEventFromURLQueueButton renders a Button with text "Create Event from URL"
        const createFromURLBtn = Array.from(
          eventsPanel!.querySelectorAll("button"),
        ).find((btn) => /create event from url/i.test(btn.textContent ?? ""));
        expect(createFromURLBtn).toBeDefined();

        // CreateEventFromLinkButton renders a Button with text "Create Event"
        const createFromLinkBtn = Array.from(
          eventsPanel!.querySelectorAll("button"),
        ).find((btn) => /create event/i.test(btn.textContent ?? ""));
        expect(createFromLinkBtn).toBeDefined();
      },
    );
  });

  describe("Social Posts tab content", () => {
    adminTest(
      "renders the Social Posts tab and its content",
      async ({ render }) => {
        const user = userEvent.setup();
        await render(<LinkEdit />);

        const socialPostsTab = await screen.findByRole("tab", {
          name: /social posts/i,
        });
        await user.click(socialPostsTab);

        // ReferenceManyField + Datagrid renders with empty data from minimalDataProvider
        await waitFor(() => {
          expect(
            screen.getByRole("tab", { name: /social posts/i }),
          ).toBeInTheDocument();
        });
      },
    );
  });
});
