import { type Value } from "@liexp/react-page/lib/react-page.types.js";
import * as React from "react";
import { Box } from "../mui/index.js";
import { BNEditor } from "./BlockNote/Editor.js";

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
      <BNEditor readOnly content={content as any} />
    </Box>
  );
};
export default EllipsesContent;
