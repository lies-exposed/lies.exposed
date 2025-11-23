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
  let toolName = "Unknown Tool";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let toolResult: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let toolParams: any = null;

  try {
    parsedContent = JSON.parse(message.content);

    // Extract tool name, arguments, and result from the parsed content
    if (parsedContent.tool) {
      toolName = parsedContent.tool;
    }
    if (parsedContent.arguments) {
      toolParams = parsedContent.arguments;
      // Try to parse arguments if it's a JSON string
      if (typeof toolParams === "string") {
        try {
          toolParams = JSON.parse(toolParams);
        } catch {
          // Keep as string
        }
      }
    }
    if (parsedContent.result) {
      toolResult = parsedContent.result;
      // Try to parse result if it's a JSON string
      if (typeof toolResult === "string") {
        try {
          toolResult = JSON.parse(toolResult);
        } catch {
          // Keep as string
        }
      }
    }
  } catch {
    // Content is plain text
    toolResult = message.content;
  }

  // Get tool information from tool_calls if available (fallback)
  const toolCall = message.tool_calls?.[0];

  if (toolCall) {
    toolName = toolCall.function.name;
    try {
      toolParams = JSON.parse(toolCall.function.arguments);
    } catch {
      toolParams = toolCall.function.arguments;
    }
  }

  // Generate a compact summary of parameters for the collapsed view
  const paramSummary = React.useMemo(() => {
    if (!toolParams) return null;

    const params = typeof toolParams === "object" ? toolParams : {};
    const entries = Object.entries(params);

    if (entries.length === 0) return null;

    // Show all parameters in compact form
    return entries
      .map(([key, value]) => {
        const displayValue =
          typeof value === "string"
            ? value.length > 30
              ? `${value.substring(0, 30)}...`
              : value
            : Array.isArray(value)
              ? `[${value.length} items]`
              : typeof value === "object" && value !== null
                ? "{...}"
                : String(value);
        return `${key}: ${displayValue}`;
      })
      .join(", ");
  }, [toolParams]);

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
          borderBottom: isExpanded ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
          padding: "0.5em 0.75em",
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icons.Assignment sx={{ fontSize: "1rem", color: "primary.main" }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              fontSize: "0.8rem",
              color: "primary.main",
            }}
          >
            {toolName}
          </Typography>
          {!isExpanded && paramSummary && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: "text.secondary",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {paramSummary}
            </Typography>
          )}
        </Box>
        <Icons.ExpandMore
          sx={{
            fontSize: "1rem",
            color: "primary.main",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </Box>

      {/* Tool Parameters (collapsible) */}
      {isExpanded && toolParams && (
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
              maxHeight: "200px",
            }}
          >
            {JSON.stringify(toolParams, null, 2)}
          </Box>
        </Box>
      )}

      {/* Tool Result (collapsible) */}
      {isExpanded && (
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
          {typeof toolResult === "object" && toolResult !== null ? (
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
                maxHeight: "300px",
              }}
            >
              {JSON.stringify(toolResult, null, 2)}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.8rem",
                whiteSpace: "pre-wrap",
                maxHeight: "300px",
                overflow: "auto",
              }}
            >
              {String(toolResult)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
