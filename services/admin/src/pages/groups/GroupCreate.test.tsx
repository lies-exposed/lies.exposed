import { type Group } from "@liexp/io/lib/http/Group.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { fc } from "@liexp/test/lib/index.js";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect } from "vitest";
import { adminTest } from "../../../test/adminTest.js";
import { GroupCreate } from "../AdminGroups.js";

describe("GroupCreate", () => {
  let group: Group;
  beforeEach(() => {
    [group] = fc.sample(GroupArb, 1);
  });

  describe("Container structure", () => {
    adminTest("should render the Create container", async ({ render }) => {
      // mocks.store.setItem("", {});
      await render(<GroupCreate />, { resource: "groups", record: group });
      await waitFor(() => {
        expect(screen.getByTestId("create-container")).toBeInTheDocument();
      });
    });

    adminTest("should render the _from SelectInput", async ({ render }) => {
      await render(<GroupCreate />, { resource: "groups", record: group });
      await waitFor(() => {
        expect(
          screen
            .getByTestId("create-container")
            .querySelector('input[name="_from"]'),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Plain mode (_from = 'plain')", () => {
    adminTest("should render the color input", async ({ render }) => {
      await render(<GroupCreate />, { resource: "groups", record: group });
      await waitFor(() => {
        expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
      });
    });

    adminTest("should render the startDate input", async ({ render }) => {
      await render(<GroupCreate />, { resource: "groups", record: group });
      await waitFor(() => {
        // startDate appears in both the top-level form and the members iterator
        expect(
          screen
            .getByTestId("create-container")
            .querySelector('input[name="startDate"]'),
        ).toBeInTheDocument();
      });
    });

    adminTest(
      "should render the TextWithSlugInput for name",
      async ({ render }) => {
        await render(<GroupCreate />, { resource: "groups", record: group });
        await waitFor(() => {
          expect(
            screen
              .getByTestId("create-container")
              .querySelector('input[name="username"]'),
          ).toBeInTheDocument();
        });
      },
    );

    adminTest("should render the kind SelectInput", async ({ render }) => {
      await render(<GroupCreate />, { resource: "groups", record: group });
      await waitFor(() => {
        expect(screen.getByTestId("group-kind-input")).toBeInTheDocument();
      });
    });

    adminTest("should render the members ArrayInput", async ({ render }) => {
      await render(<GroupCreate />, { resource: "groups", record: group });
      await waitFor(() => {
        expect(
          screen.getByTestId("group-member-array-input"),
        ).toBeInTheDocument();
      });
    });

    adminTest("should render the avatar upload input", async ({ render }) => {
      await render(<GroupCreate />, { resource: "groups", record: group });
      await waitFor(() => {
        expect(
          screen.getByTestId("reference-media-input-with-upload"),
        ).toBeInTheDocument();
        expect(screen.getByText("Upload avatar")).toBeInTheDocument();
      });
    });

    adminTest(
      "should render the excerpt BlockNote input",
      async ({ render }) => {
        await render(<GroupCreate />, { resource: "groups", record: group });

        await waitFor(() => {
          expect(screen.getByTestId("blocknote-excerpt")).toBeInTheDocument();
        });
      },
    );

    adminTest("should render the body BlockNote input", async ({ render }) => {
      await render(<GroupCreate />, {
        resource: "groups",
        record: group,
      });

      await waitFor(() => {
        // body appears in both the top-level form and inside the members iterator
        expect(screen.getAllByTestId("blocknote-body").length).toBeGreaterThan(
          0,
        );
      });
    });

    adminTest(
      "should NOT render the search TextInput in plain mode",
      async ({ render }) => {
        await render(<GroupCreate />, {
          resource: "groups",
          record: group,
        });
        await waitFor(() => {
          expect(
            screen
              .getByTestId("create-container")
              .querySelector('input[name="search"]'),
          ).not.toBeInTheDocument();
        });
      },
    );
  });

  describe("Wikipedia mode (_from = 'wikipedia')", () => {
    adminTest("should render the search TextInput", async ({ render }) => {
      await render(<GroupCreate />, {
        resource: "groups",
        record: group,
      });

      await waitFor(() => {
        const el = screen
          .getByLabelText("From")
          .parentElement!.querySelector('input[name="_from"]')!;

        fireEvent.change(el, { target: { value: "wikipedia" } });

        expect(
          screen
            .getByTestId("create-container")
            .querySelector('input[name="search"]'),
        ).toBeInTheDocument();
      });
    });

    adminTest(
      "should NOT render the color input in wikipedia mode",
      async ({ render }) => {
        await render(<GroupCreate />);
        expect(
          screen.queryByTestId("color-input-color"),
        ).not.toBeInTheDocument();
      },
    );

    adminTest(
      "should NOT render the TextWithSlugInput in wikipedia mode",
      async ({ render }) => {
        await render(<GroupCreate />);
        expect(
          screen.queryByTestId("text-slug-input-name"),
        ).not.toBeInTheDocument();
      },
    );

    adminTest(
      "should NOT render the members ArrayInput in wikipedia mode",
      async ({ render }) => {
        await render(<GroupCreate />);
        expect(
          screen.queryByTestId("array-input-members"),
        ).not.toBeInTheDocument();
      },
    );
  });
});
