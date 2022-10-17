import { uuid } from "@liexp/shared/utils/uuid";
import * as R from "fp-ts/Record";
import * as React from "react";
import {
  KeywordPageContent,
  KeywordPageContentProps,
} from "../KeywordPageContent";

export const keywordPageContentArgs: KeywordPageContentProps = {
  id: uuid(),
  tag: "fake-tag",
} as any;

export const KeywordPageContentExample: React.FC<KeywordPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? keywordPageContentArgs
    : props;

  return <KeywordPageContent {...pageContentProps} />;
};
