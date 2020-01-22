import React from "react"
import { Columns } from "react-bulma-components"
import Layout from "../components/Layout"
import SEO from "../components/SEO"

const IndexPage: React.FunctionComponent = () => (
  <Layout>
    <SEO title="Home" />
    <Columns>
      <Columns.Column>
        <img src="/images/gatsby-astronaut.png" />
      </Columns.Column>
    </Columns>
  </Layout>
)

export default IndexPage
