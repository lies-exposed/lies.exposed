import { $createCodeNode } from "@lexical/code";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  LexicalTypeaheadMenuPlugin,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { clsx } from "clsx";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  type TextNode,
} from "lexical";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { useModal } from "../../../../../hooks/useModal";
import { styled } from "../../../../../theme";
import { AutocompleteActorInput } from "../../../../Input/AutocompleteActorInput";
import { AutocompleteMediaInput } from "../../../../Input/AutocompleteMediaInput";
import { Box, List, ListItem, Paper, Typography, alpha } from "../../../../mui";
import { FAIcon } from "../../../Icons/FAIcon";
import { INSERT_ACTOR_RULE_COMMAND } from "../ActorPlugin";
import { INSERT_MEDIA_RULE_COMMAND } from "../MediaPlugin";

class ComponentPickerOption extends TypeaheadOption {
  // What shows up in the editor
  public title: string;
  // Icon for display
  public icon?: JSX.Element;
  // For extra searching.
  public keywords: string[];
  // TBD
  public keyboardShortcut?: string;
  // What happens when you select this option?
  public onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: string[];
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords ?? [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function ComponentPickerMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}): JSX.Element {
  return (
    <ListItem
      key={option.key}
      tabIndex={-1}
      className={clsx(classes.menuItem, { selected: isSelected })}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.icon}
      <Typography className={classes.menuItemText} variant="caption">
        {option.title}
      </Typography>
    </ListItem>
  );
}

const PREFIX = "component-picker";
const classes = {
  paper: `${PREFIX}-paper`,
  list: `${PREFIX}-list`,
  menuItem: `${PREFIX}-menu-item`,
  menuItemText: `${PREFIX}-menu-item-text`,
};
const StyledComponentPickerMenu = styled(Box)(({ theme }) => ({
  [`& .${classes.paper}`]: {
    minWidth: 150,
    maxHeight: 300,
    overflow: "scroll",
    backgroundColor: theme.palette.common.white,
    zIndex: 9999,
    position: 'absolute'
  },
  [`& .${classes.list}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    paddingBottom: theme.spacing(2),
  },
  [`& .${classes.menuItem}`]: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: theme.spacing(2),
    [`&.selected`]: {
      background: alpha(theme.palette.primary.light, 0.4),
    },
  },
  [`& .${classes.menuItemText}`]: {
    marginLeft: theme.spacing(2),
  },
}));

export default function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const getDynamicOptions = useCallback(() => {
    const options: ComponentPickerOption[] = [];

    if (queryString == null) {
      return options;
    }

    const fullTableRegex = /^([1-9]|10)x([1-9]|10)$/;
    const partialTableRegex = /^([1-9]|10)x?$/;

    const fullTableMatch = fullTableRegex.exec(queryString);
    const partialTableMatch = partialTableRegex.exec(queryString);

    if (fullTableMatch) {
      const [rows, columns] = fullTableMatch[0]
        .split("x")
        .map((n: string) => parseInt(n, 10));

      options.push(
        new ComponentPickerOption(`${rows}x${columns} Table`, {
          icon: <i className="icon table" />,
          keywords: ["table"],
          onSelect: () =>
            editor.dispatchCommand(INSERT_TABLE_COMMAND, {
              columns: columns + "",
              rows: rows + "",
            }),
        })
      );
    } else if (partialTableMatch) {
      const rows = parseInt(partialTableMatch[0], 10);

      options.push(
        ...Array.from({ length: 5 }, (_, i) => i + 1).map(
          (columns) =>
            new ComponentPickerOption(`${rows}x${columns} Table`, {
              icon: <i className="icon table" />,
              keywords: ["table"],
              onSelect: () =>
                editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                  columns: columns.toString(),
                  rows: rows.toString(),
                }),
            })
        )
      );
    }

    return options;
  }, [editor, queryString]);

  const options = useMemo(() => {
    const baseOptions: any[] = [
      new ComponentPickerOption("Paragraph", {
        icon: <FAIcon icon={"paragraph"} />,
        keywords: ["normal", "paragraph", "p", "text"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        },
      }),
      ...Array.from({ length: 6 }, (_, i) => i + 1).map(
        (n) =>
          new ComponentPickerOption(`Heading ${n}`, {
            icon: <FAIcon fontSize={18 - n} icon="header" />,
            keywords: ["heading", "header", `h${n}`],
            onSelect: () => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () =>
                    $createHeadingNode(`h${n}` as any)
                  );
                }
              });
            },
          })
      ),
      new ComponentPickerOption("Numbered List", {
        icon: <i className="icon number" />,
        keywords: ["numbered list", "ordered list", "ol"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption("Bulleted List", {
        icon: <i className="icon bullet" />,
        keywords: ["bulleted list", "unordered list", "ul"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
      }),
      // new ComponentPickerOption("Check List", {
      //   icon: <i className="icon check" />,
      //   keywords: ["check list", "todo list"],
      //   onSelect: () =>
      //     editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
      // }),
      new ComponentPickerOption("Quote", {
        icon: <FAIcon icon="quote-left" />,
        keywords: ["block quote"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          });
        },
      }),
      new ComponentPickerOption("Code", {
        icon: <i className="icon code" />,
        keywords: ["javascript", "python", "js", "codeblock"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection.insertRawText(textContent);
              }
            }
          });
        },
      }),
      new ComponentPickerOption("Divider", {
        icon: <i className="icon horizontal-rule" />,
        keywords: ["horizontal rule", "divider", "hr"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
      }),
      new ComponentPickerOption("Media", {
        icon: <FAIcon icon="file-image" />,
        keywords: ["media", "image", "video"],
        onSelect: (queryString) => {
          showModal("Add media", (onClose) => (
            <div>
              <AutocompleteMediaInput
                discrete={false}
                selectedItems={[]}
                onChange={(m) => {
                  if (m[0]) {
                    editor.dispatchCommand(INSERT_MEDIA_RULE_COMMAND, m[0]);
                    onClose();
                  }
                }}
              />
            </div>
          ));
        },
      }),
      new ComponentPickerOption("Actor", {
        icon: <FAIcon icon="user" />,
        keywords: ["actor", "act"],
        onSelect: (queryString) => {
          showModal("Add Actor", (onClose) => (
            <div>
              <AutocompleteActorInput
                discrete={false}
                selectedItems={[]}
                onChange={(m) => {
                  if (m[0]) {
                    editor.dispatchCommand(INSERT_ACTOR_RULE_COMMAND, m[0]);
                    onClose();
                  }
                }}
              />
            </div>
          ));
        },
      }),
      ...["left", "center", "right", "justify"].map(
        (alignment) =>
          new ComponentPickerOption(`Align ${alignment}`, {
            icon: <i className={`icon ${alignment}-align`} />,
            keywords: ["align", "justify", alignment],
            onSelect: () => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment as any);
            },
          })
      ),
    ];

    const dynamicOptions = getDynamicOptions();

    return queryString
      ? [
          ...dynamicOptions,
          ...baseOptions.filter((option) => {
            return new RegExp(queryString, "gi").exec(option.title) ??
              option.keywords != null
              ? option.keywords.some((keyword: string) =>
                  new RegExp(queryString, "gi").exec(keyword)
                )
              : false;
          }),
        ]
      : baseOptions;
  }, [editor, getDynamicOptions, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove();
        }
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                <StyledComponentPickerMenu className="typeahead-popover component-picker-menu">
                  <Paper className={classes.paper} >
                    <List className={classes.list}>
                      {options.map((option, i: number) => (
                        <ComponentPickerMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                          }}
                          onMouseEnter={() => {
                            setHighlightedIndex(i);
                          }}
                          key={option.key}
                          option={option}
                        />
                      ))}
                    </List>
                  </Paper>
                </StyledComponentPickerMenu>,
                anchorElementRef.current
              )
            : null
        }
      />
      {modal}
    </>
  );
}
