import { type Value } from "@liexp/react-page/lib/react-page.types.js";
import * as React from "react";
import { Box } from "../mui/index.js";
import { editor } from "./Editor/index.js";

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
      <editor.LazyEditor readOnly value={content} />
    </Box>
  );
};
export default EllipsesContent;
