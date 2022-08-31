import KeywordsDistributionGraph from "@liexp/ui/components/Graph/KeywordDistributionGraph";
import { AutocompleteKeywordInput } from "@liexp/ui/components/Input/AutocompleteKeywordInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordsPage: React.FC = () => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      <AutocompleteKeywordInput
        selectedItems={[]}
        onItemClick={(k) => {
          navigateTo.keywords({ id: k[0].id });
        }}
      />
      <KeywordsDistributionGraph
        onClick={(k) => {
          navigateTo.keywords({ id: k.id });
        }}
      />
    </MainContent>
  );
};

export default KeywordsPage;
