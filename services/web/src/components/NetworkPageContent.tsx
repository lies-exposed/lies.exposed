import { Page } from "@econnessione/shared/lib/io/http";
import { RenderHTML } from "@utils/renderHTML";
import { Heading } from "baseui/heading";
import * as React from "react";

type NetworkPageContentProps = Page.PageMD;

export const NetworkPageContent: React.FC<NetworkPageContentProps> = ({
  frontmatter,
  body,
}) => {
  return (
    <>
      <Heading $style={{ textAlign: "center" }}>{frontmatter.title}</Heading>
      <div style={{ textAlign: "center" }}>
        {RenderHTML({ children: body })}
      </div>
    </>
  );
};
