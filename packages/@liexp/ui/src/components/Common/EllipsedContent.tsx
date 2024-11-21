import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import { Box } from "../mui/index.js";
import { BNEditor } from "./BlockNote/index.js";

interface EllipsesContentProps {
  content: BNESchemaEditor["document"];
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
      <BNEditor readOnly content={content} />
    </Box>
  );
};
export default EllipsesContent;
