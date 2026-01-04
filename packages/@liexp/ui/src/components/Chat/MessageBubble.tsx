import { styled } from "../../theme/index.js";
import { Paper } from "../mui/index.js";

export const MessageBubble = styled(Paper)<{ isUser: boolean }>(
  ({ theme, isUser }) => ({
    padding: theme.spacing(1, 2),
    maxWidth: "70%",
    alignSelf: isUser ? "flex-end" : "flex-start",
    backgroundColor: isUser
      ? theme.palette.primary.main
      : theme.palette.grey[200],
    color: isUser
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    borderRadius: theme.spacing(2),
    position: "relative",
    "&:hover .copy-button": {
      opacity: 1,
    },
  }),
);
