/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Typography } from "@material-ui/core";
import { MDXProviderComponentsProp } from "@mdx-js/react";
import * as React from "react";
import AreasMap from "../AreasMap";
import { BlockQuote } from "../BlockQuote";
import { ListItem } from "../Common/ListItem";
import { CO2LeftBudgetCounter } from "../Counters/CO2LeftBudgetCounter";
import { WorldPopulationCounter } from "../Counters/WorldPopulationCount";
import { FullSizeSection } from "../FullSizeSection/FullSizeSection";
import { CO2LevelsGraph } from "../Graph/CO2LevelsGraph";
import { HumanPopulationGrowthGraph } from "../Graph/HumanPopulationGrowthGraph";
import { SocietyCollapseForecastGraphContainer } from "../Graph/SocietyCollapseForecastGraph/SocietyCollapseForecastGraph";
import { MainContent } from "../MainContent";
import { Video } from "../Video/Video";
import { ActorPageContentExample } from "../examples/ActorPageContentExample";
import BubbleGraphExample from "../examples/BubbleGraphExample";
import { EventPageContentExample } from "../examples/EventPageContentExample";
import { EventSliderExample } from "../examples/EventSliderExample";
import { GroupPageContentExample } from "../examples/GroupPageContentExample";
import NetworkExample from "../examples/NetworkExample";
import { ProjectPageContentExample } from "../examples/ProjectPageContentExample";
import { TopicPageContentExample } from "../examples/TopicPageContentExample";
import { ProjectImageList } from "../lists/ProjectImageList";
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
