import { alpha } from "@mui/system";
import React, { useState, useEffect } from "react";
import { styled } from "../../theme/index.js";
import { Box, CircularProgress, Typography } from "../mui/index.js";

export type AgentType = "auto" | "platform" | "researcher";

export interface AgentInfo {
  name: AgentType;
  label: string;
  description: string;
}

interface AgentSelectorProps {
  selectedAgent: AgentType | null;
  onAgentChange: (agent: AgentType) => void;
  agentsUrl?: string;
  getAuthToken?: () => string | null;
}

const AgentChip = styled("button")<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    border: `1px solid ${selected ? theme.palette.secondary.main : theme.palette.divider}`,
    borderRadius: 20,
    backgroundColor: selected
      ? alpha(theme.palette.secondary.main, 0.1)
      : "transparent",
    color: selected
      ? theme.palette.secondary.main
      : theme.palette.text.secondary,
    fontSize: "0.7rem",
    fontFamily: theme.typography.fontFamily,
    fontWeight: selected ? 600 : 400,
    cursor: "pointer",
    outline: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap" as const,
    "&:hover": {
      borderColor: theme.palette.secondary.main,
      backgroundColor: alpha(theme.palette.secondary.main, 0.05),
    },
  }),
);

const AGENT_ICONS: Record<AgentType, string> = {
  auto: "🤖",
  platform: "⚙",
  researcher: "🔍",
};

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgent,
  onAgentChange,
  agentsUrl = "/api/proxy/agent/agents",
  getAuthToken,
}) => {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onAgentChangeRef = React.useRef(onAgentChange);
  onAgentChangeRef.current = onAgentChange;
  const selectedAgentRef = React.useRef(selectedAgent);
  selectedAgentRef.current = selectedAgent;

  useEffect(() => {
    let cancelled = false;

    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        const headers: HeadersInit = {};
        const token = getAuthToken?.();
        if (token) headers.Authorization = token;

        const res = await fetch(agentsUrl, { headers });
        if (cancelled || !res.ok) return;

        const raw = await res.json();
        const data = raw.body?.data ?? raw.data ?? raw;
        const list: AgentInfo[] = data.agents ?? [];

        if (!cancelled) {
          setAgents(list);
          // Auto-select first agent if none selected
          if (!selectedAgentRef.current && list.length > 0) {
            onAgentChangeRef.current(list[0].name);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchAgents();
    return () => {
      cancelled = true;
    };
  }, [agentsUrl, getAuthToken]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 0.5 }}>
        <CircularProgress size={10} />
        <Typography
          variant="caption"
          sx={{ fontSize: "0.65rem", color: "text.secondary" }}
        >
          Loading agents...
        </Typography>
      </Box>
    );
  }

  if (agents.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
        py: 0.5,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontSize: "0.65rem", color: "text.disabled", mr: 0.25 }}
      >
        Agent:
      </Typography>
      {agents.map((a) => (
        <AgentChip
          key={a.name}
          selected={selectedAgent === a.name}
          onClick={() => onAgentChange(a.name)}
          title={a.description}
        >
          <span style={{ fontSize: "0.75rem", lineHeight: 1 }}>
            {AGENT_ICONS[a.name]}
          </span>
          {a.label}
        </AgentChip>
      ))}
    </Box>
  );
};
