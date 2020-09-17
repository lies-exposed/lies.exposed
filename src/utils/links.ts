import { Frontmatter } from "@models/Frontmatter"
import { ResourcesNames } from "@models/index"
import { NavigateFn } from "@reach/router"

export const getAdminLink = <K extends ResourcesNames>(
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

export const navigateTo = async <K extends ResourcesNames>(
  nav: NavigateFn,
  resourceName: K,
  f: Frontmatter
): Promise<void> => {
  switch (resourceName) {
    case "articles":
    case "events":
    case "actors":
    case "topics":
    case "groups": {
      await nav(`/${resourceName}/${f.uuid}`)
      break
    }
    default:
      await Promise.resolve(undefined)
  }
}
