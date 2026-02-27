import {
  DeleteLinkButton,
  EditLinkButton,
  LinkToolbar,
  LinkToolbarController,
  OpenLinkButton,
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
  type LinkToolbarProps,
} from "@blocknote/react";
import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useAPI } from "../../../../../hooks/useAPI.js";
import { CircularProgress, Icons } from "../../../../mui/index.js";

const isValidUrl = (text: string): boolean => {
  try {
    new URL(text.trim());
    return true;
  } catch {
    return false;
  }
};

const getUrlFromBlocks = (
  blocks: ReturnType<typeof useSelectedBlocks>,
): string | null => {
  for (const block of blocks) {
    if ("content" in block && Array.isArray(block.content)) {
      const text = (block.content as any[])
        .filter((c) => c.type === "text")
        .map((c) => c.text as string)
        .join("")
        .trim();
      if (isValidUrl(text)) {
        return text;
      }
    }
  }
  return null;
};

/**
 * Button shown in the FormattingToolbar when the selected block
 * contains a plain URL text.
 */
export const RegisterLinkFormattingButton: React.FC = () => {
  const editor = useBlockNoteEditor<
    BNESchemaEditor["schema"]["blockSchema"],
    BNESchemaEditor["schema"]["inlineContentSchema"],
    BNESchemaEditor["schema"]["styleSchema"]
  >();

  const Components = useComponentsContext();
  const selectedBlocks = useSelectedBlocks(editor);
  const api = useAPI();

  const [isLoading, setIsLoading] = React.useState(false);

  const detectedUrl = React.useMemo(
    () => getUrlFromBlocks(selectedBlocks),
    [selectedBlocks],
  );

  const registerLink = async (url: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await pipe(
        api.Link.Create({
          Body: {
            url: url as any,
            status: "DRAFT",
            events: [],
          },
        }),
        throwTE,
      );

      const link = result.data;
      const cursor = editor.getTextCursorPosition();

      editor.updateBlock(cursor.block, {
        content: [
          {
            type: "link-entity",
            props: {
              id: link.id,
              url: link.url,
              title: link.title ?? "",
            },
          } as any,
        ],
      });
    } catch (e) {
      console.error("Failed to register link:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!Components || !detectedUrl) {
    return null;
  }

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={`Register as Link: ${detectedUrl}`}
      onClick={() => void registerLink(detectedUrl)}
      isSelected={false}
    >
      {isLoading ? (
        <CircularProgress size={14} />
      ) : (
        <Icons.LinkIcon fontSize="small" />
      )}
    </Components.FormattingToolbar.Button>
  );
};

/**
 * Button shown inside the LinkToolbar (the popover that appears
 * when you click a hyperlink). Receives the URL from the link props
 * and registers it in the platform.
 */
const RegisterLinkToolbarButton: React.FC<
  Pick<LinkToolbarProps, "url" | "range" | "setToolbarOpen">
> = ({ url, range, setToolbarOpen }) => {
  const editor = useBlockNoteEditor<
    BNESchemaEditor["schema"]["blockSchema"],
    BNESchemaEditor["schema"]["inlineContentSchema"],
    BNESchemaEditor["schema"]["styleSchema"]
  >();

  const Components = useComponentsContext();
  const api = useAPI();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await pipe(
        api.Link.Create({
          Body: {
            url: url as any,
            status: "DRAFT",
            events: [],
          },
        }),
        throwTE,
      );

      const link = result.data;

      // Replace the hyperlink range with a link-entity inline chip
      editor._tiptapEditor
        .chain()
        .deleteRange(range)
        .insertContentAt(range.from, {
          type: "link-entity",
          attrs: {
            id: link.id,
            url: link.url,
            title: link.title ?? "",
          },
        })
        .run();

      setToolbarOpen?.(false);
    } catch (e) {
      console.error("Failed to register link:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!Components) return null;

  return (
    <Components.LinkToolbar.Button
      mainTooltip="Register as Link in platform"
      onClick={() => void handleClick()}
      isSelected={false}
    >
      {isLoading ? (
        <CircularProgress size={14} />
      ) : (
        <Icons.LinkIcon fontSize="small" />
      )}
    </Components.LinkToolbar.Button>
  );
};

/**
 * Custom LinkToolbar that adds the "Register as Link" button
 * alongside the default Edit / Open / Delete buttons.
 */
const CustomLinkToolbar: React.FC<LinkToolbarProps> = (props) => {
  return (
    <LinkToolbar {...props}>
      <EditLinkButton {...props} />
      <OpenLinkButton {...props} />
      <RegisterLinkToolbarButton
        url={props.url}
        range={props.range}
        setToolbarOpen={props.setToolbarOpen}
      />
      <DeleteLinkButton {...props} />
    </LinkToolbar>
  );
};

/**
 * Drop-in replacement for BlockNote's default LinkToolbarController.
 * Renders the custom toolbar with the "Register as Link" button.
 */
export const CustomLinkToolbarController: React.FC = () => {
  return <LinkToolbarController linkToolbar={CustomLinkToolbar} />;
};
