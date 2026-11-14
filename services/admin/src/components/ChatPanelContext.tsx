import * as React from "react";

export interface ChatPanelContextValue {
  chatOpen: boolean;
  onToggleChat: () => void;
}

export const ChatPanelContext =
  React.createContext<ChatPanelContextValue | null>(null);

export const useChatPanelContext = (): ChatPanelContextValue => {
  const ctx = React.useContext(ChatPanelContext);
  if (!ctx) {
    throw new Error(
      "useChatPanelContext must be used within a ChatPanelContext.Provider",
    );
  }
  return ctx;
};
