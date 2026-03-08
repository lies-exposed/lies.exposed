import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GroupCreate } from "../AdminGroups.js";

// ---------------------------------------------------------------------------
// Mock useDataProvider
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/hooks/useDataProvider.js", () => ({
  useDataProvider: vi.fn(() => ({})),
}));

// ---------------------------------------------------------------------------
// Mock react-admin primitives — FormDataConsumer is key here
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/components/admin/react-admin.js", async () => {
  const actual = await vi.importActual<
    typeof import("@liexp/ui/lib/components/admin/react-admin.js")
  >("@liexp/ui/lib/components/admin/react-admin.js");

  return {
    ...actual,
    // FormDataConsumer: controlled by __formData__ in the mock
    FormDataConsumer: vi.fn(
      ({
        children,
      }: {
        children: (args: { formData: Record<string, unknown> }) => React.ReactNode;
      }) => <>{children({ formData: { _from: "plain" } })}</>,
    ),
    Create: ({
      title,
      children,
    }: React.PropsWithChildren<{ title?: string }>) => (
      <div data-testid="create-container">
        {title && <span data-testid="create-title">{title}</span>}
        {children}
      </div>
    ),
    SimpleForm: ({ children }: React.PropsWithChildren) => (
      <form data-testid="simple-form">{children}</form>
    ),
    SelectInput: ({ source }: { source: string }) => (
      <select data-testid={`select-${source}`} aria-label={source} />
    ),
    TextInput: ({ source }: { source: string }) => (
      <input data-testid={`input-${source}`} aria-label={source} />
    ),
    DateInput: ({ source }: { source: string }) => (
      <input
        type="date"
        data-testid={`input-${source}`}
        aria-label={source}
      />
    ),
    ArrayInput: ({
      source,
      children,
    }: React.PropsWithChildren<{ source: string }>) => (
      <div data-testid={`array-input-${source}`}>{children}</div>
    ),
    SimpleFormIterator: ({ children }: React.PropsWithChildren) => (
      <div data-testid="simple-form-iterator">{children}</div>
    ),
  };
});

// ---------------------------------------------------------------------------
// Mock heavy sub-components
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/components/admin/BlockNoteInput.js", () => ({
  default: ({ source }: { source: string }) => (
    <div data-testid={`blocknote-${source}`} />
  ),
}));

vi.mock(
  "@liexp/ui/lib/components/admin/actors/ReferenceActorInput.js",
  () => ({
    default: () => <div data-testid="reference-actor-input" />,
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js",
  () => ({
    ColorInput: ({ source }: { source: string }) => (
      <input data-testid={`color-input-${source}`} aria-label={source} />
    ),
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js",
  () => ({
    TextWithSlugInput: ({ source }: { source: string }) => (
      <div data-testid={`text-slug-input-${source}`} />
    ),
  }),
);

vi.mock(
  "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInputWithUpload.js",
  () => ({
    ReferenceMediaInputWithUpload: ({
      uploadLabel,
    }: {
      uploadLabel?: string;
    }) => (
      <div data-testid="reference-media-input-with-upload">
        {uploadLabel && <span>{uploadLabel}</span>}
      </div>
    ),
  }),
);

// ---------------------------------------------------------------------------
// Import mocked module for per-test overrides
// ---------------------------------------------------------------------------
import * as ReactAdminMock from "@liexp/ui/lib/components/admin/react-admin.js";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GroupCreate", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: _from = "plain" → full form
    vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
      ({ children }: { children: (args: { formData: Record<string, unknown> }) => React.ReactNode }) =>
        <>{children({ formData: { _from: "plain" } })}</>,
    );
  });

  describe("Container structure", () => {
    it("should render the Create container", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("create-container")).toBeInTheDocument();
    });

    it("should render the title 'Create a Group'", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("create-title")).toBeInTheDocument();
      expect(screen.getByText("Create a Group")).toBeInTheDocument();
    });

    it("should render the SimpleForm", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("simple-form")).toBeInTheDocument();
    });

    it("should render the _from SelectInput", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("select-_from")).toBeInTheDocument();
    });
  });

  describe("Plain mode (_from = 'plain')", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({ children }: { children: (args: { formData: Record<string, unknown> }) => React.ReactNode }) =>
          <>{children({ formData: { _from: "plain" } })}</>,
      );
    });

    it("should render the color input", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("color-input-color")).toBeInTheDocument();
    });

    it("should render the startDate input", () => {
      render(<GroupCreate />);
      // startDate appears in both the top-level form and the members iterator
      expect(
        screen.getAllByTestId("input-startDate").length,
      ).toBeGreaterThan(0);
    });

    it("should render the TextWithSlugInput for name", () => {
      render(<GroupCreate />);
      expect(
        screen.getByTestId("text-slug-input-name"),
      ).toBeInTheDocument();
    });

    it("should render the kind SelectInput", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("select-kind")).toBeInTheDocument();
    });

    it("should render the members ArrayInput", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("array-input-members")).toBeInTheDocument();
    });

    it("should render the avatar upload input", () => {
      render(<GroupCreate />);
      expect(
        screen.getByTestId("reference-media-input-with-upload"),
      ).toBeInTheDocument();
      expect(screen.getByText("Upload avatar")).toBeInTheDocument();
    });

    it("should render the excerpt BlockNote input", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("blocknote-excerpt")).toBeInTheDocument();
    });

    it("should render the body BlockNote input", () => {
      render(<GroupCreate />);
      // body appears in both the top-level form and inside the members iterator
      expect(
        screen.getAllByTestId("blocknote-body").length,
      ).toBeGreaterThan(0);
    });

    it("should NOT render the search TextInput in plain mode", () => {
      render(<GroupCreate />);
      expect(
        screen.queryByTestId("input-search"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Wikipedia mode (_from = 'wikipedia')", () => {
    beforeEach(() => {
      vi.mocked(ReactAdminMock.FormDataConsumer).mockImplementation(
        ({ children }: { children: (args: { formData: Record<string, unknown> }) => React.ReactNode }) =>
          <>{children({ formData: { _from: "wikipedia" } })}</>,
      );
    });

    it("should render the search TextInput", () => {
      render(<GroupCreate />);
      expect(screen.getByTestId("input-search")).toBeInTheDocument();
    });

    it("should NOT render the color input in wikipedia mode", () => {
      render(<GroupCreate />);
      expect(
        screen.queryByTestId("color-input-color"),
      ).not.toBeInTheDocument();
    });

    it("should NOT render the TextWithSlugInput in wikipedia mode", () => {
      render(<GroupCreate />);
      expect(
        screen.queryByTestId("text-slug-input-name"),
      ).not.toBeInTheDocument();
    });

    it("should NOT render the members ArrayInput in wikipedia mode", () => {
      render(<GroupCreate />);
      expect(
        screen.queryByTestId("array-input-members"),
      ).not.toBeInTheDocument();
    });
  });
});
