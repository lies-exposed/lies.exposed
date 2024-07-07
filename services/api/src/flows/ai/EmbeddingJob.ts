import { type Queue } from "@liexp/shared/lib/io/http/index.js";

export interface EmbeddingJob extends Queue.Queue {
  data: {
    question?: string;
    type: "link" | "pdf";
    url: string;
    result?: string;
    id: string;
  };
}
