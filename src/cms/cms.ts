import CMS from "netlify-cms-app"
import { config } from "./config"
import { EditorYoutube } from "./editor/EditorYoutube"
import mainCSS from "./previewStyle"
import { ActorPreview } from "./previews/ActorPreview"
import { GroupPreview } from "./previews/GroupPreview"
import { TopicPreview } from "./previews/TopicPreview"
import { withStyletron } from "./withStyletron"

CMS.registerPreviewStyle(mainCSS, { raw: true })
CMS.registerPreviewTemplate("actors", withStyletron(ActorPreview))
CMS.registerPreviewTemplate("groups", withStyletron(GroupPreview))
CMS.registerPreviewTemplate("topics", withStyletron(TopicPreview))
CMS.registerEditorComponent(EditorYoutube)

CMS.init({
  config,
})
