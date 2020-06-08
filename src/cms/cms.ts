import CMS from "netlify-cms-app"
import { config } from "./config"
import { EditorYoutube } from "./editor/EditorYoutube"
import { ActorPreview } from "./previews/ActorPreview"
import { ArticlePreview } from "./previews/ArticlePreview"
import { GroupPreview } from "./previews/GroupPreview"
import { TopicPreview } from "./previews/TopicPreview"
import { withStyletron } from "./withStyletron"

// eslint-disable-next-line import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires
const styles = require("!css-loader!sass-loader!../scss/main.scss")
CMS.registerPreviewStyle(styles.toString(), { raw: true })

CMS.registerPreviewTemplate("actors", withStyletron(ActorPreview))
CMS.registerPreviewTemplate("articles", withStyletron(ArticlePreview))
CMS.registerPreviewTemplate("groups", withStyletron(GroupPreview))
CMS.registerPreviewTemplate("topics", withStyletron(TopicPreview))
CMS.registerEditorComponent(EditorYoutube)

CMS.init({
  config,
})
