/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import "is-plain-object";
import { RaReactPageInput } from "@react-page/react-admin";
import get from "lodash/get";
import * as React from "react";
import { InputProps } from "react-admin";
import {
  cellPlugins,
  minimalCellPlugins
} from "../Common/Editor";


const ReactPageInput: React.FC<InputProps & { onlyText?: boolean }> = ({
  onlyText = false,
  ...props
}) => {
  const value = get(props.record, props.source);
  return (
    <RaReactPageInput
      {...props}
      label="Body"
      cellPlugins={onlyText ? minimalCellPlugins : cellPlugins}
      lang="en"
      value={value}
    />
  );
};

export default ReactPageInput;
