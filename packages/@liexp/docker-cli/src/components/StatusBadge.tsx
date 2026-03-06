import { Text } from "ink";

export type Status = "idle" | "running" | "success" | "error";

type Props = {
  status: Status;
  label?: string;
};

const ICONS: Record<Status, string> = {
  idle: "○",
  running: "⟳",
  success: "✔",
  error: "✘",
};

const COLORS: Record<Status, string> = {
  idle: "gray",
  running: "yellow",
  success: "green",
  error: "red",
};

export function StatusBadge({ status, label }: Props) {
  return (
    <Text color={COLORS[status]}>
      {ICONS[status]}
      {label !== undefined ? ` ${label}` : ""}
    </Text>
  );
}
