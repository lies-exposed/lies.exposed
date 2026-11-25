import * as fs from "node:fs";
import * as path from "node:path";
import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import { AIBotConfig } from "../config.js";

const helmConfigMapPath = path.resolve(
  import.meta.dirname,
  "../../../../helm/templates/services/ai-bot/ai-bot.configmap.yaml",
);

/** Extract the `ai-bot.config.json: |` block scalar from the Helm template. */
const readHelmConfig = (): unknown => {
  const template = fs.readFileSync(helmConfigMapPath, "utf-8");
  const block = /ai-bot\.config\.json: \|\n((?: {4}.*\n|\s*\n)+)/.exec(
    template,
  )?.[1];
  if (!block) {
    throw new Error("ai-bot.config.json not found in Helm ConfigMap template");
  }
  return JSON.parse(block);
};

const decode = Schema.decodeUnknownSync(AIBotConfig);

describe("AIBotConfig", () => {
  it("decodes the config shipped by the Helm ConfigMap", () => {
    expect(() => decode(readHelmConfig())).not.toThrow();
  });

  it("decodes a zeroclaw section", () => {
    const config = decode({
      ...(readHelmConfig() as object),
      zeroclaw: { enabled: true, agentId: "lies_exposed" },
    });

    expect(config.zeroclaw).toEqual({
      enabled: true,
      agentId: "lies_exposed",
    });
  });
});
