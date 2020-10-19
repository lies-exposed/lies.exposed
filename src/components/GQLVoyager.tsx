import { Block } from "baseui/block"
import { Voyager } from "graphql-voyager"
import * as React from "react"
import "graphql-voyager/dist/voyager.css"

async function introspectionProvider(query: any): Promise<any> {
  return await fetch(window.location.origin + "/___graphql", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query }),
  }).then(async (response) => await response.json())
}

export const GQLVoyager: React.FC = (props) => {
  return (
    <Block
      overrides={{
        Block: { style: { height: "400px", position: "relative" } },
      }}
    >
      <Voyager introspection={introspectionProvider} hideSettings={true} />
    </Block>
  )
}
