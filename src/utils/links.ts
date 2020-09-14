import { Frontmatter } from "@models/Frontmatter"
import { ResourcesKeys } from "@models/index"

export const getAdminLink = <K extends ResourcesKeys>(
  key: K,
  f: Frontmatter
): string => {
  switch (key) {
    case "articles":
    case "events":
    case "topics":
    case "actors":
    case "groups": {
      return `/admin/#/collections/${key}/entries/${f.uuid}`
    }
    default:
      return "/admin/#/"
  }
}
