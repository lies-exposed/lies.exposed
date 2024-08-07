import { ImageType, PDFType } from "@liexp/shared/lib/io/http/Media.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { SuggestedEntityRelationsBox } from "../links/SuggestedEntityRelationsBox.js";
import {
  Button,
  Loading,
  useRecordContext,
  useUpdate,
} from "../react-admin.js";

export const MediaSuggestedEntityRelations: React.FC = () => {
  const record = useRecordContext<Media.Media>();
  const dataProvider = useDataProvider();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>(null);
  const [update, { isPending: isLoading }] = useUpdate();

  const finalLoading = loading || isLoading;

  const canSuggestEntities =
    record?.type &&
    (record.type === PDFType.value ||
      ImageType.types.includes(record.type as any));

  const doExtractNLPEntities = React.useCallback((): void => {
    const body =
      record?.type === PDFType.value
        ? {
            pdf: record.location,
          }
        : record?.type && ImageType.types.includes(record.type as any)
          ? {
              url: record.description,
            }
          : null;

    if (body) {
      void dataProvider
        .post("/admins/nlp/extract-entities", body)
        .then((res) => {
          setLoading(false);
          setData(res.data);
        });
    }
  }, [record?.location]);

  const doAddKeyword = React.useCallback(
    (entity: string) => {
      if (record) {
        void update("media", {
          id: record.id,
          data: {
            ...record,
            keywords: ((record.keywords as string[]) ?? []).concat([entity]),
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

  React.useEffect(() => {
    if (canSuggestEntities && !data && !finalLoading) {
      setLoading(true);
      doExtractNLPEntities();
    }
  }, [canSuggestEntities, data, finalLoading]);

  return (
    <div>
      {finalLoading ? <Loading /> : null}
      {!data ? (
        <Button onClick={doExtractNLPEntities} label="Suggest entities" />
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
