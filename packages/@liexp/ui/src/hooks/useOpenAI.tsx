import * as React from "react";
import { OpenAIContext, type OpenAI } from "../context/OpenAIContext";

export const useOpenAI = (): OpenAI => {
  const openai = React.useContext(OpenAIContext);
  return React.useMemo(() => {
    if (!openai) {
      throw new Error("useOpenAI must be used within a OpenAIProvider");
    }
    return openai;
  }, []);
};
