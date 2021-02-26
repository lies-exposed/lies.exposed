import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Page } from "@io/http";
import * as React from "react";

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
