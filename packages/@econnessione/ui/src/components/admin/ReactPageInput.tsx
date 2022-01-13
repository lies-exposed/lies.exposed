/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import { RaReactPageInput } from "@react-page/react-admin";
import "is-plain-object";
import * as React from "react";
import { InputProps } from "react-admin";
import { cellPlugins, minimalCellPlugins } from "../Common/Editor";

const ReactPageInput: React.FC<InputProps & { onlyText?: boolean }> = ({
  onlyText = false,
  ...props
}) => {
  return (
    <RaReactPageInput
      label={props.source}
      {...props}
      cellPlugins={onlyText ? minimalCellPlugins : cellPlugins }
      lang="en"
    />
  );
};

export default ReactPageInput;
