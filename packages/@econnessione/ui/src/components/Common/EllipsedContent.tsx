import * as React from "react";
import { Box } from "@material-ui/core";
import Editor from "./Editor";
import { Value } from "@react-page/editor";

interface EllipsesContentProps {
  content: Value;
  height: number;
}

const EllipsesContent: React.FC<EllipsesContentProps> = ({
  height,
  content,
}) => {
  return (
    <Box
      padding={0}
      height={height}
      style={{
        overflow: "hidden",
      }}
    >
      <Editor readOnly value={content} />
    </Box>
  );
};
export default EllipsesContent;
