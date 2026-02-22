import { Handle, Position } from "@xyflow/react";
import React, { memo } from "react";
import { useTheme } from "../../../../../theme/index.js";
import { getRelationshipColor } from "../../../../../theme/styleUtils.js";

const { Top, Bottom, Left, Right } = Position;

const nodeStyle: React.CSSProperties = {
  minHeight: 34,
  minWidth: 130,
  maxWidth: 150,
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 6px",
  borderRadius: 6,
  backgroundColor: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  position: "relative",
};

const avatarStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
};

const avatarPlaceholderStyle: React.CSSProperties = {
  ...avatarStyle,
  backgroundColor: "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  color: "#757575",
};

const nameStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: -7,
  right: 3,
  fontSize: 8,
  fontWeight: 600,
  color: "#fff",
  padding: "1px 4px",
  borderRadius: 3,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

type NodeRole = "root" | "spouse" | "partner" | "sibling" | "default";

const getNodeRole = (data: any): NodeRole => {
  if (data.isRoot) return "root";
  if (data.isPartner) return "partner";
  if (data.isSpouse) return "spouse";
  if (data.isSibling) return "sibling";
  return "default";
};

export const CustomNode: React.FC<{ data: any }> = memo(({ data }) => {
  const theme = useTheme();
  const { isSpouse, isSibling, fullName, avatar, direction } = data;

  const isTreeHorizontal = direction === "LR";
  
  // Get theme-based border colors
  const role = getNodeRole(data);
  let borderColor: string;
  if (role === "root") {
    borderColor = theme.palette.primary.main;
  } else if (role === "default") {
    borderColor = theme.palette.grey[300];
  } else {
    // For spouse, partner, sibling - use relationship colors
    borderColor = getRelationshipColor(theme, role as any);
  }

  const getTargetPosition = () => {
    if (isSpouse) {
      return isTreeHorizontal ? Top : Left;
    } else if (isSibling) {
      return isTreeHorizontal ? Bottom : Right;
    }
    return isTreeHorizontal ? Left : Top;
  };

  const isRootNode = data?.isRoot;
  const hasChildren = !!data?.children?.length;
  const hasSiblings = !!data?.siblings?.length;
  const hasSpouses = !!data?.spouses?.length;

  const displayName = fullName ?? data.label ?? data.name;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const badgeLabel = role !== "root" && role !== "default" ? role : null;
  // Get badge color (same as border color for consistency)
  const badgeColor = borderColor;

  return (
    <div className="nodrag">
      {hasChildren && (
        <Handle
          type="source"
          position={isTreeHorizontal ? Right : Bottom}
          id={isTreeHorizontal ? Right : Bottom}
        />
      )}

      {hasSpouses && (
        <Handle
          type="source"
          position={isTreeHorizontal ? Bottom : Right}
          id={isTreeHorizontal ? Bottom : Right}
        />
      )}

      {hasSiblings && (
        <Handle
          type="source"
          position={isTreeHorizontal ? Top : Left}
          id={isTreeHorizontal ? Top : Left}
        />
      )}

      {!isRootNode && (
        <Handle
          type="target"
          position={getTargetPosition()}
          id={getTargetPosition()}
        />
      )}

      <div
        style={{
          ...nodeStyle,
          border: `${isRootNode ? 2 : 1.5}px solid ${borderColor}`,
        }}
      >
        {badgeLabel && (
          <span
            style={{
              ...badgeStyle,
              backgroundColor: badgeColor,
            }}
          >
            {badgeLabel}
          </span>
        )}
        {avatar ? (
          <img src={avatar} alt={displayName} style={avatarStyle} />
        ) : (
          <div style={avatarPlaceholderStyle}>{initials}</div>
        )}
        <span style={nameStyle}>{displayName}</span>
      </div>
    </div>
  );
});
