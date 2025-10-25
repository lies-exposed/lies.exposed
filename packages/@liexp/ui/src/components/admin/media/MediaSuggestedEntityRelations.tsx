import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { ImageType, PDFType } from "@liexp/shared/lib/io/http/Media/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import * as React from "react";
import { useNLPExtraction } from "../../../hooks/useNLPExtraction.js";
import { SuggestedEntityRelationsBox } from "../links/SuggestedEntityRelationsBox.js";
import {
  Button,
  Loading,
  useRecordContext,
  useUpdate,
} from "../react-admin.js";

export const MediaSuggestedEntityRelations: React.FC = () => {
  const record = useRecordContext<Media.Media>();
  const [update, { isPending: isLoading }] = useUpdate();

  const canSuggestEntities =
    record?.type &&
    (record.type === PDFType.literals[0] || Schema.is(ImageType)(record.type));

  const nlpInput = React.useMemo(() => {
    if (!canSuggestEntities || !record) return null;

    if (record.type === PDFType.literals[0]) {
      return { pdf: record.location };
    }

    if (Schema.is(ImageType)(record.type) && record.description) {
      return { url: record.description as URL };
    }

    return null;
  }, [canSuggestEntities, record]);

  const { data, loading, triggerExtraction } = useNLPExtraction({
    input: nlpInput,
    autoFetch: true,
  });

  const finalLoading = loading || isLoading;

  const doAddKeyword = React.useCallback(
    (entity: string) => {
      if (record) {
        void update("media", {
          id: record.id,
          data: {
            ...record,
            keywords: (record.keywords
              ? ([...record.keywords] as string[])
              : []
            ).concat([entity]),
          },
        });
      }
    },
    [update, record, data],
  );

  const doAppendSentenceToDescription = React.useCallback(
    (sentence: string) => {
      if (record) {
        void update("media", {
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
      {data ? (
        <SuggestedEntityRelationsBox
          data={data}
          exclude={{
            entities: {
              actors: [],
              groups: [],
              keywords: record?.keywords ?? [],
            },
            sentences:
              record?.description
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
