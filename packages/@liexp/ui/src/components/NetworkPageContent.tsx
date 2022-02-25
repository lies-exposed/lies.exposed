import { Page } from "@liexp/shared/io/http";
import * as React from "react";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";

type NetworkPageContentProps = Page.PageMD;

export const NetworkPageContent: React.FC<NetworkPageContentProps> = ({
  frontmatter,
  body,
}) => {
  return (
    <>
      <div style={{ textAlign: "center" }}>{frontmatter.title}</div>
      <div style={{ textAlign: "center" }}>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </div>
    </>
  );
};
