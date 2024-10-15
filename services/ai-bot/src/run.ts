import { GetLangchainProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import axios from "axios";
import * as pdf from "pdfjs-dist/legacy/build/pdf.mjs";
import { parseENV } from "./env.js";
import { processOpenAIQueue } from "./flows/processOpenAIQueue.flow.js";
import { type ClientContextRTE } from "./flows/types.js";
import { userLogin } from "./flows/userLogin.flow.js";

let token: string | null = null;

const run: ClientContextRTE<void> = pipe(
  userLogin(),
  fp.RTE.map((t) => {
    token = t;
    return token;
  }),
  fp.RTE.chain(() => processOpenAIQueue(false)),
);

void pipe(
  loadAndParseENV(parseENV)(process.cwd()),
  fp.TE.fromEither,
  fp.TE.map((env) => {
    const logger = GetLogger("ai-bot");

    logger.debug.log("ENV", env);
    const restClient = APIRESTClient({
      getAuth: () => {
        return token;
      },
      url: env.API_URL,
    });
    const apiClient = fromEndpoints(restClient)(Endpoints);

    return {
      env,
      fs: GetFSClient(),
      http: HTTPProvider(axios.create({})),
      pdf: PDFProvider({ client: pdf }),
      logger,
      apiRESTClient: restClient,
      endpointsRESTClient: apiClient,
      langchain: GetLangchainProvider({
        baseURL: env.LOCALAI_URL,
      }),
    };
  }),
  fp.TE.chain(run),
  throwTE,
)
  .then((r) => {
    // eslint-disable-next-line no-console
    console.log("Success", r);
    process.exit(0);
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.error(e);
    process.exit(1);
  });
