import { type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import React from "react";
import { Box, Chip, Icons, Typography } from "../mui/index.js";

/**
 * ToolMessageDisplay Component
 *
 * Displays tool messages with human-friendly formatting:
 * - Parameters as a key-value list
 * - List results (total + data[]) as a compact item list
 * - Single-object results as a key-value table
 * - Errors with highlighted styling
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/** Pick the best human-readable label from an unknown record */
const getPrimaryLabel = (item: Record<string, unknown>): string => {
  for (const key of [
    "fullName",
    "name",
    "title",
    "label",
    "url",
    "username",
    "slug",
  ]) {
    if (typeof item[key] === "string" && item[key]) {
      return item[key] as string;
    }
  }
  return "";
};

/** Pick secondary info (type, date) from an unknown record */
const getSecondaryLabel = (item: Record<string, unknown>): string => {
  const parts: string[] = [];
  if (typeof item.type === "string") parts.push(item.type);
  if (typeof item.date === "string") parts.push(item.date.substring(0, 10));
  if (typeof item.createdAt === "string" && parts.length === 0)
    parts.push(item.createdAt.substring(0, 10));
  return parts.join(" · ");
};

const shortId = (id: unknown): string => {
  if (typeof id !== "string") return "";
  return id.length > 8 ? `${id.substring(0, 8)}…` : id;
};

/** Format a single param value for display */
const formatParamValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[${value.length} items]`;
  }
  if (typeof value === "object") return "{…}";
  const str = String(value as string);
  return str.length > 80 ? `${str.substring(0, 80)}…` : str;
};

// ─── sub-components ──────────────────────────────────────────────────────────

const KVRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 1,
      alignItems: "baseline",
      py: "2px",
    }}
  >
    <Typography
      component="span"
      sx={{
        fontSize: "0.68rem",
        fontFamily: "monospace",
        color: "text.secondary",
        fontWeight: "bold",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Typography>
    <Typography
      component="span"
      sx={{
        fontSize: "0.7rem",
        fontFamily: "monospace",
        wordBreak: "break-all",
        color: "text.primary",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const ParamsView: React.FC<{ params: unknown }> = ({ params }) => {
  if (!params) return null;
  const entries =
    typeof params === "object" && !Array.isArray(params)
      ? Object.entries(params as Record<string, unknown>).filter(
          ([, v]) => v !== undefined && v !== null && v !== "",
        )
      : [];

  if (entries.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {entries.map(([key, value]) => (
        <KVRow key={key} label={key} value={formatParamValue(value)} />
      ))}
    </Box>
  );
};

/** A single row in the data list */
const DataItem: React.FC<{ item: Record<string, unknown>; index: number }> = ({
  item,
  index,
}) => {
  const primary = getPrimaryLabel(item);
  const secondary = getSecondaryLabel(item);
  const id = shortId(item.id);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: "3px",
        borderBottom: (theme) =>
          `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography
        sx={{
          fontSize: "0.65rem",
          color: "text.disabled",
          minWidth: 18,
          textAlign: "right",
        }}
      >
        {index + 1}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {primary && (
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {primary}
          </Typography>
        )}
        {secondary && (
          <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
            {secondary}
          </Typography>
        )}
        {!primary && !secondary && (
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontFamily: "monospace",
              color: "text.secondary",
            }}
          >
            {JSON.stringify(item).substring(0, 60)}…
          </Typography>
        )}
      </Box>
      {id && (
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontFamily: "monospace",
            color: "text.disabled",
            flexShrink: 0,
          }}
        >
          {id}
        </Typography>
      )}
    </Box>
  );
};

const ListResult: React.FC<{
  total: number;
  data: Record<string, unknown>[];
  showRaw: boolean;
  raw: string;
}> = ({ total, data, showRaw, raw }) => {
  if (showRaw) {
    return (
      <Box
        component="pre"
        sx={{
          margin: 0,
          fontSize: "0.68rem",
          fontFamily: "monospace",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          maxHeight: 300,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
          padding: "0.4em",
          borderRadius: "4px",
        }}
      >
        {raw}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Chip
          label={`${total} result${total !== 1 ? "s" : ""}`}
          size="small"
          sx={{ height: 18, fontSize: "0.65rem" }}
        />
        {data.length < total && (
          <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
            (showing {data.length})
          </Typography>
        )}
      </Box>
      {data.length > 0 ? (
        <Box sx={{ maxHeight: 280, overflow: "auto" }}>
          {data.map((item, i) => (
            <DataItem key={i} item={item} index={i} />
          ))}
        </Box>
      ) : (
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          No items returned
        </Typography>
      )}
    </Box>
  );
};

const ObjectResult: React.FC<{
  obj: Record<string, unknown>;
  showRaw: boolean;
  raw: string;
}> = ({ obj, showRaw, raw }) => {
  if (showRaw) {
    return (
      <Box
        component="pre"
        sx={{
          margin: 0,
          fontSize: "0.68rem",
          fontFamily: "monospace",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          maxHeight: 300,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
          padding: "0.4em",
          borderRadius: "4px",
        }}
      >
        {raw}
      </Box>
    );
  }

  const entries = Object.entries(obj);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {entries.map(([key, value]) => (
        <KVRow key={key} label={key} value={formatParamValue(value)} />
      ))}
    </Box>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

export const ToolMessageDisplay: React.FC<{
  message: ChatMessage;
  formatTime?: (ts: string) => string;
}> = ({ message, formatTime }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showRaw, setShowRaw] = React.useState(false);

  let toolName = "Unknown Tool";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let toolResult: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let toolParams: any = null;

  try {
    const parsedContent = JSON.parse(message.content);

    if (parsedContent.tool) toolName = parsedContent.tool;

    if (parsedContent.arguments) {
      toolParams = parsedContent.arguments;
      if (typeof toolParams === "string" && toolParams.trim()) {
        try {
          toolParams = JSON.parse(toolParams);
        } catch {
          // keep as string
        }
      }
    }

    if (parsedContent.result) {
      toolResult = parsedContent.result;
      if (typeof toolResult === "string") {
        try {
          toolResult = JSON.parse(toolResult);
        } catch {
          // keep as string
        }
      }
    }
  } catch {
    toolResult = message.content;
  }

  // Fallback: get tool name from tool_calls
  const toolCall = message.tool_calls?.[0];
  if (toolCall) {
    toolName = toolCall.function.name;
    if (!toolParams) {
      try {
        toolParams = JSON.parse(toolCall.function.arguments);
      } catch {
        if (toolCall.function.arguments?.trim()) {
          toolParams = toolCall.function.arguments;
        }
      }
    }
  }

  const isError =
    typeof toolResult === "string" &&
    toolResult.trimStart().startsWith("ERROR");

  // Detect list result shape: { total: number, data: array }
  const isList =
    !isError &&
    typeof toolResult === "object" &&
    toolResult !== null &&
    typeof toolResult.total === "number" &&
    Array.isArray(toolResult.data);

  const rawResult =
    toolResult != null
      ? typeof toolResult === "string"
        ? toolResult
        : JSON.stringify(toolResult, null, 2)
      : null;

  // Compact param summary for collapsed view
  const paramSummary = React.useMemo(() => {
    if (!toolParams) return null;
    const params = typeof toolParams === "object" ? toolParams : {};
    const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    );
    if (entries.length === 0) return null;
    return entries
      .map(([key, value]) => `${key}: ${formatParamValue(value)}`)
      .join(", ");
  }, [toolParams]);

  // Result summary for collapsed view
  const resultSummary = React.useMemo(() => {
    if (isError) return null;
    if (isList)
      return `${(toolResult as any).total} result${(toolResult as any).total !== 1 ? "s" : ""}`;
    if (typeof toolResult === "object" && toolResult !== null) {
      const primary = getPrimaryLabel(toolResult as Record<string, unknown>);
      return primary || null;
    }
    return null;
  }, [isError, isList, toolResult]);

  return (
    <Box
      sx={{
        border: (theme) =>
          isError
            ? `1px solid ${theme.palette.mode === "dark" ? "rgba(244,67,54,0.4)" : "rgba(211,47,47,0.35)"}`
            : `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}`,
        borderRadius: 1,
        overflow: "hidden",
        backgroundColor: (theme) =>
          isError
            ? theme.palette.mode === "dark"
              ? "rgba(244, 67, 54, 0.06)"
              : "rgba(255, 235, 238, 0.4)"
            : theme.palette.mode === "dark"
              ? "rgba(255, 152, 0, 0.08)"
              : "rgba(255, 243, 224, 0.3)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: (theme) =>
            isError
              ? theme.palette.mode === "dark"
                ? "rgba(244, 67, 54, 0.18)"
                : "rgba(244, 67, 54, 0.10)"
              : theme.palette.mode === "dark"
                ? "rgba(255, 152, 0, 0.2)"
                : "rgba(255, 152, 0, 0.12)",
          borderBottom: (theme) =>
            isExpanded
              ? `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`
              : "none",
          padding: "0.4em 0.75em",
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isError ? (
          <Icons.HighlightOff
            sx={{ fontSize: "1rem", color: "error.main", flexShrink: 0 }}
          />
        ) : (
          <Icons.AutoAwesome
            sx={{ fontSize: "1rem", color: "warning.main", flexShrink: 0 }}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              fontSize: "0.78rem",
              fontFamily: "monospace",
              color: isError ? "error.dark" : "warning.dark",
            }}
          >
            {toolName}
          </Typography>

          {/* Collapsed summaries */}
          {!isExpanded && (paramSummary ?? resultSummary) && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.67rem",
                color: "text.secondary",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {paramSummary}
              {paramSummary && resultSummary && " → "}
              {resultSummary && (
                <span style={{ fontWeight: 500 }}>{resultSummary}</span>
              )}
            </Typography>
          )}
        </Box>

        {formatTime && (
          <Typography
            variant="caption"
            sx={{ fontSize: "0.62rem", opacity: 0.6, flexShrink: 0, mr: 0.5 }}
          >
            {formatTime(message.timestamp)}
          </Typography>
        )}
        <Icons.ExpandMore
          sx={{
            fontSize: "1rem",
            color: isError ? "error.main" : "warning.main",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </Box>

      {/* Expanded body */}
      {isExpanded && (
        <Box>
          {/* Params */}
          {toolParams && (
            <Box
              sx={{
                padding: "0.5em 0.75em",
                borderBottom: (theme) =>
                  toolResult != null
                    ? `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`
                    : "none",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  display: "block",
                  mb: 0.5,
                  fontSize: "0.67rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Input
              </Typography>
              <ParamsView params={toolParams} />
            </Box>
          )}

          {/* Result */}
          {toolResult != null && (
            <Box sx={{ padding: "0.5em 0.75em" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.75,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.67rem",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isError ? "Error" : "Result"}
                </Typography>

                {/* Raw toggle — only for non-error structured results */}
                {!isError && typeof toolResult === "object" && rawResult && (
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRaw(!showRaw);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        setShowRaw(!showRaw);
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.25,
                      cursor: "pointer",
                      opacity: 0.6,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Icons.Assignment sx={{ fontSize: "0.8rem" }} />
                    <Typography sx={{ fontSize: "0.65rem" }}>
                      {showRaw ? "formatted" : "raw"}
                    </Typography>
                  </Box>
                )}
              </Box>

              {isError ? (
                <Box
                  sx={{
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    color: "error.main",
                    whiteSpace: "pre-wrap",
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                  {String(toolResult)}
                </Box>
              ) : isList ? (
                <ListResult
                  total={(toolResult as any).total}
                  data={(toolResult as any).data}
                  showRaw={showRaw}
                  raw={rawResult ?? ""}
                />
              ) : typeof toolResult === "object" && toolResult !== null ? (
                <ObjectResult
                  obj={toolResult as Record<string, unknown>}
                  showRaw={showRaw}
                  raw={rawResult ?? ""}
                />
              ) : (
                <Box
                  sx={{
                    fontSize: "0.72rem",
                    whiteSpace: "pre-wrap",
                    maxHeight: 300,
                    overflow: "auto",
                    fontFamily: "monospace",
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                    padding: "0.4em",
                    borderRadius: "4px",
                  }}
                >
                  {String(toolResult)}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
