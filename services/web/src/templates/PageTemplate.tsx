import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { PageMD } from "@econnessione/io"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { PageProps } from "gatsby"
import React from "react"
import Helmet from "react-helmet"

interface PageTemplateProps extends PageMD {}

const PageTemplate: React.FC<PageProps<unknown, PageTemplateProps>> = ({
  pageContext,
}) => {
  return (
    <Layout>
      <Helmet>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </Helmet>
      <SEO title="Home" />
      <FlexGrid width="100%" flexGridColumnCount={1}>
        <FlexGridItem paddingTop="70px">
            <PageContent {...pageContext} />
        </FlexGridItem>
      </FlexGrid>
    </Layout>
  )
}

export default PageTemplate
