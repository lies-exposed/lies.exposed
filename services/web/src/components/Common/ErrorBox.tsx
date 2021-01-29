import { Block } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import * as React from "react";

export const ErrorBox: (e: any) => React.ReactElement = (e: any) => {
  return (
    <FlexGridItem padding="30">
      <h4>An error occured</h4>
      <Block>
        <code>{JSON.stringify(e, null, 2)}</code>
      </Block>
    </FlexGridItem>
  );
};
