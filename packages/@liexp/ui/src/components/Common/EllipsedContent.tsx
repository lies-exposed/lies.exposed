import { type Value } from "@react-page/editor/lib-es/index.js";
import * as React from "react";
import { Box } from "../mui/index.js";
import { LazyEditor as Editor } from "./Editor/index.js";

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
