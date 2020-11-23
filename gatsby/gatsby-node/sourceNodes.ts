import { group } from "@utils/common"
import * as A from "fp-ts/lib/Array"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { Node, SourceNodesArgs } from "gatsby"

export const sourceNodes = ({
  actions,
  getNodesByType,
}: SourceNodesArgs): void => {
  const { createNodeField } = actions

  pipe(
    getNodesByType("Mdx"),
    group(
      Eq.contramap<string, Node>((n) => (n.fields as any).collection as string)(
        Eq.eqString
      )
    ),
    A.map((n) => {
      const firstNode = A.head(n)
      if (O.isSome(firstNode)) {
        const collection = (firstNode.value as any).fields.collection
        switch (collection) {
          case "events": {
            n.forEach((e) => {
              createNodeField({
                node: e,
                name: `actors`,
                value: (e.frontmatter as any).actors ?? [],
              })

              createNodeField({
                node: e,
                name: `groups`,
                value: (e.frontmatter as any).groups ?? [],
              })

              createNodeField({
                node: e,
                name: `topics`,
                value: (e.frontmatter as any).topics ?? [],
              })
            })
            break
          }

          case "groups": {
            n.forEach((e) => {
              createNodeField({
                node: e,
                name: `members`,
                value: (e.frontmatter as any).members ?? [],
              })
            })
            break
          }

          case "areas": {
            n.forEach((e) => {
              createNodeField({
                node: e,
                name: `topics`,
                value: (e.frontmatter as any).topics ?? [],
              })

              createNodeField({
                node: e,
                name: `groups`,
                value: (e.frontmatter as any).groups ?? [],
              })
            })
            break
          }
        }
      }
    })
  )
}
