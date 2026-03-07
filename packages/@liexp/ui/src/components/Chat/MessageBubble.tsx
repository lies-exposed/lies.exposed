import { styled } from "../../theme/index.js";
import { Paper } from "../mui/index.js";

export const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isUser",
})<{ isUser: boolean }>(({ theme, isUser }) => ({
    padding: theme.spacing(1, 2),
    maxWidth: "70%",
    alignSelf: isUser ? "flex-end" : "flex-start",
    backgroundColor: isUser
      ? theme.palette.primary.main
      : theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
    color: isUser
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    borderRadius: theme.spacing(2),
    position: "relative",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    minWidth: 0,
    "&:hover .copy-button": {
      opacity: 1,
    },
  }),
);
