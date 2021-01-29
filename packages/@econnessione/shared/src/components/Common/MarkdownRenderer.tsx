/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import AreasMap from "@components/AreasMap";
import { BlockQuote } from "@components/BlockQuote";
import { ListItem } from "@components/Common/ListItem";
import { CO2LeftBudgetCounter } from "@components/Counters/CO2LeftBudgetCounter";
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount";
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection";
import { CO2LevelsGraph } from "@components/Graph/CO2LevelsGraph";
import { HumanPopulationGrowthGraph } from "@components/Graph/HumanPopulationGrowthGraph";
import { SocietyCollapseForecastGraphContainer } from "@components/Graph/SocietyCollapseForecastGraph/SocietyCollapseForecastGraph";
import { MainContent } from "@components/MainContent";
import { Video } from "@components/Video/Video";
import { ActorPageContentExample } from "@components/examples/ActorPageContentExample";
import BubbleGraphExample from "@components/examples/BubbleGraphExample";
import { EventPageContentExample } from "@components/examples/EventPageContentExample";
import { EventSliderExample } from "@components/examples/EventSliderExample";
import { GroupPageContentExample } from "@components/examples/GroupPageContentExample";
import NetworkExample from "@components/examples/NetworkExample";
import { ProjectPageContentExample } from "@components/examples/ProjectPageContentExample";
import { TopicPageContentExample } from "@components/examples/TopicPageContentExample";
import { ProjectImageList } from "@components/lists/ProjectImageList";
import { Typography } from "@material-ui/core";
import { MDXProviderComponentsProp } from "@mdx-js/react";
import * as React from "react";
const MDX = require("@mdx-js/runtime").default;

export const components: MDXProviderComponentsProp = {
  // layout
  MainContent,
  // counters
  CO2LeftBudgetCounter,
  WorldPopulationCounter,
  // graphs
  CO2LevelsGraph,
  HumanPopulationGrowthGraph,
  SocietyCollapseForecastGraph: SocietyCollapseForecastGraphContainer,
  // graph examples
  NetworkExample,
  BubbleGraphExample,
  // maps
  AreasMap,
  // page content examples
  ActorPageContentExample,
  GroupPageContentExample,
  ProjectPageContentExample,
  TopicPageContentExample,
  EventPageContentExample,
  EventSliderExample,
  // lists
  ProjectImageList,
  // components
  // DisplayXSmall,
  // DisplaySmall,
  // DisplayMedium,
  // DisplayLarge,
  FullSizeSection,
  Video,
  // GQLVoyager,
  // common tags
  // p: ParagraphMedium,
  li: ListItem,
  blockquote: BlockQuote,
  h1: ({ children }) => <Typography variant="h1">{children}</Typography>,
  h2: ({ children }) => <Typography variant="h2">{children}</Typography>,
  h3: ({ children }) => <Typography variant="h3">{children}</Typography>,
  h4: ({ children }) => <Typography variant="h4">{children}</Typography>,
  h5: ({ children }) => <Typography variant="h5">{children}</Typography>,
  h6: ({ children }) => <Typography variant="h6">{children}</Typography>,
  p: ({ children }) => (
    <Typography className="body" style={{ marginBottom: 20 }}>
      {children}
    </Typography>
  ),
};

export const MarkdownRenderer: React.FC = ({ children }): JSX.Element => {
  // eslint-disable-next-line react/no-children-prop
  return <MDX components={components}>{children}</MDX>;
};
