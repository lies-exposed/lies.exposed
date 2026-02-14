import React, { useState, useEffect } from "react";
import { MarkdownContent } from "../Common/Markdown/MarkdownContent.js";
import { Box, Typography, Stack, Icons } from "../mui/index.js";
import { MessageBubble } from "./MessageBubble.js";
import { ToolMessage } from "./ToolMessage.js";
import { styled } from "../../theme/index.js";

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

// Styled progress bar
const TokenProgressBar = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 4,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 2,
  overflow: "hidden",
  marginTop: theme.spacing(0.5),
}));

const TokenProgressFill = styled(Box)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.primary.main,
  transition: "width 0.3s ease",
}))

interface StreamingMessageProps {
  streamingMessage: {
    content: string;
    tool_calls?: ToolCall[];
    timestamp: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      isEstimated: boolean;
    } | null;
  };
  formatTime: (timestamp: string) => string;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  streamingMessage,
  formatTime,
}) => {
  const [isStreamingExpanded, setIsStreamingExpanded] = useState(true);

  // Reset streaming expanded state when streaming message changes or completes
  useEffect(() => {
    setIsStreamingExpanded(true);
  }, [streamingMessage]);

  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        backgroundColor: (theme) => theme.palette.background.paper,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      {/* Streaming content message */}
      {streamingMessage.content && (
        <Stack direction="row" justifyContent="flex-start">
          <MessageBubble isUser={false}>
            <Box
              role="button"
              tabIndex={0}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
                cursor: "pointer",
              }}
              onClick={() => setIsStreamingExpanded(!isStreamingExpanded)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsStreamingExpanded(!isStreamingExpanded);
                }
              }}
              aria-label={
                isStreamingExpanded
                  ? "Collapse streaming message"
                  : "Expand streaming message"
              }
              aria-expanded={isStreamingExpanded}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  fontSize: "0.75rem",
                }}
              >
                AI is responding...
              </Typography>
              <Icons.ExpandMore
                sx={{
                  fontSize: "1rem",
                  color: "primary.main",
                  transform: isStreamingExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s",
                  ml: 1,
                }}
              />
            </Box>
            {isStreamingExpanded && (
              <MarkdownContent content={streamingMessage.content} />
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  fontSize: "0.7rem",
                }}
              >
                {streamingMessage.timestamp
                  ? formatTime(streamingMessage.timestamp)
                  : "Streaming..."}
              </Typography>
            </Box>

            {/* Token usage progress indicator */}
            {streamingMessage.tokenUsage && (
              <Box sx={{ mt: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.65rem",
                      opacity: 0.7,
                    }}
                  >
                    Tokens:{" "}
                    {streamingMessage.tokenUsage.completionTokens.toLocaleString()}
                    {streamingMessage.tokenUsage.isEstimated ? " (est.)" : ""}
                  </Typography>
                  {streamingMessage.tokenUsage.totalTokens > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.65rem",
                        opacity: 0.7,
                      }}
                    >
                      {Math.round(
                        (streamingMessage.tokenUsage.completionTokens /
                          Math.max(
                            streamingMessage.tokenUsage.totalTokens,
                            streamingMessage.tokenUsage.completionTokens,
                          )) *
                          100,
                      )}
                      %
                    </Typography>
                  )}
                </Box>
                <TokenProgressBar>
                  <TokenProgressFill
                    sx={{
                      width:
                        streamingMessage.tokenUsage.totalTokens > 0
                          ? `${Math.min(
                              (streamingMessage.tokenUsage.completionTokens /
                                streamingMessage.tokenUsage.totalTokens) *
                                100,
                              100,
                            )}%`
                          : "0%",
                    }}
                  />
                </TokenProgressBar>
              </Box>
            )}
          </MessageBubble>
        </Stack>
      )}

      {/* Streaming tool calls as separate messages */}
      {streamingMessage.tool_calls &&
        streamingMessage.tool_calls.length > 0 &&
        streamingMessage.tool_calls.map((toolCall, index) => (
          <ToolMessage
            key={`streaming-tool-${toolCall.id}-${index}`}
            message={{
              id: toolCall.id,
              role: "tool",
              content: JSON.stringify({
                tool: toolCall.function.name,
                arguments: toolCall.function.arguments,
              }),
              timestamp: streamingMessage.timestamp,
              tool_calls: [toolCall],
            }}
            formatTime={formatTime}
          />
        ))}
    </Box>
  );
};
