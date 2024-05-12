import * as PrivateGPT from "privategpt-sdk-node";

interface PrivateGPTProvider {
  health: () => Promise<any>;
  listIngested: () => Promise<any>;
}

interface PrivateGPTProviderOptions {
  client: PrivateGPT.PrivategptApiClient;
}

const GetPrivateGPTProvider = ({
  client,
}: PrivateGPTProviderOptions): PrivateGPTProvider => {

  return {
    health: async () => {
      const results = await client.health.health();
      return results;
    },
    listIngested: async () => {
      const results = await client.ingestion.listIngested();
      return results;
    },
  };
};

export { PrivateGPT, GetPrivateGPTProvider, type PrivateGPTProvider };
