import { Common, ResourcesNames } from "@econnessione/io"
import { NavigateFn } from "@reach/router"

export const getAdminLink = <K extends ResourcesNames>(
  key: K,
  f: Common.BaseFrontmatter
): string => {
  switch (key) {
    case "articles":
    case "projects":
    case "events":
    case "topics":
    case "actors":
    case "groups": {
      return `/admin/#/collections/${key}/entries/${f.id}`
    }
    default:
      return "/admin/#/"
  }
}

export const navigateTo = async <K extends ResourcesNames>(
  nav: NavigateFn,
  resourceName: K,
  f: Common.BaseFrontmatter
): Promise<void> => {
  switch (resourceName) {
    case `articles`:
    case "events":
    case "actors":
    case "topics":
    case "projects":
    case "groups": {
      await nav(`/${resourceName}/${f.id}`)
      break
    }
    default:
      await Promise.resolve(undefined)
  }
}
