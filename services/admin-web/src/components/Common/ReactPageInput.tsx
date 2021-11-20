/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import { cellPlugins } from "@econnessione/ui/components/Common/Editor";
import { RaReactPageInput } from "@react-page/react-admin";
import * as React from "react";
import { InputProps } from "react-admin";

const ReactPageInput: React.FC<InputProps> = (props) => {
  return (
    <RaReactPageInput
      {...props}
      label="Body2"
      cellPlugins={cellPlugins}
      lang="en"
    />
  );
};

export default ReactPageInput;
