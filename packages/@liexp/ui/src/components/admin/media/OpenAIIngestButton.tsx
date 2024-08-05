import { type ChatCompletion } from "openai/resources/index.js";
import * as React from "react";
import { useOpenAI } from "../../../hooks/useOpenAI.js";
import { OpenAIButton, type OpenAIButtonBaseProps } from "./OpenAIButton.js";

interface OpenAIPromptButtonProps extends OpenAIButtonBaseProps {
  getUserMessage: (m: string) => string;
  value: string;
  onRequest: () => void;
  onResponse: (r: ChatCompletion) => void;
}

const DEFAULT_PROMPT = `Rephrase the following text in maximum 500 chars expanding it if necessary, without inventing details:`;

export const OpenAIPromptButton: React.FC<OpenAIPromptButtonProps> = ({
  model = "gpt-4",
  prompt = DEFAULT_PROMPT,
  getUserMessage,
  onRequest,
  onResponse,
  value,
}) => {
  const [isLoading, setLoading] = React.useState(false);
  const openai = useOpenAI();

  const ingestFile = () => {
    setLoading(true);
    onRequest();
    void openai.chat.completions
      .create({
        model,
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: getUserMessage(value),
          },
        ],
      })
      .then(
        (r) => {
          onResponse(r);
          setLoading(false);
        },
        (e) => {
          // eslint-disable-next-line no-console
          console.error(e);
          setLoading(false);
        },
      );
  };

  return (
    <OpenAIButton
      label={"Ingest this file"}
      model={model}
      prompt={prompt}
      onClick={ingestFile}
      isLoading={isLoading}
    />
  );
};
