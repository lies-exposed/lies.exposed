import { OpenAI } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import * as React from "react";

export const OpenAIContext = React.createContext<OpenAI | null>(null);
export type { OpenAI }
