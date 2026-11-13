import React, { createContext, useContext, useState, useCallback } from "react";

interface ChatPanelContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export const ChatPanelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <ChatPanelContext.Provider value={{ isOpen, toggle }}>
      {children}
    </ChatPanelContext.Provider>
  );
};

export const useChatPanel = (): ChatPanelContextValue => {
  const ctx = useContext(ChatPanelContext);
  if (!ctx) {
    throw new Error("useChatPanel must be used within a ChatPanelProvider");
  }
  return ctx;
};
