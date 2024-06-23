import * as React from "react";
import {
  Button,
  Loading,
  useDataProvider,
  useRecordContext,
  useUpdate,
} from "../react-admin.js";
import { SuggestedEntityRelationsBox } from "./SuggestedEntityRelationsBox.js";

export const LinkSuggestedEntityRelations: React.FC = () => {
  const record = useRecordContext();
  const dataProvider: any = useDataProvider();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>(null);
  const [update, { isPending: isLoading }] = useUpdate();

  const finalLoading = loading || isLoading;

  const doExtractNLPEntities = React.useCallback((): void => {
    void dataProvider
      .post("/admins/nlp/extract-entities", { url: record?.url })
      .then((res: any) => {
        setLoading(false);
        setData(res.data);
      });
  }, [record?.url]);

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
    [update, record, data],
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

  React.useEffect(() => {
    if (!data && !finalLoading) {
      setLoading(true);
      doExtractNLPEntities();
    }
  }, [data, finalLoading]);

  return (
    <div>
      {finalLoading ? <Loading /> : null}
      {!data ? (
        <Button onClick={doExtractNLPEntities} label="Suggest entities" />
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
