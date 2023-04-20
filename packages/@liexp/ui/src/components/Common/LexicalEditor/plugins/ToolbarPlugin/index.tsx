import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import { $isTableNode } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import { clsx } from "clsx";
import type { LexicalEditor, NodeKey } from "lexical";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
// import {
//   INSERT_IMAGE_COMMAND,
//   InsertImageDialog,
//   InsertImagePayload,
// } from "../MediaPlugin";
import { styled } from "../../../../../theme";
import {
  Box,
  Button,
  Divider,
  IconButton,
  RedoIcon,
  Typography,
  UndoIcon,
} from "../../../../mui";
import { DropDown, DropDownItem } from "../../../DropDown";
import { FAIcon, type FAIconProps } from "../../../Icons/FAIcon";
import { getSelectedNode } from "../../utils/getSelectedNode";

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

const blockTypeToFAIcon: Record<string, FAIconProps["icon"]> = {
  bullet: "paragraph",
  check: "paragraph",
  code: "code",
  h1: "header",
  h2: "header",
  h3: "header",
  h4: "header",
  h5: "header",
  h6: "header",
  number: "paragraph",
  paragraph: "paragraph",
  quote: "quote-left",
};

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

function getCodeLanguageOptions(): Array<[string, string]> {
  const options: Array<[string, string]> = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: Array<[string, string]> = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const FONT_SIZE_OPTIONS: Array<[string, string]> = [
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["13px", "13px"],
  ["14px", "14px"],
  ["15px", "15px"],
  ["16px", "16px"],
  ["17px", "17px"],
  ["18px", "18px"],
  ["19px", "19px"],
  ["20px", "20px"],
];

const iconProps = {
  fontSize: 12,
};

function dropDownActiveClass(active: boolean): string {
  if (active) return "active dropdown-item-active";
  else return "";
}

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = (): void => {
    editor.update(() => {
      const selection = $getSelection();
      if (
        $isRangeSelection(selection) ||
        DEPRECATED_$isGridSelection(selection)
      ) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType): void => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = (): void => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = (): void => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = (): void => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = (): void => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = (): void => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection))
              selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  return (
    <DropDown
      disabled={disabled}
      className={clsx(classes.toolbarItem)}
      // buttonIconClassName={"icon block-type " + blockType}
      icon={<FAIcon {...iconProps} icon={blockTypeToFAIcon[blockType]} />}
      label={
        <Typography variant="caption">
          {blockTypeToBlockName[blockType]}
        </Typography>
      }
    >
      {({ onClose }) => (
        <>
          <DropDownItem
            onClick={(e) => {
              onClose(e);
              formatParagraph();
            }}
            className={"item " + dropDownActiveClass(blockType === "paragraph")}
            icon={<FAIcon {...iconProps} icon={"paragraph"} />}
          >
            <Typography variant="caption">Normal</Typography>
          </DropDownItem>

          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "h1")}
            onClick={() => {
              formatHeading("h1");
            }}
            icon={<FAIcon {...iconProps} icon="header" />}
          >
            <Typography variant="caption">Heading 1</Typography>
          </DropDownItem>
          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "h2")}
            onClick={() => {
              formatHeading("h2");
            }}
            icon={<FAIcon {...iconProps} icon="header" />}
          >
            <Typography variant="caption">Heading 2</Typography>
          </DropDownItem>
          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "h3")}
            onClick={() => {
              formatHeading("h3");
            }}
            icon={<FAIcon {...iconProps} icon="header" />}
          >
            <Typography variant="caption">Heading 3</Typography>
          </DropDownItem>
          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "bullet")}
            onClick={formatBulletList}
            icon={<FAIcon {...iconProps} icon="header" />}
          >
            <Typography variant="caption">Bullet List</Typography>
          </DropDownItem>
          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "number")}
            onClick={formatNumberedList}
            icon={<i className="icon numbered-list" />}
          >
            <Typography variant="caption">Numbered List</Typography>
          </DropDownItem>
          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "check")}
            onClick={formatCheckList}
          >
            <i className="icon check-list" />
            <Typography variant="caption">Check List</Typography>
          </DropDownItem>
          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "quote")}
            onClick={formatQuote}
            icon={<FAIcon {...iconProps} icon="quote-left" />}
          >
            <Typography variant="caption">Quote</Typography>
          </DropDownItem>
          <DropDownItem
            className={"item " + dropDownActiveClass(blockType === "code")}
            onClick={formatCode}
            icon={<FAIcon icon="code" />}
          >
            <Typography variant="caption">Code Block</Typography>
          </DropDownItem>
        </>
      )}
    </DropDown>
  );
}

function FontDropDown({
  editor,
  value,
  style,
  icon,
  disabled = false,
}: {
  editor: LexicalEditor;
  style: string;
  value: string;
  icon: React.ReactNode;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  return (
    <DropDown
      disabled={disabled}
      className={"toolbar-item " + style}
      icon={icon}
      label={<Typography variant="caption">{value}</Typography>}
    >
      {({ onClose }) => (
        <div>
          {(style === "font-family"
            ? FONT_FAMILY_OPTIONS
            : FONT_SIZE_OPTIONS
          ).map(([option, text]) => (
            <DropDownItem
              className={`item ${dropDownActiveClass(value === option)}`}
              onClick={(e) => {
                onClose(e);
                handleClick(option);
              }}
              key={option}
            >
              <Typography variant="caption">{text}</Typography>
            </DropDownItem>
          ))}
        </div>
      )}
    </DropDown>
  );
}

const PREFIX = `editor-toolbar`;
const classes = {
  toolbarItem: `${PREFIX}-toolbar-item`,
  font: `${PREFIX}-font`,
};

const StyledToolbar = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  [` .${classes.toolbarItem}`]: {
    display: "flex",
    alignItems: "center",
  },
  [` .${classes.font}`]: {},
}));

export default function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [rootType, setRootType] =
    useState<keyof typeof rootTypeToRootName>("root");
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );
  const [fontSize, setFontSize] = useState<string>("15px");
  // const [fontColor, setFontColor] = useState<string>("#000");
  // const [bgColor, setBgColor] = useState<string>("#fff");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  // const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : ""
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "15px")
      );
      // setFontColor(
      //   $getSelectionStyleValueForProperty(selection, "color", "#000")
      // );
      // setBgColor(
      //   $getSelectionStyleValueForProperty(
      //     selection,
      //     "background-color",
      //     "#fff"
      //   )
      // );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  // const applyStyleText = useCallback(
  //   (styles: Record<string, string>) => {
  //     activeEditor.update(() => {
  //       const selection = $getSelection();
  //       if ($isRangeSelection(selection)) {
  //         $patchStyleText(selection, styles);
  //       }
  //     });
  //   },
  //   [activeEditor]
  // );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            if (idx === 0 && anchor.offset !== 0) {
              node = node.splitText(anchor.offset)[1] || node;
            }
            if (idx === nodes.length - 1) {
              node = node.splitText(focus.offset)[0] || node;
            }

            if (node.__style !== "") {
              node.setStyle("");
            }
            if (node.__format !== 0) {
              node.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(node).setFormat("");
            }
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat("");
          }
        });
      }
    });
  }, [activeEditor]);

  // const onFontColorSelect = useCallback(
  //   (value: string) => {
  //     applyStyleText({ color: value });
  //   },
  //   [applyStyleText]
  // );

  // const onBgColorSelect = useCallback(
  //   (value: string) => {
  //     applyStyleText({ "background-color": value });
  //   },
  //   [applyStyleText]
  // );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );

  return (
    <StyledToolbar className="toolbar">
      <IconButton
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        size="small"
        title={"Undo (Ctrl+Z)"}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <UndoIcon />
      </IconButton>
      <Button
        startIcon={<RedoIcon aria-label="Redo" />}
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        size="small"
        title={"Redo (Ctrl+Y)"}
        type="button"
        className="toolbar-item"
        aria-label="Redo"
      />
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={blockType}
            rootType={rootType}
            editor={editor}
          />
          <Divider />
        </>
      )}
      {blockType === "code" ? (
        <DropDown
          disabled={!isEditable}
          className="toolbar-item code-language"
          label={
            <Typography>{getLanguageFriendlyName(codeLanguage)}</Typography>
          }
        >
          {({ onClose }) => (
            <>
              {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
                return (
                  <DropDownItem
                    className={`item ${dropDownActiveClass(
                      value === codeLanguage
                    )}`}
                    onClick={() => {
                      onCodeLanguageSelect(value);
                    }}
                    key={value}
                  >
                    <Typography variant="caption">{name}</Typography>
                  </DropDownItem>
                );
              })}
            </>
          )}
        </DropDown>
      ) : (
        <>
          <FontDropDown
            disabled={!isEditable}
            style="font-size"
            icon={<FAIcon {...iconProps} icon="text-height" />}
            value={fontFamily}
            editor={editor}
          />
          <FontDropDown
            disabled={!isEditable}
            icon={<FAIcon {...iconProps} icon="text-height" />}
            style="font-family"
            value={fontSize}
            editor={editor}
          />
          <Divider />
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={"toolbar-item spaced " + (isBold ? "active" : "")}
            title={"Bold (Ctrl+B)"}
            type="button"
            aria-label={`Format text as bold. Shortcut: ${"Ctrl+B"}`}
            size="small"
          >
            <FAIcon {...iconProps} icon="bold" />
          </IconButton>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={"toolbar-item spaced " + (isItalic ? "active" : "")}
            title={"Italic (Ctrl+I)"}
            type="button"
            aria-label={`Format text as italics. Shortcut: ${"Ctrl+I"}`}
            size="small"
          >
            <FAIcon {...iconProps} icon="italic" />
          </IconButton>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
            title={"Underline (Ctrl+U)"}
            type="button"
            aria-label={`Format text to underlined. Shortcut: ${"Ctrl+U"}`}
            size="small"
          >
            <FAIcon {...iconProps} icon="underline" />
          </IconButton>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            className={"toolbar-item spaced " + (isCode ? "active" : "")}
            title="Insert code block"
            type="button"
            aria-label="Insert code block"
            size="small"
          >
            <FAIcon {...iconProps} icon="code" />
          </IconButton>
          <IconButton
            disabled={!isEditable}
            onClick={insertLink}
            className={"toolbar-item spaced " + (isLink ? "active" : "")}
            aria-label="Insert link"
            title="Insert link"
            type="button"
            size="small"
          >
            <FAIcon {...iconProps} icon="link" fontSize={14} />
          </IconButton>
          {/* <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting text color"
            buttonIconClassName="icon font-color"
            color={fontColor}
            onChange={onFontColorSelect}
            title="text color"
          /> */}
          {/* <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting background color"
            buttonIconClassName="icon bg-color"
            color={bgColor}
            onChange={onBgColorSelect}
            title="bg color"
          /> */}
          <DropDown
            disabled={!isEditable}
            className="toolbar-item spaced"
            label={<Typography></Typography>}
            // buttonAriaLabel="Formatting options for additional text styles"
            // buttonIconClassName="icon dropdown-more"
          >
            {({ onClose }) => (
              <>
                <DropDownItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      "strikethrough"
                    );
                  }}
                  className={"item " + dropDownActiveClass(isStrikethrough)}
                  title="Strikethrough"
                  aria-label="Format text with a strikethrough"
                >
                  <i className="icon strikethrough" />
                  <Typography variant="caption">Strikethrough</Typography>
                </DropDownItem>
                <DropDownItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      "subscript"
                    );
                  }}
                  className={"item " + dropDownActiveClass(isSubscript)}
                  title="Subscript"
                  aria-label="Format text with a subscript"
                >
                  <i className="icon subscript" />
                  <Typography variant="caption">Subscript</Typography>
                </DropDownItem>
                <DropDownItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      "superscript"
                    );
                  }}
                  className={"item " + dropDownActiveClass(isSuperscript)}
                  title="Superscript"
                  aria-label="Format text with a superscript"
                >
                  <i className="icon superscript" />
                  <Typography variant="caption">Superscript</Typography>
                </DropDownItem>
                <DropDownItem
                  onClick={clearFormatting}
                  className="item"
                  title="Clear text formatting"
                  aria-label="Clear all text formatting"
                >
                  <FAIcon icon="remove" />
                  <Typography variant="caption">Clear Formatting</Typography>
                </DropDownItem>
              </>
            )}
          </DropDown>
          <Divider />
          <DropDown
            disabled={!isEditable}
            className="toolbar-item spaced"
            label={<Typography variant="caption">Insert</Typography>}
            // buttonAriaLabel="Insert specialized editor node"
            // buttonIconClassName="icon plus"
          >
            {({ onClose }) => (
              <>
                <DropDownItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      INSERT_HORIZONTAL_RULE_COMMAND,
                      undefined
                    );
                  }}
                  className="item"
                >
                  <i className="icon horizontal-rule" />
                  <Typography variant="caption">Horizontal Rule</Typography>
                </DropDownItem>
                {/* <DropDownItem
              onClick={() => {
                showModal("Insert Image", (onClose) => (
                  <InsertImageDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                  />
                ));
              }}
              className="item"
            >
              <i className="icon image" />
              <Typography variant="caption">Image</Typography>
            </DropDownItem> */}
                <DropDownItem
                  onClick={() => {
                    // editor.update(() => {
                    // const root = $getRoot();
                    // const stickyNode = $createStickyNode(0, 0);
                    // root.append(stickyNode);
                    // });
                  }}
                  className="item"
                >
                  <i className="icon sticky" />
                  <Typography variant="caption">Sticky Note</Typography>
                </DropDownItem>

                {/* {EmbedConfigs.map((embedConfig) => (
              <DropDownItem
                key={embedConfig.type}
                onClick={() => {
                  activeEditor.dispatchCommand(
                    INSERT_EMBED_COMMAND,
                    embedConfig.type
                  );
                }}
                className="item"
              >
                {embedConfig.icon}
                <Typography variant="caption">{embedConfig.contentName}</Typography>
              </DropDownItem>
            ))} */}
              </>
            )}
          </DropDown>
        </>
      )}
      <Divider />
      <DropDown
        disabled={!isEditable}
        label={<Typography variant="caption">Align</Typography>}
        icon={<FAIcon {...iconProps} icon="align-left" />}
        // buttonClassName="toolbar-item spaced alignment"
        // buttonAriaLabel="Formatting options for text alignment"
      >
        {({ onClose }) => (
          <>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
              }}
              className="item"
              icon={<FAIcon {...iconProps} icon="align-left" />}
            >
              <Typography variant="caption">Left Align</Typography>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
              }}
              className="item"
              icon={<FAIcon {...iconProps} icon="align-center" />}
            >
              <Typography variant="caption">Center Align</Typography>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
              }}
              className="item"
            >
              <FAIcon icon="align-right" />
              <Typography variant="caption">Right Align</Typography>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
              }}
              className="item"
            >
              <FAIcon icon="align-justify" />
              <Typography variant="caption">Justify Align</Typography>
            </DropDownItem>
            <Divider />
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  OUTDENT_CONTENT_COMMAND,
                  undefined
                );
              }}
              className="item"
            >
              <i className={"icon " + (isRTL ? "indent" : "outdent")} />
              <Typography variant="caption">Outdent</Typography>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
              }}
              className="item"
            >
              <i className={"icon " + (isRTL ? "outdent" : "indent")} />
              <Typography variant="caption">Indent</Typography>
            </DropDownItem>
          </>
        )}
      </DropDown>

      {/* {modal} */}
    </StyledToolbar>
  );
}
