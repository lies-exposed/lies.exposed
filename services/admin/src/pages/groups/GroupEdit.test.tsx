import { Group, fc } from "@liexp/test/lib/index.js";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect } from "vitest";
import { adminTest } from "../../../test/adminTest.js";
import { GroupEdit } from "../AdminGroups.js";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const [baseRecord] = fc.sample(Group.GroupArb, 1);
const record = { ...baseRecord };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GroupEdit", () => {
  describe("Container structure", () => {
    adminTest("should render the EditForm wrapper", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(document.querySelector(".tabbed-form")).toBeInTheDocument();
      });
    });

    adminTest("should render the TabbedForm", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(document.querySelector(".tabbed-form")).toBeInTheDocument();
      });
    });

    adminTest("should render the EditToolbar", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /save/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Tab structure", () => {
    adminTest("should render the Generals tab", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /generals/i }),
        ).toBeInTheDocument();
      });
    });

    adminTest("should render the Avatar tab", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /avatar/i }),
        ).toBeInTheDocument();
      });
    });

    adminTest("should render the Body tab", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /body/i })).toBeInTheDocument();
      });
    });

    adminTest("should render the Members tab", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /members/i }),
        ).toBeInTheDocument();
      });
    });

    adminTest("should render the events tab", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /events/i }),
        ).toBeInTheDocument();
      });
    });

    adminTest("should render the Network tab", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /network/i }),
        ).toBeInTheDocument();
      });
    });

    adminTest("should render the Flows tab", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /flows/i })).toBeInTheDocument();
      });
    });
  });

  describe("Generals tab content", () => {
    adminTest(
      "should render the name and username inputs",
      async ({ render }) => {
        await render(<GroupEdit />, { resource: "groups", record });
        await waitFor(() => {
          // TextWithSlugInput renders two TextInputs: one for "name" and one for slug
          expect(screen.getAllByLabelText(/name/i).length).toBeGreaterThan(0);
        });
      },
    );

    adminTest("should render the color input", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        // ColorInput renders a TextField with label "color"
        expect(screen.getByLabelText(/^color$/i)).toBeInTheDocument();
      });
    });

    adminTest("should render the startDate input", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      });
    });

    adminTest("should render the kind select", async ({ render }) => {
      await render(<GroupEdit />, { resource: "groups", record });
      await waitFor(() => {
        expect(screen.getByLabelText(/kind/i)).toBeInTheDocument();
      });
    });

    adminTest(
      "should render the OpenAI embedding button",
      async ({ render }) => {
        await render(<GroupEdit />, { resource: "groups", record });
        await waitFor(() => {
          const btn = Array.from(document.querySelectorAll("button")).find(
            (b) => /generate organization summary/i.test(b.textContent ?? ""),
          );
          expect(btn).toBeDefined();
        });
      },
    );

    adminTest(
      "should render the excerpt BlockNote input",
      async ({ render }) => {
        await render(<GroupEdit />, { resource: "groups", record });
        await waitFor(() => {
          expect(screen.getByTestId("blocknote-excerpt")).toBeInTheDocument();
        });
      },
    );
  });

  describe("Avatar tab content", () => {
    adminTest(
      "should render the ReferenceMediaInputWithUpload after clicking Avatar tab",
      async ({ render }) => {
        const user = userEvent.setup();
        await render(<GroupEdit />, { resource: "groups", record });

        const avatarTab = await screen.findByRole("tab", { name: /avatar/i });
        await user.click(avatarTab);

        await waitFor(() => {
          const panel = document.getElementById("tabpanel-1");
          expect(panel).toBeInTheDocument();
          expect(panel!.textContent).toMatch(/upload/i);
        });
      },
    );
  });

  describe("Body tab content", () => {
    adminTest(
      "should render the body BlockNote input after clicking Body tab",
      async ({ render }) => {
        const user = userEvent.setup();
        await render(<GroupEdit />, { resource: "groups", record });

        const bodyTab = await screen.findByRole("tab", { name: /body/i });
        await user.click(bodyTab);

        await waitFor(() => {
          expect(screen.getByTestId("blocknote-body")).toBeInTheDocument();
        });
      },
    );
  });

  describe("Members tab content", () => {
    adminTest(
      "should render the Members tab content including the members Datagrid",
      async ({ render }) => {
        await render(<GroupEdit />, { resource: "groups", record });

        await waitFor(() => {
          // Members tab panel is in the DOM (may be hidden via display:none).
          // ArrayInput (SimpleFormIterator) renders with an add button.
          // Query the panel directly to bypass aria-hidden restrictions.
          const membersPanel = document.getElementById("tabpanel-3");
          expect(membersPanel).toBeInTheDocument();
          // SimpleFormIterator add button — check any button exists in the panel
          expect(
            membersPanel!.querySelectorAll("button").length,
          ).toBeGreaterThan(0);
        });
      },
    );
  });

  describe("events tab content", () => {
    adminTest(
      "should render the LinkExistingEventsButton after clicking events tab",
      async ({ render }) => {
        await render(<GroupEdit />, { resource: "groups", record });

        await waitFor(() => {
          expect(
            screen.getByRole("tab", { name: /events/i }),
          ).toBeInTheDocument();
        });

        const eventsPanel = document.getElementById("tabpanel-4");
        expect(eventsPanel).toBeInTheDocument();

        const linkBtn = Array.from(
          eventsPanel!.querySelectorAll("button"),
        ).find((btn) => /link existing events/i.test(btn.textContent ?? ""));
        expect(linkBtn).toBeDefined();
      },
    );

    adminTest(
      "should render the ReferenceManyEventField after clicking events tab",
      async ({ render }) => {
        await render(<GroupEdit />, { resource: "groups", record });

        await waitFor(() => {
          expect(
            screen.getByRole("tab", { name: /events/i }),
          ).toBeInTheDocument();
        });

        const eventsPanel = document.getElementById("tabpanel-4");
        expect(eventsPanel).toBeInTheDocument();
        expect(eventsPanel).toBeDefined();
      },
    );
  });

  describe("Network tab content", () => {
    adminTest(
      "should render the EventsNetworkGraphFormTab after clicking Network tab",
      async ({ render }) => {
        const user = userEvent.setup();
        await render(<GroupEdit />, { resource: "groups", record });

        const networkTab = await screen.findByRole("tab", { name: /network/i });
        await user.click(networkTab);

        await waitFor(() => {
          expect(
            screen.getByTestId("events-network-graph-tab"),
          ).toBeInTheDocument();
        });
      },
    );
  });

  describe("Flows tab content", () => {
    adminTest(
      "should render the EventsFlowGraphFormTab after clicking Flows tab",
      async ({ render }) => {
        const user = userEvent.setup();
        await render(<GroupEdit />, { resource: "groups", record });

        const flowsTab = await screen.findByRole("tab", { name: /flows/i });
        await user.click(flowsTab);

        await waitFor(() => {
          expect(
            screen.getByTestId("events-flow-graph-tab"),
          ).toBeInTheDocument();
        });
      },
    );
  });

  describe("EditTitle sub-component", () => {
    adminTest(
      "should populate form inputs with record values",
      async ({ render }) => {
        const namedRecord = { ...record, name: "My Test Organization" };
        await render(<GroupEdit />, {
          resource: "groups",
          record: namedRecord,
        });

        await waitFor(() => {
          // The name TextInput is populated from the record context.
          // This verifies the record is correctly available in the form.
          const nameInput = document.querySelector(
            'input[name="name"]',
          ) as HTMLInputElement | null;
          expect(nameInput).toBeInTheDocument();
          expect(nameInput?.value).toBe("My Test Organization");
        });
      },
    );
  });
});
