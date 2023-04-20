import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";
import * as React from "react";
import { styled } from "../../../../../theme";
import { Box } from "../../../../mui";

const PREFIX = `tree-view`;
const classes = {
  root: `${PREFIX}-root`,
  view: `${PREFIX}-output`,
  typeButton: `${PREFIX}-type-button`,
  timeTravelPanel: `${PREFIX}-time-travel-panel`,
  timeTravelButton: `${PREFIX}-time-travel-button`,
  timeTravelPanelSlider: `${PREFIX}-time-travel-panel-slider`,
  timeTravelPanelButton: `${PREFIX}-time-travel-panel-button`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    padding: theme.spacing(2),
    background: theme.palette.grey[800],
  },
  [` .${classes.view}`]: {
    [`> pre`]: {
      color: theme.palette.common.white,
    },
  },
}));

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <StyledBox className={classes.root}>
      <TreeView
        viewClassName={classes.view}
        treeTypeButtonClassName={classes.typeButton}
        timeTravelPanelClassName={classes.timeTravelPanel}
        timeTravelButtonClassName={classes.timeTravelPanel}
        timeTravelPanelSliderClassName={classes.timeTravelPanelSlider}
        timeTravelPanelButtonClassName={classes.timeTravelPanelButton}
        editor={editor}
      />
    </StyledBox>
  );
}
