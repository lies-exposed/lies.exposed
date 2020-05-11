import CMS from "netlify-cms-app"
import { ActorPreview } from "./previews/ActorPreview"
import { TopicPreview } from "./previews/TopicPreview"


CMS.registerPreviewTemplate('topics', TopicPreview)
CMS.registerPreviewTemplate("actors", ActorPreview)
