import OpenAI from "openai";
import React from "react";

export const OpenAIContext = React.createContext<OpenAI | null>(null);
