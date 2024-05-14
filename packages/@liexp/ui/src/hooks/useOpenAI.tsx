import {
  OpenAI
} from "@liexp/shared/lib/providers/openai/openai.provider.js";
import React from "react";
import { OpenAIContext } from "../context/OpenAIContext";

export const useOpenAI = (): OpenAI => {
  const openai = React.useContext(OpenAIContext);
  return React.useMemo(() => {
    if (!openai) {
      throw new Error("useOpenAI must be used within a OpenAIProvider");
    }
    return openai;
  }, []);
};
