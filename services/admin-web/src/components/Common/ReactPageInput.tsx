/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import {
  cellPlugins,
  minimalCellPlugins,
} from "@econnessione/ui/components/Common/Editor";
import { RaReactPageInput } from "@react-page/react-admin";
import * as React from "react";
import { InputProps } from "react-admin";

const ReactPageInput: React.FC<InputProps & { onlyText?: boolean }> = ({
  onlyText = false,
  ...props
}) => {
  return (
    <RaReactPageInput
      label="Body"
      {...props}
      cellPlugins={onlyText ? minimalCellPlugins : cellPlugins}
      lang="en"
    />
  );
};

export default ReactPageInput;
