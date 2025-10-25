import {
  type ExtractEntitiesWithNLPInput,
  type ExtractEntitiesWithNLPOutput,
} from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useEndpointsRESTClient } from "./useEndpointRestClient.js";

interface UseNLPExtractionOptions {
  input: ExtractEntitiesWithNLPInput | null;
  autoFetch?: boolean;
}

interface UseNLPExtractionResult {
  data: ExtractEntitiesWithNLPOutput | null;
  loading: boolean;
  error: string | null;
  triggerExtraction: () => void;
  refetch: () => void;
}

export const useNLPExtraction = ({
  input,
  autoFetch = true,
}: UseNLPExtractionOptions): UseNLPExtractionResult => {
  const dataProvider = useEndpointsRESTClient();
  const [data, setData] = React.useState<ExtractEntitiesWithNLPOutput | null>(
    null,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchExistingData = React.useCallback(async () => {
    if (!input) return;

    try {
      const res = await pipe(
        dataProvider.Endpoints.Admin.Custom.GetExtractEntitiesWithNLP({
          Body: input,
        }),
        throwTE,
      );
      setData(res.data);
      setError(null);
    } catch (_err) {
      // No existing data found, this is expected
      setData(null);
    }
  }, [input, dataProvider]);

  const triggerExtraction = React.useCallback(() => {
    if (!input) return;

    // Clear any existing polling
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }

    setLoading(() => true);
    setError(() => null);

    void (async () => {
      try {
        // Trigger extraction
        await pipe(
          dataProvider.Endpoints.Admin.Custom.TriggerExtractEntitiesWithNLP({
            Body: input,
          }),
          throwTE,
        );

        // Poll for results with cleanup
        const pollForResults = (attempts = 0): void => {
          if (attempts > 10) {
            setLoading(() => false);
            setError(() => "Extraction timed out. Please try again.");
            pollingRef.current = null;
            return;
          }

          pollingRef.current = setTimeout(() => {
            void (async () => {
              try {
                const res = await pipe(
                  dataProvider.Endpoints.Admin.Custom.GetExtractEntitiesWithNLP(
                    {
                      Body: input,
                    },
                  ),
                  throwTE,
                );

                // Use functional updates to avoid stale closures
                setData(res.data);
                setLoading(() => false);
                setError(() => null);
                pollingRef.current = null;
              } catch (_err) {
                pollForResults(attempts + 1);
              }
            })();
          }, 2000); // Poll every 2 seconds
        };

        pollForResults();
      } catch (_err) {
        setLoading(() => false);
        setError(() => "Failed to trigger extraction. Please try again.");
        pollingRef.current = null;
      }
    })();
  }, [input, dataProvider]);

  const refetch = React.useCallback(() => {
    void fetchExistingData();
  }, [fetchExistingData]);

  // Auto-fetch existing data on mount or when input changes
  React.useEffect(() => {
    if (autoFetch && input && !data && !loading) {
      void fetchExistingData();
    }
  }, [autoFetch, input, data, loading, fetchExistingData]);

  // Cleanup polling timeout on unmount
  React.useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerExtraction,
    refetch,
  };
};
