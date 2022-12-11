import KeywordsDistributionGraph from "@liexp/ui/components/Graph/KeywordDistributionGraph";
import { AutocompleteKeywordInput } from "@liexp/ui/components/Input/AutocompleteKeywordInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordsPage: React.FC = () => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      {/* <PageContent path="keywords" /> */}

      <Box margin={10}>
        <AutocompleteKeywordInput
          selectedItems={[]}
          onChange={(k) => {
            navigateTo.keywords({ id: k[0].id });
          }}
        />
      </Box>

      {/* <Box style={{ height: 600 }}>
        <EventNetworkGraphBox
          count={10}
          groupBy="keyword"
          includeEmptyRelations={false}
        />
      </Box> */}

      <KeywordsDistributionGraph
        onClick={(k) => {
          navigateTo.keywords({ id: k.id });
        }}
      />
    </MainContent>
  );
};

export default KeywordsPage;
