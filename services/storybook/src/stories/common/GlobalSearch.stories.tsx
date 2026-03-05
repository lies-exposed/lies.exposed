import GlobalSearchButton, {
  type GlobalSearchButtonProps,
} from "@liexp/ui/lib/components/Header/GlobalSearchButton.js";
import {
  GlobalSearchModal,
  type GlobalSearchModalProps,
  type SearchResult,
} from "@liexp/ui/lib/components/Common/Search/GlobalSearchModal.js";
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
          "Command-palette style modal for searching across all entity types. Opened via the search button or Ctrl+K / Cmd+K.",
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
 * Interactive wrapper — type at least 2 characters to trigger live queries,
 * click a chip to narrow the search to a specific entity type, and click a
 * result row to see the navigation callback fire.
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
          "Fully interactive version. Type in the search box (at least 2 characters) to trigger live API queries. Select a resource type chip to narrow results. Clicking a result row logs the selected entity below the button.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// GlobalSearchButton stories
// ---------------------------------------------------------------------------

const buttonMeta: Meta<GlobalSearchButtonProps> = {
  title: "Components/Common/GlobalSearch/GlobalSearchButton",
  component: GlobalSearchButton,
  parameters: {
    docs: {
      description: {
        component:
          "Self-contained icon button that owns the open/close state of the GlobalSearchModal. Also responds to Ctrl+K / Cmd+K globally.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onResultClick: { action: "onResultClick" },
  },
};

// Re-export as a second default for the button sub-story group.
// Storybook resolves the default export per file, so we inline the button
// story as a named export inside the modal story file using a custom render.

type ButtonStory = StoryObj<GlobalSearchButtonProps>;

/**
 * The button as it appears in the app header — click it to open the modal,
 * or press Ctrl+K.
 */
export const Button: ButtonStory = {
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
