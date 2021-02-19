import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Page } from "@io/http";
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
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </div>
    </>
  );
};
