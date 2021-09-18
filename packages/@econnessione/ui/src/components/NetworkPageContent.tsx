import { Page } from "@econnessione/shared/io/http";
import { MarkdownRenderer } from "@econnessione/ui/components/Common/MarkdownRenderer";
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
