import { type ChatMessage } from "@liexp/shared/lib/io/http/Chat.js";
import React from "react";
import { Box, Icons, Typography } from "../mui/index.js";
/**
 * ToolMessageDisplay Component
 *
 * Displays tool messages with detailed information about tool calls,
 * parameters, and results.
 */
export const ToolMessageDisplay: React.FC<{
  message: ChatMessage;
}> = ({ message }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Try to parse content as JSON for structured display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsedContent: any = null;
  let isJsonContent = false;
  try {
    parsedContent = JSON.parse(message.content);
    isJsonContent = true;
  } catch {
    // Content is plain text
  }

  // Get tool information from tool_calls if available
  const toolCall = message.tool_calls?.[0];
  let toolName = "Unknown Tool";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let toolParams: any = null;

  if (toolCall) {
    toolName = toolCall.function.name;
    try {
      toolParams = JSON.parse(toolCall.function.arguments);
    } catch {
      toolParams = toolCall.function.arguments;
    }
  }

  return (
    <Box
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.15)",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {/* Tool Header */}
      <Box
        sx={{
          backgroundColor: "rgba(25, 118, 210, 0.08)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          padding: "0.5em 0.75em",
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: toolParams ? "pointer" : "default",
        }}
        onClick={() => toolParams && setIsExpanded(!isExpanded)}
      >
        <Icons.Assignment sx={{ fontSize: "1rem", color: "primary.main" }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            fontSize: "0.8rem",
            color: "primary.main",
            flex: 1,
          }}
        >
          {toolName}
        </Typography>
        {toolParams && (
          <Icons.ExpandMore
            sx={{
              fontSize: "1rem",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        )}
      </Box>

      {/* Tool Parameters (collapsible) */}
      {toolParams && isExpanded && (
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            padding: "0.5em 0.75em",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "0.25em",
              fontSize: "0.7rem",
              color: "text.secondary",
            }}
          >
            Parameters:
          </Typography>
          <Box
            component="pre"
            sx={{
              margin: 0,
              fontSize: "0.7rem",
              fontFamily: "monospace",
              overflow: "auto",
              backgroundColor: "rgba(0, 0, 0, 0.03)",
              padding: "0.4em",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(toolParams, null, 2)}
          </Box>
        </Box>
      )}

      {/* Tool Result */}
      <Box sx={{ padding: "0.5em 0.75em" }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "0.25em",
            fontSize: "0.7rem",
            color: "text.secondary",
          }}
        >
          Result:
        </Typography>
        {isJsonContent ? (
          <Box
            component="pre"
            sx={{
              margin: 0,
              fontSize: "0.75rem",
              fontFamily: "monospace",
              overflow: "auto",
              backgroundColor: "rgba(0, 0, 0, 0.03)",
              padding: "0.4em",
              borderRadius: "4px",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(parsedContent, null, 2)}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
