import {
  GlobalSearchModal,
  type GlobalSearchModalProps,
  type SearchResult,
} from "@liexp/ui/lib/components/Common/Search/GlobalSearchModal.js";
import GlobalSearchButton, {
  type GlobalSearchButtonProps,
} from "@liexp/ui/lib/components/Header/GlobalSearchButton.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import * as React from "react";

// ---------------------------------------------------------------------------
// GlobalSearchModal stories
// ---------------------------------------------------------------------------

const modalMeta: Meta<GlobalSearchModalProps> = {
  title: "Components/Common/GlobalSearch/GlobalSearchModal",
  component: GlobalSearchModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Two-step command-palette modal. First select a resource type from the autocomplete dropdown (keyboard navigable), then enter a search term for that resource type. Opened via the search button or Ctrl+K / Cmd+K.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "onClose" },
    onResultClick: { action: "onResultClick" },
  },
};

export default modalMeta;

type ModalStory = StoryObj<GlobalSearchModalProps>;

/**
 * Modal open and ready for input.
 */
export const Open: ModalStory = {
  args: {
    open: true,
  },
};

/**
 * Modal closed (renders nothing visible).
 */
export const Closed: ModalStory = {
  args: {
    open: false,
  },
};

/**
 * Interactive wrapper — first select a resource type from the autocomplete
 * dropdown (arrow keys + Enter), then type at least 3 characters to trigger
 * live API queries. Click a result row to see the navigation callback fire.
 */
const InteractiveModal: React.FC<GlobalSearchModalProps> = (args) => {
  const [open, setOpen] = React.useState(true);
  const [lastResult, setLastResult] = React.useState<SearchResult | null>(null);

  const handleResultClick = (result: SearchResult): void => {
    setLastResult(result);
    args.onResultClick?.(result);
  };

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => {
          setOpen(true);
        }}
        style={{ marginBottom: 16, cursor: "pointer" }}
      >
        Open search modal (or press Ctrl+K)
      </button>

      {lastResult !== null && (
        <div
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            background: "#f5f5f5",
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          Last selected: <strong>{lastResult.kind}</strong> —{" "}
          <code>{lastResult.item.id}</code>
        </div>
      )}

      <GlobalSearchModal
        {...args}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onResultClick={handleResultClick}
      />
    </div>
  );
};

export const Interactive: ModalStory = {
  render: (args) => <InteractiveModal {...args} />,
  args: {
    open: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive version. Use the autocomplete dropdown to select a resource type (arrow keys + Enter), then type at least 3 characters to trigger live API queries. Clicking a result row logs the selected entity below the button.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// GlobalSearchButton story — inlined here because Storybook only supports one
// default export per file; metadata is applied directly on the story object.
// ---------------------------------------------------------------------------

/**
 * The button as it appears in the app header — click it to open the modal,
 * or press Ctrl+K / Cmd+K.
 */
export const Button: StoryObj<GlobalSearchButtonProps> = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: 16,
        background: "#1a237e",
        gap: 8,
        borderRadius: 4,
      }}
    >
      <span style={{ color: "#fff", fontSize: 14 }}>lies.exposed</span>
      <GlobalSearchButton {...args} />
    </div>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "The search icon button in its header context. Clicking opens the GlobalSearchModal; pressing Ctrl+K / Cmd+K anywhere on the page does the same.",
      },
    },
  },
};
