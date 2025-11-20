import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box } from "../../mui/index.js";

/**
 * MarkdownContent Component
 *
 * Renders markdown content using react-markdown with GitHub Flavored Markdown support.
 */
export const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Box
      sx={{
        "& p": { margin: 0, marginBottom: "0.5em" },
        "& p:last-child": { marginBottom: 0 },
        "& ul, & ol": { margin: "0.5em 0", paddingLeft: "1.5em" },
        "& li": { marginBottom: "0.25em" },
        "& code": {
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          padding: "0.1em 0.3em",
          borderRadius: "3px",
          fontFamily: "monospace",
          fontSize: "0.9em",
        },
        "& pre": {
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          padding: "0.5em",
          borderRadius: "4px",
          overflow: "auto",
          marginBottom: "0.5em",
        },
        "& pre code": {
          backgroundColor: "transparent",
          padding: 0,
        },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          margin: "0.5em 0 0.25em",
          fontWeight: "bold",
        },
        "& h1": { fontSize: "1.5em" },
        "& h2": { fontSize: "1.3em" },
        "& h3": { fontSize: "1.1em" },
        "& blockquote": {
          borderLeft: "3px solid rgba(0, 0, 0, 0.2)",
          paddingLeft: "0.8em",
          margin: "0.5em 0",
          fontStyle: "italic",
        },
        "& a": {
          color: "inherit",
          textDecoration: "underline",
        },
        "& table": {
          borderCollapse: "collapse",
          width: "100%",
          margin: "0.5em 0",
        },
        "& th, & td": {
          border: "1px solid rgba(0, 0, 0, 0.1)",
          padding: "0.4em",
          textAlign: "left",
        },
        "& th": {
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          fontWeight: "bold",
        },
        fontSize: "0.875rem",
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  );
};
