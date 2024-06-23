import OpenAI from "openai";
import * as React from "react";

export const OpenAIContext = React.createContext<OpenAI | null>(null);
