import * as React from "react";
import { FlowGraphBuilder } from "../../Common/Graph/Flow/FlowGraphBuilder";
import { type TextInputProps, useInput } from "../react-admin";

interface GraphBuilderInputProps extends TextInputProps {
  optionsSource?: string;
}

export const GraphBuilderInput: React.FC<GraphBuilderInputProps> = ({
  source,
  optionsSource = "options",
  ...props
}) => {
  const {
    field: { onChange, value },
  } = useInput({
    ...props,
    source,
    defaultValue: {
      nodes: [],
      edges: [],
    },
  });

  const {
    field: { value: optionsValue, onChange: onOptionsChange },
  } = useInput({
    ...props,
    source: optionsSource,
    defaultValue: {},
  });

  return (
    <div style={{ width: "100%", height: 800, position: "relative" }}>
      <FlowGraphBuilder
        nodes={value.nodes}
        edges={value.edges}
        options={optionsValue}
        onGraphChange={onChange}
        onOptionsChange={onOptionsChange}
      />
    </div>
  );
};
