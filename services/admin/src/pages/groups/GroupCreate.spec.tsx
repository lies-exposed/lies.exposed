import { screen } from "@testing-library/react";
import { beforeEach, describe, expect } from "vitest";
import { adminTest } from "../../../test/adminTest.js";
import { GroupCreate } from "../AdminGroups.js";
import "react";

describe("GroupCreate", () => {
  describe("Container structure", () => {
    adminTest.only("should render the Create container", async ({ render }) => {
      await render(<GroupCreate />);
      expect(screen.getByTestId("create-container")).toBeInTheDocument();
    });

    adminTest(
      "should render the title 'Create a Group'",
      async ({ render }) => {
        await render(<GroupCreate />);
        expect(screen.getByTestId("create-title")).toBeInTheDocument();
        expect(screen.getByText("Create a Group")).toBeInTheDocument();
      },
    );

    adminTest("should render the SimpleForm", async ({ render }) => {
      await render(<GroupCreate />);
      expect(screen.getByTestId("simple-form")).toBeInTheDocument();
    });

    adminTest("should render the _from SelectInput", async ({ render }) => {
      await render(<GroupCreate />);
      expect(screen.getByTestId("select-_from")).toBeInTheDocument();
    });
  });

  describe("Plain mode (_from = 'plain')", () => {
    adminTest("should render the color input", async ({ render }) => {
      await render(<GroupCreate />);
      expect(screen.getByTestId("color-input-color")).toBeInTheDocument();
    });

    adminTest("should render the startDate input", async ({ render }) => {
      await render(<GroupCreate />);
      // startDate appears in both the top-level form and the members iterator
      expect(screen.getAllByTestId("input-startDate").length).toBeGreaterThan(
        0,
      );
    });

    adminTest(
      "should render the TextWithSlugInput for name",
      async ({ render }) => {
        await render(<GroupCreate />);
        expect(screen.getByTestId("text-slug-input-name")).toBeInTheDocument();
      },
    );

    adminTest("should render the kind SelectInput", async ({ render }) => {
      await render(<GroupCreate />);
      expect(screen.getByTestId("select-kind")).toBeInTheDocument();
    });

    adminTest("should render the members ArrayInput", async ({ render }) => {
      await render(<GroupCreate />);
      expect(screen.getByTestId("array-input-members")).toBeInTheDocument();
    });

    adminTest("should render the avatar upload input", async ({ render }) => {
      await render(<GroupCreate />);
      expect(
        screen.getByTestId("reference-media-input-with-upload"),
      ).toBeInTheDocument();
      expect(screen.getByText("Upload avatar")).toBeInTheDocument();
    });

    adminTest(
      "should render the excerpt BlockNote input",
      async ({ render }) => {
        await render(<GroupCreate />);
        expect(screen.getByTestId("blocknote-excerpt")).toBeInTheDocument();
      },
    );

    adminTest("should render the body BlockNote input", async ({ render }) => {
      await render(<GroupCreate />);
      // body appears in both the top-level form and inside the members iterator
      expect(screen.getAllByTestId("blocknote-body").length).toBeGreaterThan(0);
    });

    adminTest(
      "should NOT render the search TextInput in plain mode",
      async ({ render }) => {
        await render(<GroupCreate />);
        expect(screen.queryByTestId("input-search")).not.toBeInTheDocument();
      },
    );
  });

  describe("Wikipedia mode (_from = 'wikipedia')", () => {
    beforeEach(() => {});

    adminTest("should render the search TextInput", async ({ render }) => {
      await render(<GroupCreate />);
      expect(screen.getByTestId("input-search")).toBeInTheDocument();
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
