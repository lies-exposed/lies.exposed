import * as React from "react";
import { useNLPExtraction } from "../../../hooks/useNLPExtraction.js";
import {
  Button,
  Loading,
  useRecordContext,
  useUpdate,
} from "../react-admin.js";
import { SuggestedEntityRelationsBox } from "./SuggestedEntityRelationsBox.js";

export const LinkSuggestedEntityRelations: React.FC = () => {
  const record = useRecordContext();
  const [update, { isPending: isLoading }] = useUpdate();

  const nlpInput = React.useMemo(
    () => (record?.url ? { url: record.url } : null),
    [record?.url],
  );

  const { data, loading, triggerExtraction } = useNLPExtraction({
    input: nlpInput,
    autoFetch: true,
  });

  const finalLoading = loading || isLoading;

  const doAddKeyword = React.useCallback(
    (entity: string) => {
      void update("links", {
        id: record?.id,
        data: {
          ...record,
          keywords: (record?.keywords ?? []).concat([entity]),
        },
      });
    },
    [update, record],
  );

  const doAppendSentenceToDescription = React.useCallback(
    (sentence: string) => {
      if (record) {
        void update("links", {
          id: record.id,
          data: {
            ...record,
            description: `${record.description}\n\n${sentence}`,
          },
        });
      }
    },
    [update, record],
  );

  return (
    <div>
      {finalLoading ? <Loading /> : null}
      {!data ? (
        <Button onClick={triggerExtraction} label="Suggest entities" />
      ) : null}
      {data && record ? (
        <SuggestedEntityRelationsBox
          data={data}
          exclude={{
            entities: {
              actors: record.actors ?? [],
              groups: record.groups ?? [],
              keywords: record.keywords ?? [],
            },
            sentences:
              record.description
                ?.split("\n")
                .map((t: string) => ({ text: t.trim(), importance: 1 })) ?? [],
          }}
          onKeywordClick={doAddKeyword}
          onSentenceClick={doAppendSentenceToDescription}
        />
      ) : null}
    </div>
  );
};
