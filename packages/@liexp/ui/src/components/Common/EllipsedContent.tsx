import { Box } from "@material-ui/core";
import { Value } from "@react-page/editor";
import * as React from "react";
import Editor from "./Editor";

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
